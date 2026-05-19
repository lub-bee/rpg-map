import { ELEMENT_TYPE, createWallElement } from '../data/schema.js';
import { getState, dispatch, subscribe } from '../core/state.js';

function getSelectedWall() {
  const state = getState();
  const id = state.ui.selectedIds[0];
  if (!id) return null;
  const level = state.map.levels[state.ui.activeLevelIndex];
  const direct = level.walls.find(w => w.id === id);
  if (direct) return direct;
  return level.walls.find(w => w.from === id || w.to === id) ?? null;
}

export function initElementPanel() {
  const grid = document.getElementById('element-btns');
  if (!grid) return;

  const buttons = grid.querySelectorAll('.element-btn[data-element]');

  for (const btn of buttons) {
    btn.addEventListener('click', () => {
      const wall = getSelectedWall();
      if (!wall) return;
      const type = btn.dataset.element;
      const element = createWallElement(type, 0.5);
      dispatch({
        type: 'UPDATE_ENTITY',
        payload: { id: wall.id, elements: [...wall.elements, element] },
      });
    });
  }

  function updateState() {
    const hasWall = getSelectedWall() !== null;
    for (const btn of buttons) {
      btn.style.opacity = hasWall ? '' : '0.4';
      btn.style.pointerEvents = hasWall ? '' : 'none';
    }
  }

  subscribe(updateState);
  updateState();
}
