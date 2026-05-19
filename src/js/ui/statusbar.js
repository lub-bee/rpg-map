import { subscribe, getState, dispatch } from '../core/state.js';
import { on } from '../core/events.js';
import { getCamera, setCamera } from '../canvas/renderer.js';
import { setZoom, createCamera } from '../canvas/camera.js';

export function initStatusbar() {
  const elCoords     = document.getElementById('coords');
  const elZoomInput  = document.getElementById('zoom-input');
  const elZoomReset  = document.getElementById('zoom-reset');
  const elFit        = document.getElementById('fit-btn');
  const elTool       = document.getElementById('active-tool');
  const elGridSlider = document.getElementById('grid-size-input');
  const elGridValue  = document.getElementById('grid-size-value');

  // ── Active tool ──────────────────────────────────────────────────────────
  subscribe((state) => {
    elTool.textContent = state.ui.activeTool ?? 'No tool';
    // Keep slider in sync if gridSize changes via other means (e.g. load JSON)
    const gs = state.ui.gridSize;
    if (elGridSlider.value !== String(gs)) {
      elGridSlider.value = gs;
      elGridValue.textContent = `${gs}px`;
    }
  });

  elTool.textContent = getState().ui.activeTool ?? 'No tool';

  // ── Zoom display (driven by camera:change) ───────────────────────────────
  let _currentZoom = 1;

  on('camera:change', (camera) => {
    _currentZoom = camera.zoom;
    const pct = Math.round(camera.zoom * 100);
    if (document.activeElement !== elZoomInput) {
      elZoomInput.value = `${pct}%`;
    }
  });

  elZoomInput.value = '100%';

  // Apply zoom from text input on Enter or blur
  function applyZoomInput() {
    const raw = elZoomInput.value.replace('%', '').trim();
    const pct = parseFloat(raw);
    if (!isNaN(pct) && pct > 0) {
      const clamped = Math.min(1000, Math.max(10, pct)) / 100;
      const canvas = document.getElementById('map-canvas');
      const cam = setZoom(getCamera(), clamped, canvas.offsetWidth, canvas.offsetHeight);
      setCamera(cam);
    } else {
      // Revert to current
      elZoomInput.value = `${Math.round(_currentZoom * 100)}%`;
    }
  }

  elZoomInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      applyZoomInput();
      elZoomInput.blur();
    } else if (e.key === 'Escape') {
      elZoomInput.value = `${Math.round(_currentZoom * 100)}%`;
      elZoomInput.blur();
    }
  });

  elZoomInput.addEventListener('blur', applyZoomInput);

  // Click to select all text in input for easy overwriting
  elZoomInput.addEventListener('focus', () => elZoomInput.select());

  // ── Reset zoom ───────────────────────────────────────────────────────────
  elZoomReset.addEventListener('click', () => {
    const canvas = document.getElementById('map-canvas');
    const cam = setZoom(getCamera(), 1, canvas.offsetWidth, canvas.offsetHeight);
    setCamera(cam);
  });

  // ── Fit to content ───────────────────────────────────────────────────────
  elFit.addEventListener('click', () => {
    fitToContent();
  });

  // ── Grid size slider ─────────────────────────────────────────────────────
  const initGs = getState().ui.gridSize;
  elGridSlider.value = initGs;
  elGridValue.textContent = `${initGs}px`;

  elGridSlider.addEventListener('input', () => {
    const gs = parseInt(elGridSlider.value, 10);
    elGridValue.textContent = `${gs}px`;
    dispatch({ type: 'SET_GRID_SIZE', payload: gs });
  });
}

export function updateCoords(worldX, worldY) {
  const el = document.getElementById('coords');
  if (el) el.textContent = `x: ${worldX}, y: ${worldY}`;
}

// ── Fit-to-content ──────────────────────────────────────────────────────────
function fitToContent() {
  const state = getState();
  const level = state.map.levels[state.ui.activeLevelIndex];
  if (!level) return;

  // Collect all world-space points from nodes, walls, decorNodes
  const points = [];

  for (const node of level.nodes ?? []) {
    if (node.x != null && node.y != null) points.push({ x: node.x, y: node.y });
  }
  for (const wall of level.walls ?? []) {
    if (wall.x1 != null) {
      points.push({ x: wall.x1, y: wall.y1 });
      points.push({ x: wall.x2, y: wall.y2 });
    }
    // wall stored as node pair
    if (wall.x != null) points.push({ x: wall.x, y: wall.y });
  }
  for (const dn of level.decorNodes ?? []) {
    if (dn.x != null && dn.y != null) points.push({ x: dn.x, y: dn.y });
  }
  for (const area of level.areas ?? []) {
    for (const nodeId of area.nodeIds ?? []) {
      const node = (level.nodes ?? []).find(n => n.id === nodeId);
      if (node?.x != null && node?.y != null) points.push({ x: node.x, y: node.y });
    }
  }

  if (points.length === 0) {
    // Nothing to fit — just reset to origin
    setCamera(createCamera());
    return;
  }

  const canvas = document.getElementById('map-canvas');
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  const padding = 60; // px

  const minX = Math.min(...points.map(p => p.x));
  const maxX = Math.max(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxY = Math.max(...points.map(p => p.y));

  const contentW = maxX - minX || 1;
  const contentH = maxY - minY || 1;

  const scaleX = (W - padding * 2) / contentW;
  const scaleY = (H - padding * 2) / contentH;
  const newZoom = Math.min(scaleX, scaleY, 10);

  // Center the bounding box: camera.x = worldX at screen 0
  // screenX = (worldX - camera.x) * zoom => camera.x = worldX - screenX/zoom
  const centerWorldX = (minX + maxX) / 2;
  const centerWorldY = (minY + maxY) / 2;
  const newCamX = centerWorldX - (W / 2) / newZoom;
  const newCamY = centerWorldY - (H / 2) / newZoom;

  setCamera({ x: newCamX, y: newCamY, zoom: newZoom });
}
