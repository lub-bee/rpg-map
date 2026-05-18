import { ELEMENT_TYPE, createWallElement } from '../data/schema.js';
import { getState, dispatch, subscribe } from '../core/state.js';

const ELEMENT_LABELS = {
  [ELEMENT_TYPE.DOOR]:    'Door',
  [ELEMENT_TYPE.WINDOW]:  'Window',
  [ELEMENT_TYPE.OPENING]: 'Opening',
  [ELEMENT_TYPE.SECRET]:  'Secret Passage',
  [ELEMENT_TYPE.CARPET]:  'Carpet',
};

function getSelectedWall() {
  const state = getState();
  const id = state.ui.selectedIds[0];
  if (!id) return null;
  const level = state.map.levels[state.ui.activeLevelIndex];
  return level.walls.find(w => w.id === id) ?? null;
}

export function initElementPanel() {
  const list = document.querySelector('#element-panel ul.panel-list');
  if (!list) return;

  const items = [];

  for (const type of Object.values(ELEMENT_TYPE)) {
    const li = document.createElement('li');
    li.textContent = ELEMENT_LABELS[type];
    li.dataset.elementType = type;
    li.classList.add('panel-item');

    li.addEventListener('click', () => {
      const wall = getSelectedWall();
      if (!wall) return;
      const element = createWallElement(type, 0.5);
      dispatch({
        type: 'UPDATE_ENTITY',
        payload: { id: wall.id, elements: [...wall.elements, element] },
      });
    });

    list.appendChild(li);
    items.push(li);
  }

  function updateState() {
    const hasWall = getSelectedWall() !== null;
    for (const li of items) {
      li.classList.toggle('disabled', !hasWall);
    }
  }

  subscribe(updateState);
  updateState();
}
