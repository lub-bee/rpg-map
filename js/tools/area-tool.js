import { getState, dispatch } from '../core/state.js';
import { screenToWorld } from '../canvas/coords.js';
import { getCamera } from '../canvas/renderer.js';
import { detectAreas } from '../entities/area.js';
import { createArea } from '../data/schema.js';

function pointInPolygon(px, py, nodeIds, nodes) {
  const pts = nodeIds.map(id => nodes.find(n => n.id === id)).filter(Boolean);
  if (pts.length < 3) return false;

  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i].x, yi = pts[i].y;
    const xj = pts[j].x, yj = pts[j].y;
    const intersect = ((yi > py) !== (yj > py)) &&
      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function randomColor() {
  const h = Math.floor(Math.random() * 360);
  return `hsla(${h}, 70%, 55%, 0.35)`;
}

function onClick(e) {
  if (getState().ui.activeTool !== 'area') return;

  const rect = e.currentTarget.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  const camera = getCamera();
  const { x: wx, y: wy } = screenToWorld(sx, sy, camera);

  const state = getState();
  const level = state.map.levels[state.ui.activeLevelIndex];
  const cycles = detectAreas(level.nodes, level.walls);

  const hits = cycles.filter(cycle => pointInPolygon(wx, wy, cycle, level.nodes));
  if (hits.length === 0) return;
  const matched = hits.reduce((a, b) => a.length <= b.length ? a : b);

  const name = window.prompt('Area name:', 'Zone');
  if (!name) return;

  const area = createArea(name, matched, randomColor());
  dispatch({ type: 'ADD_AREA', payload: area });
}

export function initAreaTool(canvas) {
  canvas.addEventListener('click', onClick);

  return function detach() {
    canvas.removeEventListener('click', onClick);
  };
}

export function setAreaTool() {
  dispatch({ type: 'SET_TOOL', payload: 'area' });
}
