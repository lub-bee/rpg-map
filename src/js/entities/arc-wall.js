import { createId } from '../data/schema.js';
import { WALL_TYPE, TEXTURE } from '../data/schema.js';
import { worldToScreen } from '../canvas/coords.js';

const TEXTURE_COLORS = {
  grid:  '#7ec8e3',
  stone: '#9e9e9e',
  wood:  '#a0522d',
  glass: '#add8e6',
  water: '#1e90ff',
  fire:  '#ff4500',
};

export function createArcWall(fromNodeId, toNodeId, cx, cy, options = {}) {
  return {
    id: createId(),
    type: WALL_TYPE.ARC,
    from: fromNodeId,
    to: toNodeId,
    cx,
    cy,
    texture: TEXTURE.GRID,
    elements: [],
    ...options,
  };
}

export function drawArcWall(ctx, arcWall, nodes, camera, options = {}) {
  const { selected = false, preview = false } = options;

  const fromNode = nodes.find(n => n.id === arcWall.from);
  const toNode   = nodes.find(n => n.id === arcWall.to);
  if (!fromNode || !toNode) return;

  const worldA = { x: fromNode.x, y: fromNode.y };
  const worldB = { x: toNode.x,   y: toNode.y   };
  const worldC = { x: arcWall.cx, y: arcWall.cy  };

  const distA = Math.hypot(worldA.x - worldC.x, worldA.y - worldC.y);
  const distB = Math.hypot(worldB.x - worldC.x, worldB.y - worldC.y);
  const radius = (distA + distB) / 2;

  if (radius < 0.001) return;

  const angleA = Math.atan2(worldA.y - worldC.y, worldA.x - worldC.x);
  const angleB = Math.atan2(worldB.y - worldC.y, worldB.x - worldC.x);

  const center = worldToScreen(worldC.x, worldC.y, camera);
  const radiusScreen = radius * camera.zoom;

  // Determine shortest arc direction
  let delta = angleB - angleA;
  while (delta > Math.PI)  delta -= 2 * Math.PI;
  while (delta < -Math.PI) delta += 2 * Math.PI;
  const anticlockwise = delta < 0;

  ctx.save();
  ctx.beginPath();
  ctx.arc(center.x, center.y, radiusScreen, angleA, angleB, anticlockwise);

  if (selected) {
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#e94560';
    ctx.setLineDash([]);
  } else if (preview) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = TEXTURE_COLORS[arcWall.texture] ?? TEXTURE_COLORS.grid;
    ctx.globalAlpha = 0.6;
    ctx.setLineDash([6, 4]);
  } else {
    ctx.lineWidth = 3;
    ctx.strokeStyle = TEXTURE_COLORS[arcWall.texture] ?? TEXTURE_COLORS.grid;
    ctx.setLineDash([]);
  }

  ctx.stroke();
  ctx.restore();
}

export function drawArcWalls(ctx, walls, nodes, camera, state) {
  const selectedIds = state.ui?.selectedIds ?? [];

  for (const wall of walls) {
    if (wall.type !== WALL_TYPE.ARC) continue;
    drawArcWall(ctx, wall, nodes, camera, {
      selected: selectedIds.includes(wall.id),
    });
  }
}
