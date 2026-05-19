import { subscribe, getState, dispatch } from '../core/state.js';
import { LAYER, TEXTURE } from '../data/schema.js';

const LAYER_LABELS = {
  [LAYER.OPENINGS]: 'Openings',
  [LAYER.FLOOR]: 'Floor',
  [LAYER.WALLS]: 'Walls',
  [LAYER.FURNITURE]: 'Furniture',
};

const TEXTURE_OPTIONS = Object.values(TEXTURE);

function findEntity(state, id) {
  const level = state.map.levels[state.ui.activeLevelIndex];
  if (!level) return null;
  return (
    level.nodes.find(e => e.id === id) ??
    level.walls.find(e => e.id === id) ??
    level.decorNodes.find(e => e.id === id) ??
    level.areas.find(e => e.id === id) ??
    null
  );
}

function getEntityType(state, id) {
  const level = state.map.levels[state.ui.activeLevelIndex];
  if (!level) return null;
  if (level.nodes.some(e => e.id === id)) return 'node';
  if (level.walls.some(e => e.id === id)) return 'wall';
  if (level.decorNodes.some(e => e.id === id)) return 'decorNode';
  if (level.areas.some(e => e.id === id)) return 'area';
  return null;
}

function makeRow(label, input) {
  const row = document.createElement('div');
  row.className = 'inspector-row';
  const lbl = document.createElement('label');
  lbl.textContent = label;
  row.appendChild(lbl);
  row.appendChild(input);
  return row;
}

function makeNumberInput(value, onChange) {
  const input = document.createElement('input');
  input.type = 'number';
  input.value = value;
  input.addEventListener('change', () => onChange(Number(input.value)));
  return input;
}

function makeSelect(options, current, onChange) {
  const sel = document.createElement('select');
  for (const opt of options) {
    const o = document.createElement('option');
    o.value = opt.value ?? opt;
    o.textContent = opt.label ?? opt;
    if ((opt.value ?? opt) === current) o.selected = true;
    sel.appendChild(o);
  }
  sel.addEventListener('change', () => onChange(sel.value));
  return sel;
}

function makeTextInput(value, onChange) {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = value;
  input.addEventListener('change', () => onChange(input.value));
  return input;
}

function makeColorInput(value, onChange) {
  const input = document.createElement('input');
  input.type = 'color';
  input.value = value;
  input.addEventListener('input', () => onChange(input.value));
  return input;
}

function renderNode(container, entity) {
  const typeLabel = document.createElement('div');
  typeLabel.className = 'inspector-type';
  typeLabel.textContent = 'Node';
  container.appendChild(typeLabel);

  container.appendChild(makeRow('X', makeNumberInput(entity.x, v => {
    dispatch({ type: 'UPDATE_ENTITY', payload: { id: entity.id, x: v } });
  })));

  container.appendChild(makeRow('Y', makeNumberInput(entity.y, v => {
    dispatch({ type: 'UPDATE_ENTITY', payload: { id: entity.id, y: v } });
  })));
}

function renderWall(container, entity) {
  const typeLabel = document.createElement('div');
  typeLabel.className = 'inspector-type';
  typeLabel.textContent = 'Wall';
  container.appendChild(typeLabel);

  const textureSel = makeSelect(TEXTURE_OPTIONS, entity.texture, v => {
    dispatch({ type: 'UPDATE_ENTITY', payload: { id: entity.id, texture: v } });
  });
  container.appendChild(makeRow('Texture', textureSel));

  if (entity.elements && entity.elements.length > 0) {
    const info = document.createElement('div');
    info.className = 'inspector-info';
    info.textContent = `Elements: ${entity.elements.length}`;
    container.appendChild(info);
  }
}

function renderDecorNode(container, entity) {
  const typeLabel = document.createElement('div');
  typeLabel.className = 'inspector-type';
  typeLabel.textContent = 'Decor';
  container.appendChild(typeLabel);

  const typeInfo = document.createElement('div');
  typeInfo.className = 'inspector-info';
  typeInfo.textContent = `Type: ${entity.elementType}`;
  container.appendChild(typeInfo);

  const layerOptions = Object.entries(LAYER_LABELS).map(([value, label]) => ({ value: Number(value), label }));
  const layerSel = makeSelect(layerOptions, entity.layer, v => {
    dispatch({ type: 'UPDATE_ENTITY', payload: { id: entity.id, layer: Number(v) } });
  });
  container.appendChild(makeRow('Layer', layerSel));

  const rotInput = makeNumberInput(entity.rotation ?? 0, v => {
    dispatch({ type: 'UPDATE_ENTITY', payload: { id: entity.id, rotation: v } });
  });
  rotInput.step = '15';
  rotInput.min = '-360';
  rotInput.max = '360';
  container.appendChild(makeRow('Rotation (°)', rotInput));
}

function renderArea(container, entity) {
  const typeLabel = document.createElement('div');
  typeLabel.className = 'inspector-type';
  typeLabel.textContent = 'Area';
  container.appendChild(typeLabel);

  container.appendChild(makeRow('Name', makeTextInput(entity.name, v => {
    dispatch({ type: 'UPDATE_ENTITY', payload: { id: entity.id, name: v } });
  })));

  container.appendChild(makeRow('Color', makeColorInput(entity.color, v => {
    dispatch({ type: 'UPDATE_ENTITY', payload: { id: entity.id, color: v } });
  })));
}

function render(state) {
  const section = document.getElementById('inspector');
  if (!section) return;

  const body = section.querySelector('.inspector-body') ?? (() => {
    const div = document.createElement('div');
    div.className = 'inspector-body';
    section.appendChild(div);
    return div;
  })();

  const placeholder = section.querySelector('.panel-placeholder');
  body.innerHTML = '';

  const ids = state.ui.selectedIds;

  if (ids.length === 0) {
    if (placeholder) placeholder.style.display = '';
    return;
  }

  if (placeholder) placeholder.style.display = 'none';

  if (ids.length > 1) {
    const msg = document.createElement('p');
    msg.className = 'panel-placeholder';
    msg.textContent = `${ids.length} entities selected`;
    body.appendChild(msg);
    return;
  }

  const id = ids[0];
  const entity = findEntity(state, id);
  if (!entity) return;

  const type = getEntityType(state, id);

  if (type === 'node') renderNode(body, entity);
  else if (type === 'wall') renderWall(body, entity);
  else if (type === 'decorNode') renderDecorNode(body, entity);
  else if (type === 'area') renderArea(body, entity);
}

export function initInspector() {
  subscribe(render);
  render(getState());
}
