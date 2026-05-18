import { screenToWorld } from './coords.js';

const ZOOM_MIN = 0.1;
const ZOOM_MAX = 10;

export function createCamera() {
  return { x: 0, y: 0, zoom: 1 };
}

export function pan(camera, dxScreen, dyScreen) {
  return {
    ...camera,
    x: camera.x - dxScreen / camera.zoom,
    y: camera.y - dyScreen / camera.zoom,
  };
}

export function zoomAt(camera, factor, pivotSx, pivotSy) {
  const newZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, camera.zoom * factor));
  const worldBefore = screenToWorld(pivotSx, pivotSy, camera);
  const worldAfter = screenToWorld(pivotSx, pivotSy, { ...camera, zoom: newZoom });
  return {
    zoom: newZoom,
    x: camera.x + (worldBefore.x - worldAfter.x),
    y: camera.y + (worldBefore.y - worldAfter.y),
  };
}

export function attachCameraControls(canvas, onChange) {
  let camera = createCamera();
  let isPanning = false;
  let spaceDown = false;
  let lastX = 0;
  let lastY = 0;

  function update(newCamera) {
    camera = newCamera;
    onChange(camera);
  }

  function onWheel(e) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const rect = canvas.getBoundingClientRect();
    update(zoomAt(camera, factor, e.clientX - rect.left, e.clientY - rect.top));
  }

  function onMouseDown(e) {
    if (e.button === 1 || (e.button === 0 && spaceDown)) {
      e.preventDefault();
      isPanning = true;
      lastX = e.clientX;
      lastY = e.clientY;
    }
  }

  function onMouseMove(e) {
    if (!isPanning) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    update(pan(camera, dx, dy));
  }

  function onMouseUp(e) {
    if (e.button === 1 || (e.button === 0 && spaceDown)) {
      isPanning = false;
    }
  }

  function onKeyDown(e) {
    if (e.code === 'Space' && !e.repeat) {
      spaceDown = true;
      e.preventDefault();
    }
  }

  function onKeyUp(e) {
    if (e.code === 'Space') {
      spaceDown = false;
      isPanning = false;
    }
  }

  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  return function detach() {
    canvas.removeEventListener('wheel', onWheel);
    canvas.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  };
}
