import { TEXTURE } from '../data/schema.js';
import { getState, dispatch, subscribe } from '../core/state.js';
import { emit, on } from '../core/events.js';
import { getTextureColor } from '../canvas/textures.js';

let _defaultTexture = TEXTURE.GRID;

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
  const container = document.querySelector('#texture-panel .swatches');
  if (!container) return;

  const textures = Object.values(TEXTURE);

  for (const texture of textures) {
    const swatch = document.createElement('div');
    swatch.className = 'swatch';
    swatch.dataset.texture = texture;
    swatch.title = texture;
    swatch.style.backgroundColor = getTextureColor(texture);

    swatch.addEventListener('click', () => {
      const wall = getSelectedWall();
      if (wall) {
        dispatch({ type: 'UPDATE_ENTITY', payload: { id: wall.id, texture } });
      } else {
        _defaultTexture = texture;
        emit('tool:set-default-texture', texture);
        updateHighlight();
      }
    });

    container.appendChild(swatch);
  }

  function updateHighlight() {
    const active = getCurrentTexture();
    for (const swatch of container.querySelectorAll('.swatch')) {
      swatch.classList.toggle('active', swatch.dataset.texture === active);
    }
  }

  subscribe(updateHighlight);
  on('tool:set-default-texture', updateHighlight);
  updateHighlight();
}
