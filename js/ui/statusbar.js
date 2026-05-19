import { subscribe, getState, dispatch } from '../core/state.js';
import { on } from '../core/events.js';
import { getCamera, setCamera } from '../canvas/renderer.js';
import { setZoom } from '../canvas/camera.js';

export function initStatusbar() {
  const elStatusX   = document.getElementById('status-x');
  const elStatusY   = document.getElementById('status-y');
  const elZoom      = document.getElementById('zoom');
  const elZoomReset = document.getElementById('zoom-reset');
  const elZoomLock  = document.getElementById('zoom-lock');
  const elGridSize  = document.getElementById('grid-size');

  // ── Grid size (number input) ─────────────────────────────────────────────
  const initGs = getState().ui.gridSize;
  if (elGridSize) {
    elGridSize.value = initGs;
    elGridSize.addEventListener('input', () => {
      const gs = parseInt(elGridSize.value, 10);
      if (!isNaN(gs) && gs >= 4) {
        dispatch({ type: 'SET_GRID_SIZE', payload: gs });
      }
    });
  }

  // Keep grid-size in sync if gridSize changes via load JSON etc.
  subscribe((state) => {
    const gs = state.ui.gridSize;
    if (elGridSize && elGridSize.value !== String(gs)) {
      elGridSize.value = gs;
    }
  });

  // ── Zoom display (driven by camera:change) ───────────────────────────────
  let _currentZoom = 1;

  on('camera:change', (camera) => {
    _currentZoom = camera.zoom;
    const pct = Math.round(camera.zoom * 100);
    if (elZoom && document.activeElement !== elZoom) {
      elZoom.value = pct;
    }
  });

  if (elZoom) {
    elZoom.value = 100;

    function applyZoomInput() {
      const pct = parseFloat(elZoom.value);
      if (!isNaN(pct) && pct > 0) {
        const clamped = Math.min(800, Math.max(10, pct)) / 100;
        const canvas = document.getElementById('map-canvas');
        const cam = setZoom(getCamera(), clamped, canvas.offsetWidth, canvas.offsetHeight);
        setCamera(cam);
      } else {
        elZoom.value = Math.round(_currentZoom * 100);
      }
    }

    elZoom.addEventListener('change', applyZoomInput);
    elZoom.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { applyZoomInput(); elZoom.blur(); }
      if (e.key === 'Escape') { elZoom.value = Math.round(_currentZoom * 100); elZoom.blur(); }
    });
    elZoom.addEventListener('focus', () => elZoom.select());
  }

  // ── Zoom reset ───────────────────────────────────────────────────────────
  if (elZoomReset) {
    elZoomReset.addEventListener('click', () => {
      if (elZoom && elZoom.readOnly) return;
      const canvas = document.getElementById('map-canvas');
      const cam = setZoom(getCamera(), 1, canvas.offsetWidth, canvas.offsetHeight);
      setCamera(cam);
    });
  }

  // ── Zoom lock ────────────────────────────────────────────────────────────
  if (elZoomLock) {
    elZoomLock.addEventListener('click', () => {
      const locked = elZoomLock.getAttribute('data-state') === 'on';
      const next = !locked;
      elZoomLock.setAttribute('data-state', next ? 'on' : 'off');
      elZoomLock.setAttribute('aria-pressed', next ? 'true' : 'false');
      elZoomLock.setAttribute('aria-label', next ? 'Unlock zoom' : 'Lock zoom');
      elZoomLock.innerHTML = `<i data-lucide="${next ? 'lock' : 'unlock'}"></i>`;
      if (elZoom) elZoom.readOnly = next;
      if (window.lucide) lucide.createIcons({ nodes: [elZoomLock] });
    });
  }
}

export function updateCoords(worldX, worldY) {
  const elX = document.getElementById('status-x');
  const elY = document.getElementById('status-y');
  if (elX) elX.textContent = Math.round(worldX);
  if (elY) elY.textContent = Math.round(worldY);
}
