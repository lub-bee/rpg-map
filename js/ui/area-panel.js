import { getState, dispatch, subscribe } from '../core/state.js';

export function initAreaPanel() {
  const panel = document.getElementById('area-panel');
  if (!panel) return;

  const header = document.createElement('div');
  header.className = 'panel-header-row';

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'panel-btn';
  toggleBtn.textContent = 'Show Areas';
  toggleBtn.addEventListener('click', () => {
    dispatch({ type: 'TOGGLE_AREAS' });
  });
  header.appendChild(toggleBtn);
  panel.insertBefore(header, panel.querySelector('ul.panel-list'));

  const list = panel.querySelector('ul.panel-list');

  function render(state) {
    const level = state.map.levels[state.ui.activeLevelIndex];
    const areas = level ? level.areas : [];

    toggleBtn.textContent = state.ui.showAreas ? 'Hide Areas' : 'Show Areas';

    list.innerHTML = '';
    for (const area of areas) {
      const li = document.createElement('li');
      li.className = 'area-item';

      const swatch = document.createElement('span');
      swatch.className = 'area-swatch';
      swatch.style.background = area.color;

      const label = document.createElement('span');
      label.className = 'area-label';
      label.textContent = area.name;
      label.addEventListener('click', () => {
        dispatch({ type: 'SET_SELECTED', payload: [area.id] });
      });

      const del = document.createElement('button');
      del.className = 'area-delete';
      del.textContent = '×';
      del.addEventListener('click', () => {
        dispatch({ type: 'DELETE_ENTITY', payload: area.id });
      });

      li.appendChild(swatch);
      li.appendChild(label);
      li.appendChild(del);
      list.appendChild(li);
    }
  }

  render(getState());
  subscribe(render);
}
