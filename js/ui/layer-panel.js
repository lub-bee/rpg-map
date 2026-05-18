import { getState, dispatch, subscribe } from '../core/state.js';
import { emit } from '../core/events.js';
import { LAYER } from '../data/schema.js';

const LAYER_DEFS = [
  { id: LAYER.FURNITURE, label: 'Furniture' },
  { id: LAYER.WALLS,     label: 'Walls' },
  { id: LAYER.FLOOR,     label: 'Floor' },
  { id: LAYER.OPENINGS,  label: 'Openings' },
];

const _visible = new Set([LAYER.OPENINGS, LAYER.FLOOR, LAYER.WALLS, LAYER.FURNITURE]);

export function initLayerPanel() {
  const ul = document.querySelector('#layer-panel ul.panel-list');
  if (!ul) return;

  for (const def of LAYER_DEFS) {
    const li = document.createElement('li');
    li.className = 'layer-item';
    li.dataset.layer = def.id;

    const toggle = document.createElement('span');
    toggle.className = 'layer-toggle';
    toggle.textContent = '●';
    toggle.title = 'Toggle visibility';

    const label = document.createElement('span');
    label.className = 'layer-label';
    label.textContent = def.label;

    li.appendChild(toggle);
    li.appendChild(label);
    ul.appendChild(li);

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const visible = _visible.has(def.id);
      if (visible) {
        _visible.delete(def.id);
      } else {
        _visible.add(def.id);
      }
      emit('layer:visibility-change', { layer: def.id, visible: !visible });
      _render(ul);
    });

    li.addEventListener('click', () => {
      dispatch({ type: 'SET_LAYER', payload: def.id });
    });
  }

  subscribe(() => _render(ul));
  _render(ul);
}

function _render(ul) {
  const { activeLayer } = getState().ui;
  for (const li of ul.querySelectorAll('.layer-item')) {
    const id = Number(li.dataset.layer);
    li.classList.toggle('active', id === activeLayer);
    li.classList.toggle('hidden', !_visible.has(id));
    const toggle = li.querySelector('.layer-toggle');
    toggle.textContent = _visible.has(id) ? '●' : '○';
  }
}
