import { getState, dispatch } from '../core/state.js';
import { execute, executeWithBefore } from '../core/history.js';
import { getCamera, addLayerRenderer } from '../canvas/renderer.js';
import { screenToWorld, worldToScreen, snapToGrid } from '../canvas/coords.js';
import { isNearNode } from '../canvas/snap.js';

let _hoverId = null;

function getLevel() {
  const state = getState();
  return state.map.levels[state.ui.activeLevelIndex];
}

function screenCoords(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  return { sx: e.clientX - rect.left, sy: e.clientY - rect.top };
}

function distPointSegmentScreen(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function findEntityAt(sx, sy, camera, gridSize) {
  const world = screenToWorld(sx, sy, camera);
  const level = getLevel();

  const hitNode = isNearNode(world.x, world.y, level.nodes, camera, gridSize, 10);
  if (hitNode) return hitNode.id;

  const hitDecor = isNearNode(world.x, world.y, level.decorNodes ?? [], camera, gridSize, 10);
  if (hitDecor) return hitDecor.id;

  for (const wall of level.walls) {
    const fromNode = level.nodes.find(n => n.id === wall.from);
    const toNode = level.nodes.find(n => n.id === wall.to);
    if (!fromNode || !toNode) continue;
    const from = worldToScreen(fromNode.x, fromNode.y, camera);
    const to = worldToScreen(toNode.x, toNode.y, camera);
    const dist = distPointSegmentScreen(sx, sy, from.x, from.y, to.x, to.y);
    if (dist < 8) return wall.id;
  }

  return null;
}

let _dragState = null;
let _dragConsumed = false;

function onMouseDown(e) {
  if (getState().ui.activeTool !== 'select') return;
  if (e.button !== 0) return;

  const { sx, sy } = screenCoords(e);
  const camera = getCamera();
  const state = getState();
  const gridSize = state.ui.gridSize;
  const world = screenToWorld(sx, sy, camera);

  const level = getLevel();
  const hitNode = isNearNode(world.x, world.y, level.nodes, camera, gridSize, 10);
  if (!hitNode) return;

  const selectedIds = state.ui.selectedIds;
  if (!selectedIds.includes(hitNode.id)) return;

  _dragState = {
    nodeId: hitNode.id,
    originX: hitNode.x,
    originY: hitNode.y,
    mapBefore: getState().map,
    moved: false,
  };

  e.preventDefault();
}

function onMouseMove(e) {
  const state = getState();
  if (state.ui.activeTool !== 'select') {
    _hoverId = null;
    return;
  }

  const { sx, sy } = screenCoords(e);
  const camera = getCamera();
  const gridSize = state.ui.gridSize;

  if (_dragState) {
    const world = screenToWorld(sx, sy, camera);
    const snapped = snapToGrid(world.x, world.y, gridSize);
    if (snapped.x !== _dragState.lastX || snapped.y !== _dragState.lastY) {
      _dragState.lastX = snapped.x;
      _dragState.lastY = snapped.y;
      _dragState.moved = true;
      dispatch({ type: 'UPDATE_ENTITY', payload: { id: _dragState.nodeId, x: snapped.x, y: snapped.y } });
    }
    return;
  }

  const newHover = findEntityAt(sx, sy, camera, gridSize);
  if (newHover !== _hoverId) {
    _hoverId = newHover;
    dispatch({ type: 'SET_HOVER', payload: _hoverId });
  }
}

function onMouseUp(e) {
  if (!_dragState) return;
  if (e.button !== 0) return;

  if (_dragState.moved) {
    const nodeId = _dragState.nodeId;
    const finalX = _dragState.lastX ?? _dragState.originX;
    const finalY = _dragState.lastY ?? _dragState.originY;
    const mapBefore = _dragState.mapBefore;

    executeWithBefore({
      execute(s) {
        const idx = s.ui.activeLevelIndex;
        return {
          map: {
            ...s.map,
            levels: s.map.levels.map((lvl, i) =>
              i === idx
                ? { ...lvl, nodes: lvl.nodes.map(n => n.id === nodeId ? { ...n, x: finalX, y: finalY } : n) }
                : lvl
            ),
          },
        };
      },
    }, mapBefore);
  }

  if (_dragState.moved) _dragConsumed = true;
  _dragState = null;
}

function onClick(e) {
  if (getState().ui.activeTool !== 'select') return;
  if (_dragConsumed) { _dragConsumed = false; return; }

  const { sx, sy } = screenCoords(e);
  const camera = getCamera();
  const state = getState();
  const id = findEntityAt(sx, sy, camera, state.ui.gridSize);

  if (id === null) {
    dispatch({ type: 'SET_SELECTED', payload: [] });
    return;
  }

  if (e.shiftKey) {
    const current = state.ui.selectedIds;
    const next = current.includes(id)
      ? current.filter(x => x !== id)
      : [...current, id];
    dispatch({ type: 'SET_SELECTED', payload: next });
  } else {
    dispatch({ type: 'SET_SELECTED', payload: [id] });
  }
}

function onKeyDown(e) {
  if (getState().ui.activeTool !== 'select') return;
  if (e.target.closest('input, textarea, select')) return;
  if (e.key !== 'Delete' && e.key !== 'Backspace') return;

  const state = getState();
  const ids = [...state.ui.selectedIds];
  if (ids.length === 0) return;

  e.preventDefault();

  const level = getLevel();
  const wallIdsToDelete = new Set();

  for (const id of ids) {
    const isNode = level.nodes.some(n => n.id === id);
    if (isNode) {
      for (const wall of level.walls) {
        if (wall.from === id || wall.to === id) {
          wallIdsToDelete.add(wall.id);
        }
      }
    }
  }

  const allIds = [...ids, ...wallIdsToDelete];

  execute({
    execute(s) {
      const idx = s.ui.activeLevelIndex;
      return {
        map: {
          ...s.map,
          levels: s.map.levels.map((lvl, i) => {
            if (i !== idx) return lvl;
            return {
              ...lvl,
              nodes: lvl.nodes.filter(n => !allIds.includes(n.id)),
              walls: lvl.walls.filter(w => !allIds.includes(w.id)),
              decorNodes: lvl.decorNodes.filter(d => !allIds.includes(d.id)),
              areas: lvl.areas.filter(a => !allIds.includes(a.id)),
            };
          }),
        },
      };
    },
  });

  dispatch({ type: 'SET_SELECTED', payload: [] });
}

function renderHover(ctx, canvas, camera, state) {
  if (state.ui.activeTool !== 'select') return;
  const hoverId = state.ui._hoverNodeId;
  if (!hoverId) return;

  const level = state.map.levels[state.ui.activeLevelIndex];
  if (!level) return;

  const node = level.nodes.find(n => n.id === hoverId)
    ?? level.decorNodes?.find(n => n.id === hoverId);

  if (!node) return;

  const { x, y } = worldToScreen(node.x, node.y, camera);

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, 14, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

export function initSelectTool(canvas) {
  addLayerRenderer(renderHover);

  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('click', onClick);
  document.addEventListener('keydown', onKeyDown);

  return function detach() {
    canvas.removeEventListener('mousedown', onMouseDown);
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('mouseup', onMouseUp);
    canvas.removeEventListener('click', onClick);
    document.removeEventListener('keydown', onKeyDown);
  };
}
