import { worldToScreen } from '../canvas/coords.js';

const TEXTURE_COLORS = {
  grid:  '#7ec8e3',
  stone: '#9e9e9e',
  wood:  '#a0522d',
  glass: '#add8e6',
  water: '#1e90ff',
  fire:  '#ff4500',
};

export function drawWall(ctx, wall, nodes, camera, options = {}) {
  const { selected = false, preview = false } = options;

  const fromNode = nodes.find(n => n.id === wall.from);
  const toNode   = nodes.find(n => n.id === wall.to);
  if (!fromNode || !toNode) return;

  const from = worldToScreen(fromNode.x, fromNode.y, camera);
  const to   = worldToScreen(toNode.x,   toNode.y,   camera);

  ctx.save();

  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);

  if (selected) {
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#e94560';
    ctx.setLineDash([]);
  } else if (preview) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = TEXTURE_COLORS[wall.texture] ?? TEXTURE_COLORS.grid;
    ctx.globalAlpha = 0.6;
    ctx.setLineDash([6, 4]);
  } else {
    ctx.lineWidth = 3;
    ctx.strokeStyle = TEXTURE_COLORS[wall.texture] ?? TEXTURE_COLORS.grid;
    ctx.setLineDash([]);
  }

  ctx.stroke();
  ctx.restore();
}

export function drawWalls(ctx, walls, nodes, camera, state) {
  const selectedIds = state.ui?.selectedIds ?? new Set();

  for (const wall of walls) {
    drawWall(ctx, wall, nodes, camera, {
      selected: selectedIds.has(wall.id),
    });
  }
}
