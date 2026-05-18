import { getState } from '../core/state.js';
import { execute } from '../core/history.js';
import { getCamera, addLayerRenderer } from '../canvas/renderer.js';
import { snapScreenToGrid } from '../canvas/snap.js';
import { worldToScreen } from '../canvas/coords.js';
import { createDecorNode, LAYER } from '../data/schema.js';
import { PRESETS } from '../data/presets.js';

let _selectedPreset = null;
let _ghostPos = null;

export function setDecorSelection(preset) {
  _selectedPreset = preset;
}

function placeNode(node) {
  execute({
    execute(s) {
      const idx = s.ui.activeLevelIndex;
      return {
        map: {
          ...s.map,
          levels: s.map.levels.map((lvl, i) =>
            i === idx
              ? { ...lvl, decorNodes: [...lvl.decorNodes, node] }
              : lvl
          ),
        },
      };
    },
  });
}

function onClick(e) {
  const state = getState();
  if (state.ui.activeTool !== 'decor') return;
  if (!_selectedPreset) return;

  const rect = e.currentTarget.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  const camera = getCamera();
  const { wx, wy } = snapScreenToGrid(sx, sy, camera, state.ui.gridSize);

  if (_selectedPreset.type === 'single') {
    const node = createDecorNode(wx, wy, _selectedPreset.elementType, _selectedPreset.layer ?? state.ui.activeLayer);
    placeNode(node);
  } else if (_selectedPreset.type === 'group') {
    const preset = PRESETS[_selectedPreset.key];
    if (!preset) return;

    const gridSize = state.ui.gridSize;
    const nodes = preset.elements.map(el => {
      const ex = wx + el.dx * gridSize;
      const ey = wy + el.dy * gridSize;
      return createDecorNode(ex, ey, el.elementType, LAYER.FURNITURE);
    });

    // First node stores the IDs of all sibling nodes
    if (nodes.length > 0) {
      nodes[0].children = nodes.slice(1).map(n => n.id);
    }

    for (const node of nodes) {
      placeNode(node);
    }
  }
}

function onMouseMove(e) {
  const state = getState();
  if (state.ui.activeTool !== 'decor') {
    _ghostPos = null;
    return;
  }

  const rect = e.currentTarget.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  const camera = getCamera();
  const { wx, wy } = snapScreenToGrid(sx, sy, camera, state.ui.gridSize);
  _ghostPos = { wx, wy };
}

addLayerRenderer((ctx, canvas, camera, state) => {
  if (state.ui.activeTool !== 'decor') return;
  if (!_ghostPos || !_selectedPreset) return;

  ctx.save();
  ctx.globalAlpha = 0.5;

  const gridSize = state.ui.gridSize;

  if (_selectedPreset.type === 'single') {
    const { x: sx, y: sy } = worldToScreen(_ghostPos.wx, _ghostPos.wy, camera);
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 1.5;
    const half = 8;
    ctx.beginPath();
    ctx.moveTo(sx - half, sy);
    ctx.lineTo(sx + half, sy);
    ctx.moveTo(sx, sy - half);
    ctx.lineTo(sx, sy + half);
    ctx.stroke();
  } else if (_selectedPreset.type === 'group') {
    const preset = PRESETS[_selectedPreset.key];
    if (!preset) { ctx.restore(); return; }

    for (const el of preset.elements) {
      const ex = _ghostPos.wx + el.dx * gridSize;
      const ey = _ghostPos.wy + el.dy * gridSize;
      const { x: sx, y: sy } = worldToScreen(ex, ey, camera);
      ctx.strokeStyle = '#e94560';
      ctx.lineWidth = 1.5;
      const half = 6;
      ctx.beginPath();
      ctx.moveTo(sx - half, sy);
      ctx.lineTo(sx + half, sy);
      ctx.moveTo(sx, sy - half);
      ctx.lineTo(sx, sy + half);
      ctx.stroke();
    }
  }

  ctx.restore();
});

export function initDecorTool(canvas) {
  canvas.addEventListener('click', onClick);
  canvas.addEventListener('mousemove', onMouseMove);

  return function detach() {
    canvas.removeEventListener('click', onClick);
    canvas.removeEventListener('mousemove', onMouseMove);
  };
}
