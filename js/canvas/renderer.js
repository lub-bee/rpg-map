import { getState } from '../core/state.js';
import { emit } from '../core/events.js';
import { createCamera, zoomAt, attachCameraControls } from './camera.js';
import { drawGrid } from './grid.js';
import { screenToWorld, worldToGridCoords } from './coords.js';
import { DISPLAY_MODE } from '../data/schema.js';
import { updateCoords } from '../ui/statusbar.js';

let canvas, ctx, camera, detachControls, rafId;

// Entity render hooks — populated by later phases via addLayerRenderer()
const _layerRenderers = [];

export function init(canvasEl) {
  canvas = canvasEl;
  ctx = canvas.getContext('2d');
  camera = createCamera();

  resizeCanvas();
  window.addEventListener('resize', onResize);

  detachControls = attachCameraControls(canvas, (newCamera) => {
    camera = newCamera;
    emit('camera:change', camera);
  });

  canvas.addEventListener('mousemove', onMouseMove);

  emit('camera:change', camera);
  rafId = requestAnimationFrame(loop);
}

export function addLayerRenderer(fn) {
  _layerRenderers.push(fn);
}

export function getCamera() {
  return camera;
}

export function destroy() {
  cancelAnimationFrame(rafId);
  window.removeEventListener('resize', onResize);
  canvas.removeEventListener('mousemove', onMouseMove);
  detachControls?.();
}

function loop() {
  render();
  rafId = requestAnimationFrame(loop);
}

function render() {
  const state = getState();
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  if (state.ui.mode === DISPLAY_MODE.EDIT) {
    drawGrid(ctx, w, h, camera, state.ui.gridSize);
  }

  for (const fn of _layerRenderers) {
    fn(ctx, canvas, camera, state);
  }
}

function onResize() {
  resizeCanvas();
}

function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

function onMouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  const world = screenToWorld(e.clientX - rect.left, e.clientY - rect.top, camera);
  const grid = worldToGridCoords(world.x, world.y, getState().ui.gridSize);
  updateCoords(grid.col, grid.row);
}
