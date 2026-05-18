import { getState, dispatch } from '../core/state.js';
import { execute } from '../core/history.js';
import { on } from '../core/events.js';
import { addLayerRenderer, getCamera } from '../canvas/renderer.js';
import { snapScreenToGrid, isNearNode } from '../canvas/snap.js';
import { createNode, createWall } from '../data/schema.js';
import { worldToScreen } from '../canvas/coords.js';

let _chain = [];
let _ghostPos = null;
let _defaultTexture = 'grid';

function addNode(node) {
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

function addWall(wall) {
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

function getNodes() {
  const state = getState();
  return state.map.levels[state.ui.activeLevelIndex].nodes;
}

function onMouseMove(e) {
  if (getState().ui.activeTool !== 'wall') return;
  if (_chain.length === 0) return;

  const rect = e.currentTarget.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  const camera = getCamera();
  const gridSize = getState().ui.gridSize;
  const { wx, wy } = snapScreenToGrid(sx, sy, camera, gridSize);
  _ghostPos = { wx, wy };
}

function onMouseLeave() {
  _ghostPos = null;
}

function onClick(e) {
  if (getState().ui.activeTool !== 'wall') return;

  const rect = e.currentTarget.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  const camera = getCamera();
  const gridSize = getState().ui.gridSize;
  const { wx, wy } = snapScreenToGrid(sx, sy, camera, gridSize);

  const nodes = getNodes();

  if (_chain.length > 0) {
    const originNode = nodes.find(n => n.id === _chain[0]);
    if (originNode && isNearNode(wx, wy, [originNode], camera, gridSize)) {
      const wall = createWall(_chain[_chain.length - 1], _chain[0], { texture: _defaultTexture });
      addWall(wall);
      _chain = [];
      _ghostPos = null;
      return;
    }
  }

  const newNode = createNode(wx, wy);
  addNode(newNode);

  if (_chain.length > 0) {
    const wall = createWall(_chain[_chain.length - 1], newNode.id, { texture: _defaultTexture });
    addWall(wall);
  }

  _chain.push(newNode.id);
}

function onKeyDown(e) {
  if (e.key === 'Escape' && getState().ui.activeTool === 'wall') {
    _chain = [];
    _ghostPos = null;
  }
}

function renderPreview(ctx, canvas, camera, state) {
  if (_chain.length === 0 || !_ghostPos) return;

  const nodes = state.map.levels[state.ui.activeLevelIndex].nodes;
  const lastNode = nodes.find(n => n.id === _chain[_chain.length - 1]);
  if (!lastNode) return;

  const from = worldToScreen(lastNode.x, lastNode.y, camera);
  const to = worldToScreen(_ghostPos.wx, _ghostPos.wy, camera);

  ctx.save();
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = 'rgba(100, 160, 255, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.restore();

  // Highlight origin node when cursor is near it
  if (_chain.length > 1) {
    const originNode = nodes.find(n => n.id === _chain[0]);
    if (originNode && isNearNode(_ghostPos.wx, _ghostPos.wy, [originNode], camera, state.ui.gridSize)) {
      const pos = worldToScreen(originNode.x, originNode.y, camera);
      ctx.save();
      ctx.strokeStyle = 'rgba(100, 220, 100, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}

export function initWallTool(canvas) {
  on('tool:set-default-texture', (texture) => { _defaultTexture = texture; });
  addLayerRenderer(renderPreview);

  canvas.addEventListener('click', onClick);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseleave', onMouseLeave);
  document.addEventListener('keydown', onKeyDown);

  return function detach() {
    canvas.removeEventListener('click', onClick);
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('mouseleave', onMouseLeave);
    document.removeEventListener('keydown', onKeyDown);
  };
}
