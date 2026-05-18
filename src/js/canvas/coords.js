export function screenToWorld(sx, sy, camera) {
  return {
    x: sx / camera.zoom + camera.x,
    y: sy / camera.zoom + camera.y,
  };
}

export function worldToScreen(wx, wy, camera) {
  return {
    x: (wx - camera.x) * camera.zoom,
    y: (wy - camera.y) * camera.zoom,
  };
}

export function snapToGrid(wx, wy, gridSize) {
  return {
    x: Math.round(wx / gridSize) * gridSize,
    y: Math.round(wy / gridSize) * gridSize,
  };
}

export function worldToGridCoords(wx, wy, gridSize) {
  return {
    col: Math.round(wx / gridSize),
    row: Math.round(wy / gridSize),
  };
}

export function gridToWorld(col, row, gridSize) {
  return {
    x: col * gridSize,
    y: row * gridSize,
  };
}
