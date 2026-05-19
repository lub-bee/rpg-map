import { getState, dispatch, subscribe } from '../core/state.js';
import { createArea } from '../data/schema.js';

// ── helpers ──────────────────────────────────────────────────────────────────

function randomPastel() {
  const h = Math.floor(Math.random() * 360);
  // HSL → hex approximation: use a fixed-luminance pastel
  // We store as a semi-transparent hex via canvas trick-free approach:
  // store color as hex + apply alpha at render time via area.color being rgba
  return hslToHex(h, 55, 72);
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  function f(n) {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  }
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Convert a 6-digit hex to rgba with alpha=0.35 for fill */
function hexToRgba(hex, alpha = 0.35) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Verify that the given node IDs are all interconnected by walls */
function nodesAreConnected(nodeIds, walls) {
  if (nodeIds.length < 3) return false;
  const idSet = new Set(nodeIds);

  // Build adjacency restricted to the selected nodes
  const adj = new Map();
  for (const id of nodeIds) adj.set(id, new Set());

  for (const w of walls) {
    if (idSet.has(w.from) && idSet.has(w.to)) {
      adj.get(w.from).add(w.to);
      adj.get(w.to).add(w.from);
    }
  }

  // BFS from first node
  const visited = new Set();
  const queue = [nodeIds[0]];
  visited.add(nodeIds[0]);
  while (queue.length) {
    const cur = queue.shift();
    for (const nb of adj.get(cur)) {
      if (!visited.has(nb)) {
        visited.add(nb);
        queue.push(nb);
      }
    }
  }

  return visited.size === nodeIds.length;
}

// ── panel init ────────────────────────────────────────────────────────────────

export function initAreaPanel() {
  const panel = document.getElementById('area-panel');
  if (!panel) return;

  // ── "Create Area from Selection" button ──────────────────────────────────
  const createBtn = document.createElement('button');
  createBtn.className = 'area-create-btn';
  createBtn.textContent = 'Create Area from Selection';
  panel.insertBefore(createBtn, panel.querySelector('ul.panel-list'));

  // ── inline creation form (hidden until createBtn click) ──────────────────
  const form = document.createElement('div');
  form.className = 'area-form hidden';
  form.innerHTML = `
    <div class="area-form-row">
      <input class="area-name-input" type="text" value="Zone" placeholder="Area name">
      <input class="area-color-input" type="color" value="#a8d8a8">
    </div>
    <div class="area-form-row area-form-actions">
      <span class="area-form-error"></span>
      <button class="area-confirm-btn">Confirm</button>
      <button class="area-cancel-btn">Cancel</button>
    </div>
  `;
  panel.insertBefore(form, panel.querySelector('ul.panel-list'));

  const nameInput = form.querySelector('.area-name-input');
  const colorInput = form.querySelector('.area-color-input');
  const errorSpan = form.querySelector('.area-form-error');
  const confirmBtn = form.querySelector('.area-confirm-btn');
  const cancelBtn = form.querySelector('.area-cancel-btn');

  function showForm() {
    colorInput.value = randomPastel();
    nameInput.value = 'Zone';
    errorSpan.textContent = '';
    form.classList.remove('hidden');
    createBtn.classList.add('hidden');
    nameInput.focus();
    nameInput.select();
  }

  function hideForm() {
    form.classList.add('hidden');
    createBtn.classList.remove('hidden');
  }

  createBtn.addEventListener('click', showForm);
  cancelBtn.addEventListener('click', hideForm);

  confirmBtn.addEventListener('click', () => {
    const state = getState();
    const level = state.map.levels[state.ui.activeLevelIndex];

    // Only keep IDs that correspond to actual nodes
    const nodeIds = state.ui.selectedIds.filter(id =>
      level.nodes.some(n => n.id === id)
    );

    if (nodeIds.length < 3) {
      errorSpan.textContent = 'Select at least 3 nodes.';
      return;
    }

    if (!nodesAreConnected(nodeIds, level.walls)) {
      errorSpan.textContent = 'Selected nodes must be connected by walls.';
      return;
    }

    const name = nameInput.value.trim() || 'Zone';
    const color = hexToRgba(colorInput.value);
    const area = createArea(name, nodeIds, color);
    dispatch({ type: 'ADD_AREA', payload: area });
    hideForm();
  });

  // ── area list ─────────────────────────────────────────────────────────────
  const list = panel.querySelector('ul.panel-list');

  function renderList(state) {
    const level = state.map.levels[state.ui.activeLevelIndex];
    const areas = level ? level.areas : [];

    list.innerHTML = '';

    for (const area of areas) {
      const li = document.createElement('li');
      li.className = 'area-item';

      // ── color swatch (acts as color picker trigger) ───────────────────────
      const swatchWrap = document.createElement('label');
      swatchWrap.className = 'area-swatch-wrap';
      swatchWrap.title = 'Change color';

      const swatch = document.createElement('span');
      swatch.className = 'area-swatch';
      swatch.style.background = area.color;

      const hiddenColor = document.createElement('input');
      hiddenColor.type = 'color';
      hiddenColor.className = 'area-swatch-picker';
      // Convert rgba back to hex for the picker (best-effort)
      hiddenColor.value = rgbaToHex(area.color);

      hiddenColor.addEventListener('input', () => {
        swatch.style.background = hexToRgba(hiddenColor.value);
      });
      hiddenColor.addEventListener('change', () => {
        const newColor = hexToRgba(hiddenColor.value);
        dispatch({ type: 'UPDATE_ENTITY', payload: { id: area.id, color: newColor } });
      });

      swatchWrap.appendChild(swatch);
      swatchWrap.appendChild(hiddenColor);

      // ── name label (click to rename inline) ──────────────────────────────
      const label = document.createElement('span');
      label.className = 'area-label';
      label.textContent = area.name;
      label.title = 'Click to rename';

      label.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'area-rename-input';
        input.value = area.name;

        function commit() {
          const newName = input.value.trim() || area.name;
          dispatch({ type: 'UPDATE_ENTITY', payload: { id: area.id, name: newName } });
        }

        input.addEventListener('blur', commit);
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') { e.preventDefault(); commit(); input.blur(); }
          if (e.key === 'Escape') { input.value = area.name; input.blur(); }
        });

        label.replaceWith(input);
        input.focus();
        input.select();
      });

      // ── delete button ─────────────────────────────────────────────────────
      const del = document.createElement('button');
      del.className = 'area-delete';
      del.textContent = '×';
      del.title = 'Delete area';
      del.addEventListener('click', () => {
        dispatch({ type: 'DELETE_ENTITY', payload: area.id });
      });

      li.appendChild(swatchWrap);
      li.appendChild(label);
      li.appendChild(del);
      list.appendChild(li);
    }
  }

  renderList(getState());
  subscribe(renderList);
}

// ── utility: rgba(r,g,b,a) → #rrggbb ─────────────────────────────────────────

function rgbaToHex(color) {
  // Handles both "rgba(r,g,b,a)" and plain "#rrggbb"
  if (color.startsWith('#')) return color.slice(0, 7);
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return '#888888';
  const [, r, g, b] = m;
  return '#' + [r, g, b].map(v => parseInt(v).toString(16).padStart(2, '0')).join('');
}
