import { subscribe, getState, dispatch } from '../core/state.js';
import { TEXTURE } from '../data/schema.js';

// ── Mapping entity type → inspector context name ────────────────────────────
const TYPE_TO_CONTEXT = {
  node:      'node',
  wall:      'wall',
  decorNode: 'decor',
  area:      'area',
};

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

function showContext(name) {
  const contexts = document.querySelectorAll('.inspector-context');
  for (const ctx of contexts) {
    if (ctx.dataset.inspector === name) {
      ctx.setAttribute('data-active', 'true');
    } else {
      ctx.removeAttribute('data-active');
    }
  }

  const badge = document.getElementById('inspector-badge');
  if (badge) {
    if (!name || name === 'empty') {
      badge.style.display = 'none';
    } else {
      badge.style.display = '';
      badge.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    }
  }
}

function updateNodeContext(entity) {
  const elX = document.getElementById('node-x');
  const elY = document.getElementById('node-y');
  if (elX) elX.textContent = entity.x.toFixed(2);
  if (elY) elY.textContent = entity.y.toFixed(2);
}

function updateDecorContext(entity) {
  const elType = document.getElementById('decor-type');
  const elRot  = document.getElementById('decor-rotation');
  if (elType) elType.textContent = entity.elementType ?? '—';
  if (elRot) {
    elRot.value = entity.rotation ?? 0;
    // Brancher l'event une seule fois
    if (!elRot._bound) {
      elRot._bound = true;
      elRot.addEventListener('change', () => {
        const id = getState().ui.selectedIds[0];
        if (id) dispatch({ type: 'UPDATE_ENTITY', payload: { id, rotation: Number(elRot.value) } });
      });
    }
  }
}

function updateAreaContext(entity) {
  const elName = document.getElementById('area-name');
  if (elName) {
    elName.value = entity.name ?? '';
    if (!elName._bound) {
      elName._bound = true;
      elName.addEventListener('change', () => {
        const id = getState().ui.selectedIds[0];
        if (id) dispatch({ type: 'UPDATE_ENTITY', payload: { id, name: elName.value } });
      });
    }
  }

  // Sync color palette — best-effort: compare hex colors
  const palette = document.getElementById('area-color');
  if (palette && entity.color) {
    // extract hex from entity color (may be rgba)
    const hexColor = entity.color.startsWith('#') ? entity.color.slice(0, 7).toLowerCase() : null;
    for (const dot of palette.querySelectorAll('.color-dot')) {
      const dotColor = dot.style.background?.toLowerCase();
      const match = hexColor && dotColor && dotColor.startsWith(hexColor);
      if (match) {
        dot.setAttribute('data-active', 'true');
      } else {
        dot.removeAttribute('data-active');
      }
    }
  }
}

function render(state) {
  const ids = state.ui.selectedIds;

  if (ids.length === 0) {
    showContext('empty');
    return;
  }

  if (ids.length > 1) {
    // Multi-sélection : afficher empty pour l'instant
    showContext('empty');
    return;
  }

  const id = ids[0];
  const entity = findEntity(state, id);
  if (!entity) { showContext('empty'); return; }

  const type = getEntityType(state, id);
  const contextName = TYPE_TO_CONTEXT[type] ?? 'empty';
  showContext(contextName);

  if (type === 'node') updateNodeContext(entity);
  else if (type === 'decorNode') updateDecorContext(entity);
  else if (type === 'area') updateAreaContext(entity);
  // wall: la texture et elements sont gérés par texture-panel et element-panel
}

export function initInspector() {
  subscribe(render);
  render(getState());
}
