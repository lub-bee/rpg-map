import { getState } from '../core/state.js';
import { execute } from '../core/history.js';
import { getCamera } from '../canvas/renderer.js';
import { snapScreenToGrid } from '../canvas/snap.js';
import { createNode } from '../data/schema.js';

function onClick(e) {
  const state = getState();
  if (state.ui.activeTool !== 'decor') return;

  const rect = e.currentTarget.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  const camera = getCamera();
  const { wx, wy } = snapScreenToGrid(sx, sy, camera, state.ui.gridSize);

  const node = createNode(wx, wy, { free: true, layer: state.ui.activeLayer });

  execute({
    execute(s) {
      return {
        map: {
          ...s.map,
          levels: s.map.levels.map((lvl, i) =>
            i === s.ui.activeLevelIndex
              ? { ...lvl, nodes: [...lvl.nodes, node] }
              : lvl
          ),
        },
      };
    },
    undo(s) {
      return {
        map: {
          ...s.map,
          levels: s.map.levels.map((lvl, i) =>
            i === s.ui.activeLevelIndex
              ? { ...lvl, nodes: lvl.nodes.filter(n => n.id !== node.id) }
              : lvl
          ),
        },
      };
    },
  });
}

export function initFreeNodeTool(canvas) {
  canvas.addEventListener('click', onClick);

  return function detach() {
    canvas.removeEventListener('click', onClick);
  };
}
