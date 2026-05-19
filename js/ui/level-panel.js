import { getState, dispatch, subscribe } from '../core/state.js';
import { createLevel } from '../data/schema.js';

export function initLevelPanel() {
  const list = document.getElementById('level-list');
  if (!list) return;

  const addBtn = document.getElementById('add-level-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const idx = getState().map.levels.length;
      const name = window.prompt('Level name:', `Level ${idx}`);
      if (!name) return;
      dispatch({ type: 'ADD_LEVEL', payload: createLevel(name) });
      dispatch({ type: 'SET_LEVEL', payload: getState().map.levels.length - 1 });
    });
  }

  subscribe(() => _render(list));
  _render(list);
}

function _render(list) {
  const { map, ui } = getState();
  list.innerHTML = '';

  map.levels.forEach((level, index) => {
    const row = document.createElement('div');
    row.className = 'list-row';
    if (index === ui.activeLevelIndex) {
      row.setAttribute('data-active', 'true');
    }

    const label = document.createElement('span');
    label.className = 'list-row-label';
    label.textContent = level.name;

    const meta = document.createElement('span');
    meta.className = 'list-row-meta';
    meta.textContent = `L${index}`;

    row.appendChild(label);
    row.appendChild(meta);
    list.appendChild(row);

    row.addEventListener('click', () => {
      dispatch({ type: 'SET_LEVEL', payload: index });
    });

    row.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      const name = window.prompt('Rename level:', level.name);
      if (!name) return;
      const updated = { ...getState().map };
      updated.levels = updated.levels.map((l, i) => i === index ? { ...l, name } : l);
      dispatch({ type: 'SET_MAP', payload: updated });
    });
  });
}
