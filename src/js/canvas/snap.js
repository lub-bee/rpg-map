import { screenToWorld, worldToScreen, snapToGrid, worldToGridCoords } from './coords.js';

export function snapScreenToGrid(sx, sy, camera, gridSize) {
  const world = screenToWorld(sx, sy, camera);
  const snapped = snapToGrid(world.x, world.y, gridSize);
  const { col, row } = worldToGridCoords(snapped.x, snapped.y, gridSize);
  return { wx: snapped.x, wy: snapped.y, col, row };
}

export function isNearNode(wx, wy, nodes, camera, gridSize, thresholdPx = 12) {
  const origin = worldToScreen(wx, wy, camera);
  let closest = null;
  let minDist = Infinity;

  for (const node of nodes) {
    const screen = worldToScreen(node.x, node.y, camera);
    const dx = screen.x - origin.x;
    const dy = screen.y - origin.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < thresholdPx && dist < minDist) {
      minDist = dist;
      closest = node;
    }
  }

  return closest;
}
