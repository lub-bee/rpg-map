import { getState, dispatch } from '../core/state.js';
import { execute } from '../core/history.js';
import { addLayerRenderer, getCamera } from '../canvas/renderer.js';
import { snapScreenToGrid } from '../canvas/snap.js';
import { createNode } from '../data/schema.js';
import { createArcWall } from '../entities/arc-wall.js';
import { worldToScreen } from '../canvas/coords.js';

let _step = 0;
let _nodeA = null;
let _nodeB = null;
let _ghostPos = null;

const TEXTURE_PREVIEW = 'rgba(100, 160, 255, 0.7)';

function getLevel() {
  const state = getState();
  return state.map.levels[state.ui.activeLevelIndex];
}

function addNodeCmd(node) {
  execute({
    execute(state) {
      return {
        map: {
          ...state.map,
          levels: state.map.levels.map((lvl, i) =>
            i === state.ui.activeLevelIndex
              ? { ...lvl, nodes: [...lvl.nodes, node] }
              : lvl
          ),
        },
      };
    },
    undo(state) {
      return {
        map: {
          ...state.map,
          levels: state.map.levels.map((lvl, i) =>
            i === state.ui.activeLevelIndex
              ? { ...lvl, nodes: lvl.nodes.filter(n => n.id !== node.id) }
              : lvl
          ),
        },
      };
    },
  });
}

function addArcWallCmd(wall) {
  execute({
    execute(state) {
      return {
        map: {
          ...state.map,
          levels: state.map.levels.map((lvl, i) =>
            i === state.ui.activeLevelIndex
              ? { ...lvl, walls: [...lvl.walls, wall] }
              : lvl
          ),
        },
      };
    },
    undo(state) {
      return {
        map: {
          ...state.map,
          levels: state.map.levels.map((lvl, i) =>
            i === state.ui.activeLevelIndex
              ? { ...lvl, walls: lvl.walls.filter(w => w.id !== wall.id) }
              : lvl
          ),
        },
      };
    },
  });
}

function snapFromEvent(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  const camera = getCamera();
  const gridSize = getState().ui.gridSize;
  return snapScreenToGrid(sx, sy, camera, gridSize);
}

function onMouseMove(e) {
  if (getState().ui.activeTool !== 'arc') return;
  if (_step === 0) return;
  const { wx, wy } = snapFromEvent(e);
  _ghostPos = { wx, wy };
}

function onMouseLeave() {
  _ghostPos = null;
}

function onClick(e) {
  if (getState().ui.activeTool !== 'arc') return;

  const { wx, wy } = snapFromEvent(e);

  if (_step === 0) {
    const node = createNode(wx, wy);
    addNodeCmd(node);
    _nodeA = node;
    _step = 1;
    return;
  }

  if (_step === 1) {
    const node = createNode(wx, wy);
    addNodeCmd(node);
    _nodeB = node;
    _step = 2;
    return;
  }

  if (_step === 2) {
    const samePoint = _nodeA.x === _nodeB.x && _nodeA.y === _nodeB.y;

    if (samePoint) {
      // Full circle: cx/cy is the center, radius = distance from center to A
      const wall = createArcWall(_nodeA.id, _nodeB.id, wx, wy);
      addArcWallCmd(wall);
    } else {
      const wall = createArcWall(_nodeA.id, _nodeB.id, wx, wy);
      addArcWallCmd(wall);
    }

    _step = 0;
    _nodeA = null;
    _nodeB = null;
    _ghostPos = null;
  }
}

function onContextMenu(e) {
  e.preventDefault();
  if (getState().ui.activeTool !== 'arc') return;
  _step = 0;
  _nodeA = null;
  _nodeB = null;
  _ghostPos = null;
  dispatch({ type: 'SET_TOOL', payload: null });
}

function onKeyDown(e) {
  if (e.key === 'Escape' && getState().ui.activeTool === 'arc') {
    _step = 0;
    _nodeA = null;
    _nodeB = null;
    _ghostPos = null;
  }
}

function renderPreview(ctx, canvas, camera, state) {
  if (state.ui.activeTool !== 'arc') return;
  if (_step === 0 || !_ghostPos) return;

  const level = state.map.levels[state.ui.activeLevelIndex];
  const nodes = level.nodes;

  ctx.save();

  if (_step === 1) {
    const nodeA = nodes.find(n => n.id === _nodeA.id);
    if (!nodeA) { ctx.restore(); return; }
    const from = worldToScreen(nodeA.x, nodeA.y, camera);
    const to   = worldToScreen(_ghostPos.wx, _ghostPos.wy, camera);

    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = TEXTURE_PREVIEW;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  if (_step === 2) {
    const nodeA = nodes.find(n => n.id === _nodeA.id);
    const nodeB = nodes.find(n => n.id === _nodeB.id);
    if (!nodeA || !nodeB) { ctx.restore(); return; }

    const worldC = { x: _ghostPos.wx, y: _ghostPos.wy };
    const distA = Math.hypot(nodeA.x - worldC.x, nodeA.y - worldC.y);
    const distB = Math.hypot(nodeB.x - worldC.x, nodeB.y - worldC.y);
    const radius = (distA + distB) / 2;

    if (radius > 0.001) {
      const angleA = Math.atan2(nodeA.y - worldC.y, nodeA.x - worldC.x);
      const angleB = Math.atan2(nodeB.y - worldC.y, nodeB.x - worldC.x);

      let delta = angleB - angleA;
      while (delta > Math.PI)  delta -= 2 * Math.PI;
      while (delta < -Math.PI) delta += 2 * Math.PI;
      const anticlockwise = delta < 0;

      const center = worldToScreen(worldC.x, worldC.y, camera);
      const radiusScreen = radius * camera.zoom;

      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = TEXTURE_PREVIEW;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(center.x, center.y, radiusScreen, angleA, angleB, anticlockwise);
      ctx.stroke();
    }

    // Draw crosshair at ghost center
    const cPos = worldToScreen(_ghostPos.wx, _ghostPos.wy, camera);
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(255, 200, 80, 0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cPos.x, cPos.y, 4, 0, Math.PI * 2);
    ctx.stroke();

    // Lines from center to A and B to show the radius arms
    const posA = worldToScreen(nodeA.x, nodeA.y, camera);
    const posB = worldToScreen(nodeB.x, nodeB.y, camera);
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = 'rgba(255, 200, 80, 0.4)';
    ctx.beginPath();
    ctx.moveTo(cPos.x, cPos.y);
    ctx.lineTo(posA.x, posA.y);
    ctx.moveTo(cPos.x, cPos.y);
    ctx.lineTo(posB.x, posB.y);
    ctx.stroke();
  }

  ctx.restore();
}

export function initArcTool(canvas) {
  addLayerRenderer(renderPreview);

  canvas.addEventListener('click', onClick);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseleave', onMouseLeave);
  canvas.addEventListener('contextmenu', onContextMenu);
  document.addEventListener('keydown', onKeyDown);

  return function detach() {
    canvas.removeEventListener('click', onClick);
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('mouseleave', onMouseLeave);
    canvas.removeEventListener('contextmenu', onContextMenu);
    document.removeEventListener('keydown', onKeyDown);
  };
}
