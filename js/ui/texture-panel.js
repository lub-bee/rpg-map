import { TEXTURE } from '../data/schema.js';
import { getState, dispatch, subscribe } from '../core/state.js';
import { emit, on } from '../core/events.js';

let _defaultTexture = TEXTURE.STONE;

// Mapping texture value → swatch data-texture attribute (HTML side uses lowercase names)
// Les swatches dans le HTML ont data-texture avec les noms du handoff.
// On fait correspondre les valeurs TEXTURE du schema avec les aria-label/data-texture du HTML.

function getSelectedWall() {
  const state = getState();
  const id = state.ui.selectedIds[0];
  if (!id) return null;
  const level = state.map.levels[state.ui.activeLevelIndex];
  return level.walls.find(w => w.id === id) ?? null;
}

function getCurrentTexture() {
  const wall = getSelectedWall();
  return wall ? wall.texture : _defaultTexture;
}

export function initTexturePanel() {
  const grid = document.getElementById('texture-swatches');
  if (!grid) return;

  // Les swatches sont déjà dans le HTML — on branche les événements
  const swatches = grid.querySelectorAll('.swatch[data-texture]');

  for (const swatch of swatches) {
    swatch.addEventListener('click', () => {
      const texture = swatch.dataset.texture;
      const wall = getSelectedWall();
      if (wall) {
        dispatch({ type: 'UPDATE_ENTITY', payload: { id: wall.id, texture } });
      } else {
        _defaultTexture = texture;
        emit('tool:set-default-texture', texture);
        updateHighlight();
      }
    });
  }

  function updateHighlight() {
    const active = getCurrentTexture();
    for (const swatch of swatches) {
      if (swatch.dataset.texture === active) {
        swatch.setAttribute('data-active', 'true');
      } else {
        swatch.removeAttribute('data-active');
      }
    }
  }

  subscribe(updateHighlight);
  on('tool:set-default-texture', updateHighlight);
  updateHighlight();
}
