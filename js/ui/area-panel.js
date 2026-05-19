import { getState, dispatch, subscribe } from '../core/state.js';
import { createArea } from '../data/schema.js';

// ── helpers ──────────────────────────────────────────────────────────────────

function randomPastel() {
  const h = Math.floor(Math.random() * 360);
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

function hexToRgba(hex, alpha = 0.35) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function rgbaToHex(color) {
  if (color.startsWith('#')) return color.slice(0, 7);
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return '#888888';
  const [, r, g, b] = m;
  return '#' + [r, g, b].map(v => parseInt(v).toString(16).padStart(2, '0')).join('');
}

function nodesAreConnected(nodeIds, walls) {
  if (nodeIds.length < 3) return false;
  const idSet = new Set(nodeIds);
  const adj = new Map();
  for (const id of nodeIds) adj.set(id, new Set());
  for (const w of walls) {
    if (idSet.has(w.from) && idSet.has(w.to)) {
      adj.get(w.from).add(w.to);
      adj.get(w.to).add(w.from);
    }
  }
  const visited = new Set();
  const queue = [nodeIds[0]];
  visited.add(nodeIds[0]);
  while (queue.length) {
    const cur = queue.shift();
    for (const nb of adj.get(cur)) {
      if (!visited.has(nb)) { visited.add(nb); queue.push(nb); }
    }
  }
  return visited.size === nodeIds.length;
}

// ── panel init ────────────────────────────────────────────────────────────────

export function initAreaPanel() {
  const list = document.getElementById('area-list');
  if (!list) return;

  const addBtn = document.getElementById('add-area-btn');

  // Création inline via le bouton "+"
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const state = getState();
      const level = state.map.levels[state.ui.activeLevelIndex];

      const nodeIds = state.ui.selectedIds.filter(id =>
        level.nodes.some(n => n.id === id)
      );

      if (nodeIds.length < 3) {
        alert('Select at least 3 connected nodes first.');
        return;
      }
      if (!nodesAreConnected(nodeIds, level.walls)) {
        alert('Selected nodes must be connected by walls.');
        return;
      }

      const name = window.prompt('Area name:', 'Zone') ?? 'Zone';
      const hexColor = randomPastel();
      const color = hexToRgba(hexColor);
      const area = createArea(name.trim() || 'Zone', nodeIds, color);
      dispatch({ type: 'ADD_AREA', payload: area });
    });
  }

  // ── area list ─────────────────────────────────────────────────────────────
  function renderList(state) {
    const level = state.map.levels[state.ui.activeLevelIndex];
    const areas = level ? level.areas : [];

    list.innerHTML = '';

    for (const area of areas) {
      const row = document.createElement('div');
      row.className = 'list-row';

      // Swatch (color)
      const swatchWrap = document.createElement('label');
      swatchWrap.className = 'list-row-swatch';
      swatchWrap.style.background = area.color;
      swatchWrap.style.cursor = 'pointer';
      swatchWrap.title = 'Change color';

      const hiddenColor = document.createElement('input');
      hiddenColor.type = 'color';
      hiddenColor.style.display = 'none';
      hiddenColor.value = rgbaToHex(area.color);

      hiddenColor.addEventListener('input', () => {
        swatchWrap.style.background = hexToRgba(hiddenColor.value);
      });
      hiddenColor.addEventListener('change', () => {
        const newColor = hexToRgba(hiddenColor.value);
        dispatch({ type: 'UPDATE_ENTITY', payload: { id: area.id, color: newColor } });
      });

      swatchWrap.appendChild(hiddenColor);
      swatchWrap.addEventListener('click', (e) => {
        e.stopPropagation();
        hiddenColor.click();
      });

      // Label
      const label = document.createElement('span');
      label.className = 'list-row-label';
      label.textContent = area.name;
      label.title = 'Double-click to rename';

      label.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'list-row-label';
        input.value = area.name;
        input.style.background = 'var(--panel-2)';
        input.style.border = '1px solid var(--accent)';
        input.style.borderRadius = 'var(--radius-sm)';
        input.style.padding = '0 4px';

        function commit() {
          const newName = input.value.trim() || area.name;
          dispatch({ type: 'UPDATE_ENTITY', payload: { id: area.id, name: newName } });
        }

        input.addEventListener('blur', commit);
        input.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter') { ev.preventDefault(); commit(); input.blur(); }
          if (ev.key === 'Escape') { input.value = area.name; input.blur(); }
        });

        label.replaceWith(input);
        input.focus();
        input.select();
      });

      // Meta (area size — placeholder)
      const meta = document.createElement('span');
      meta.className = 'list-row-meta';
      meta.textContent = `${area.nodeIds?.length ?? 0}n`;

      row.appendChild(swatchWrap);
      row.appendChild(label);
      row.appendChild(meta);
      list.appendChild(row);

      row.addEventListener('click', () => {
        dispatch({ type: 'SET_SELECTED', payload: [area.id] });
      });
    }
  }

  renderList(getState());
  subscribe(renderList);
}
