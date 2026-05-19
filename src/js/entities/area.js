import { worldToScreen } from '../canvas/coords.js';

export function drawAreaOverlay(ctx, area, nodes, camera) {
  if (!area.nodeIds || area.nodeIds.length < 3) return;

  const points = area.nodeIds.map(id => {
    const n = nodes.find(n => n.id === id);
    if (!n) return null;
    return worldToScreen(n.x, n.y, camera);
  }).filter(Boolean);

  if (points.length < 3) return;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.fillStyle = area.color;
  ctx.fill();

  const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
  const cy = points.reduce((s, p) => s + p.y, 0) / points.length;

  ctx.font = '12px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(area.name, cx, cy);
  ctx.restore();
}

export function drawAreasOverlay(ctx, areas, nodes, camera) {
  for (const area of areas) {
    drawAreaOverlay(ctx, area, nodes, camera);
  }
}
