import { subscribe, getState } from '../core/state.js';
import { on } from '../core/events.js';

export function initStatusbar() {
  const elZoom = document.getElementById('zoom');
  const elTool = document.getElementById('active-tool');

  subscribe((state) => {
    elTool.textContent = state.ui.activeTool ?? 'No tool';
  });

  on('camera:change', (camera) => {
    elZoom.textContent = `${Math.round(camera.zoom * 100)}%`;
  });

  elTool.textContent = getState().ui.activeTool ?? 'No tool';
  elZoom.textContent = '100%';
}

export function updateCoords(worldX, worldY) {
  const el = document.getElementById('coords');
  if (el) el.textContent = `x: ${worldX}, y: ${worldY}`;
}
