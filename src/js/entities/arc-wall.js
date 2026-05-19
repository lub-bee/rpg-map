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

// ─── helpers arc ─────────────────────────────────────────────────────────────

/**
 * Génère un tableau de points écrantés le long de l'arc, ainsi que la tangente
 * en chaque point.
 * @returns {{ x, y, tx, ty }[]|null}
 */
function sampleArcPoints(center, radiusScreen, angleA, angleB, anticlockwise, spacing) {
  // Longueur d'arc approximative en pixels
  let delta = anticlockwise ? angleA - angleB : angleB - angleA;
  while (delta < 0) delta += 2 * Math.PI;
  const arcLen = radiusScreen * delta;
  if (arcLen < 0.001) return null;

  const count = Math.max(2, Math.floor(arcLen / spacing));
  const points = [];

  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const angle = anticlockwise
      ? angleA - delta * t
      : angleA + delta * t;

    const x = center.x + Math.cos(angle) * radiusScreen;
    const y = center.y + Math.sin(angle) * radiusScreen;

    // Tangente : dérivée de (cos θ, sin θ) = (-sin θ, cos θ), orientée selon sens
    const sign = anticlockwise ? -1 : 1;
    const tx = sign * (-Math.sin(angle));
    const ty = sign *   Math.cos(angle);

    // Perpendiculaire (vers l'extérieur du cercle)
    const px = Math.cos(angle);
    const py = Math.sin(angle);

    points.push({ x, y, tx, ty, px, py });
  }
  return points;
}

// ─── rendus arc par texture ───────────────────────────────────────────────────

function drawArcStone(ctx, center, radiusScreen, angleA, angleB, anticlockwise) {
  // Ligne principale
  ctx.beginPath();
  ctx.arc(center.x, center.y, radiusScreen, angleA, angleB, anticlockwise);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#9e9e9e';
  ctx.setLineDash([]);
  ctx.stroke();

  // Hachures croisées le long de l'arc
  const pts = sampleArcPoints(center, radiusScreen, angleA, angleB, anticlockwise, 8);
  if (!pts) return;

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#6e6e6e';
  const hl = 5;

  for (let i = 1; i < pts.length - 1; i++) {
    const { x: cx, y: cy, tx, ty, px, py } = pts[i];

    // Tiret "\" : tangente + perpendiculaire
    const ax = tx + px;
    const ay = ty + py;
    const al = Math.hypot(ax, ay);
    ctx.beginPath();
    ctx.moveTo(cx - (ax / al) * hl, cy - (ay / al) * hl);
    ctx.lineTo(cx + (ax / al) * hl, cy + (ay / al) * hl);
    ctx.stroke();

    // Tiret "/" : tangente - perpendiculaire
    const bx = tx - px;
    const by = ty - py;
    const bl = Math.hypot(bx, by);
    ctx.beginPath();
    ctx.moveTo(cx - (bx / bl) * hl, cy - (by / bl) * hl);
    ctx.lineTo(cx + (bx / bl) * hl, cy + (by / bl) * hl);
    ctx.stroke();
  }
}

function drawArcWood(ctx, center, radiusScreen, angleA, angleB, anticlockwise) {
  // Ligne principale
  ctx.beginPath();
  ctx.arc(center.x, center.y, radiusScreen, angleA, angleB, anticlockwise);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#a0522d';
  ctx.setLineDash([]);
  ctx.stroke();

  // Tirets parallèles à la tangente, décalés perpendiculairement
  const pts = sampleArcPoints(center, radiusScreen, angleA, angleB, anticlockwise, 10);
  if (!pts) return;

  const tlen   = 4;
  const offset = 3;
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#6b3219';

  for (let i = 1; i < pts.length - 1; i++) {
    const { x: cx, y: cy, tx, ty, px, py } = pts[i];

    ctx.beginPath();
    ctx.moveTo(cx - tx * tlen / 2 + px * offset, cy - ty * tlen / 2 + py * offset);
    ctx.lineTo(cx + tx * tlen / 2 + px * offset, cy + ty * tlen / 2 + py * offset);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - tx * tlen / 2 - px * offset, cy - ty * tlen / 2 - py * offset);
    ctx.lineTo(cx + tx * tlen / 2 - px * offset, cy + ty * tlen / 2 - py * offset);
    ctx.stroke();
  }
}

function drawArcGlass(ctx, center, radiusScreen, angleA, angleB, anticlockwise) {
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radiusScreen, angleA, angleB, anticlockwise);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#add8e6';
  ctx.setLineDash([8, 4]);
  ctx.stroke();
  ctx.restore();
}

function drawArcWater(ctx, center, radiusScreen, angleA, angleB, anticlockwise) {
  // Ligne ondulée : on varie le rayon avec une sinusoïde
  const amplitude = 3;
  const period    = 18;

  let delta = anticlockwise ? angleA - angleB : angleB - angleA;
  while (delta < 0) delta += 2 * Math.PI;
  const arcLen = radiusScreen * delta;
  const steps  = Math.max(2, Math.floor(arcLen / 2));

  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const t     = i / steps;
    const angle = anticlockwise ? angleA - delta * t : angleA + delta * t;
    const d     = t * arcLen;
    const wave  = amplitude * Math.sin((d / period) * 2 * Math.PI);
    const r     = radiusScreen + wave;
    const x     = center.x + Math.cos(angle) * r;
    const y     = center.y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else         ctx.lineTo(x, y);
  }
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#1e90ff';
  ctx.setLineDash([]);
  ctx.stroke();
}

function drawArcFire(ctx, center, radiusScreen, angleA, angleB, anticlockwise) {
  // Zigzag en faisant varier le rayon en dents de scie irrégulières
  const amplitude = 4;
  const period    = 10;

  let delta = anticlockwise ? angleA - angleB : angleB - angleA;
  while (delta < 0) delta += 2 * Math.PI;
  const arcLen = radiusScreen * delta;
  const steps  = Math.max(2, Math.floor(arcLen / period));

  ctx.beginPath();
  {
    const x0 = center.x + Math.cos(angleA) * radiusScreen;
    const y0 = center.y + Math.sin(angleA) * radiusScreen;
    ctx.moveTo(x0, y0);
  }

  for (let i = 1; i <= steps; i++) {
    const t      = i / steps;
    const angle  = anticlockwise ? angleA - delta * t : angleA + delta * t;
    const sign   = (i % 2 === 0) ? 1 : -1;
    const wobble = 0.6 + 0.4 * Math.sin(i * 2.3);
    const r      = radiusScreen + sign * amplitude * wobble;
    const x      = center.x + Math.cos(angle) * r;
    const y      = center.y + Math.sin(angle) * r;
    ctx.lineTo(x, y);
  }
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#ff4500';
  ctx.setLineDash([]);
  ctx.stroke();
}

function drawArcGrid(ctx, center, radiusScreen, angleA, angleB, anticlockwise) {
  ctx.beginPath();
  ctx.arc(center.x, center.y, radiusScreen, angleA, angleB, anticlockwise);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#7ec8e3';
  ctx.setLineDash([]);
  ctx.stroke();
}

// ─── dispatcher arc ───────────────────────────────────────────────────────────

function drawArcByTexture(ctx, texture, center, radiusScreen, angleA, angleB, anticlockwise) {
  switch (texture) {
    case 'stone': drawArcStone(ctx, center, radiusScreen, angleA, angleB, anticlockwise); break;
    case 'wood':  drawArcWood(ctx, center, radiusScreen, angleA, angleB, anticlockwise);  break;
    case 'glass': drawArcGlass(ctx, center, radiusScreen, angleA, angleB, anticlockwise); break;
    case 'water': drawArcWater(ctx, center, radiusScreen, angleA, angleB, anticlockwise); break;
    case 'fire':  drawArcFire(ctx, center, radiusScreen, angleA, angleB, anticlockwise);  break;
    default:      drawArcGrid(ctx, center, radiusScreen, angleA, angleB, anticlockwise);  break;
  }
}

// ─── API publique ─────────────────────────────────────────────────────────────

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

  if (selected) {
    ctx.beginPath();
    ctx.arc(center.x, center.y, radiusScreen, angleA, angleB, anticlockwise);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#e94560';
    ctx.setLineDash([]);
    ctx.stroke();
  } else if (preview) {
    ctx.beginPath();
    ctx.arc(center.x, center.y, radiusScreen, angleA, angleB, anticlockwise);
    ctx.lineWidth = 2;
    ctx.strokeStyle = TEXTURE_COLORS[arcWall.texture] ?? TEXTURE_COLORS.grid;
    ctx.globalAlpha = 0.6;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
  } else {
    drawArcByTexture(ctx, arcWall.texture ?? 'grid', center, radiusScreen, angleA, angleB, anticlockwise);
  }

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
