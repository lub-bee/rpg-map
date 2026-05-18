import { getState, dispatch, subscribe } from '../core/state.js';
import { createLevel } from '../data/schema.js';

export function initLevelPanel() {
  const section = document.getElementById('level-panel');
  if (!section) return;

  const ul = section.querySelector('ul.panel-list');

  const addBtn = document.createElement('button');
  addBtn.className = 'level-add-btn';
  addBtn.textContent = '+ Add Level';
  section.appendChild(addBtn);

  addBtn.addEventListener('click', () => {
    const idx = getState().map.levels.length;
    const name = window.prompt('Level name:', `Level ${idx}`);
    if (!name) return;
    dispatch({ type: 'ADD_LEVEL', payload: createLevel(name) });
    dispatch({ type: 'SET_LEVEL', payload: getState().map.levels.length - 1 });
  });

  subscribe(() => _render(ul));
  _render(ul);
}

function _render(ul) {
  const { map, ui } = getState();
  ul.innerHTML = '';

  map.levels.forEach((level, index) => {
    const li = document.createElement('li');
    li.className = 'level-item' + (index === ui.activeLevelIndex ? ' active' : '');
    li.textContent = level.name;

    li.addEventListener('click', () => {
      dispatch({ type: 'SET_LEVEL', payload: index });
    });

    li.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      const name = window.prompt('Rename level:', level.name);
      if (!name) return;
      const updated = { ...getState().map };
      updated.levels = updated.levels.map((l, i) => i === index ? { ...l, name } : l);
      dispatch({ type: 'SET_MAP', payload: updated });
    });

    ul.appendChild(li);
  });
}
