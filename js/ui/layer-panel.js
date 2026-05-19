import { getState, dispatch, subscribe } from '../core/state.js';
import { emit } from '../core/events.js';
import { LAYER } from '../data/schema.js';

const LAYER_DEFS = [
  { id: LAYER.FURNITURE, label: 'Furniture', color: '#7a3f6e' },
  { id: LAYER.WALLS,     label: 'Walls',     color: '#6b6b6b' },
  { id: LAYER.FLOOR,     label: 'Floor',     color: '#5d4a36' },
  { id: LAYER.OPENINGS,  label: 'Openings',  color: '#8a6037' },
];

const _visible = new Set([LAYER.OPENINGS, LAYER.FLOOR, LAYER.WALLS, LAYER.FURNITURE]);

export function initLayerPanel() {
  const list = document.getElementById('layer-list');
  if (!list) return;

  for (const def of LAYER_DEFS) {
    const row = document.createElement('div');
    row.className = 'list-row';
    row.dataset.layer = def.id;

    const swatch = document.createElement('span');
    swatch.className = 'list-row-swatch';
    swatch.style.background = def.color;

    const label = document.createElement('span');
    label.className = 'list-row-label';
    label.textContent = def.label;

    const actions = document.createElement('div');
    actions.className = 'list-row-actions';

    const visBtn = document.createElement('button');
    visBtn.className = 'list-row-toggle';
    visBtn.setAttribute('aria-label', 'Visibility');
    visBtn.innerHTML = '<i data-lucide="eye"></i>';

    actions.appendChild(visBtn);
    row.appendChild(swatch);
    row.appendChild(label);
    row.appendChild(actions);
    list.appendChild(row);

    visBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const visible = _visible.has(def.id);
      if (visible) {
        _visible.delete(def.id);
      } else {
        _visible.add(def.id);
      }
      const nowVisible = !visible;
      visBtn.setAttribute('data-state', nowVisible ? '' : 'off');
      visBtn.innerHTML = `<i data-lucide="${nowVisible ? 'eye' : 'eye-off'}"></i>`;
      if (window.lucide) lucide.createIcons({ nodes: [visBtn] });
      emit('layer:visibility-change', { layer: def.id, visible: nowVisible });
      _render(list);
    });

    row.addEventListener('click', () => {
      dispatch({ type: 'SET_LAYER', payload: def.id });
    });
  }

  if (window.lucide) lucide.createIcons({ nodes: [list] });

  subscribe(() => _render(list));
  _render(list);
}

function _render(list) {
  const { activeLayer } = getState().ui;
  for (const row of list.querySelectorAll('.list-row[data-layer]')) {
    const id = Number(row.dataset.layer);
    if (id === activeLayer) {
      row.setAttribute('data-active', 'true');
    } else {
      row.removeAttribute('data-active');
    }
  }
}
