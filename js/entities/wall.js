import { worldToScreen } from '../canvas/coords.js';
import { WALL_TYPE } from '../data/schema.js';

const TEXTURE_COLORS = {
  grid:  '#7ec8e3',
  stone: '#9e9e9e',
  wood:  '#a0522d',
  glass: '#add8e6',
  water: '#1e90ff',
  fire:  '#ff4500',
};

// ─── helpers ────────────────────────────────────────────────────────────────

/** Retourne le vecteur directeur unitaire et sa perpendiculaire pour un segment. */
function segmentVectors(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len < 0.001) return null;
  const ux = dx / len;    // vecteur directeur unitaire
  const uy = dy / len;
  const px = -uy;          // vecteur perpendiculaire (90° CCW)
  const py =  ux;
  return { ux, uy, px, py, len };
}

// ─── rendus par texture ──────────────────────────────────────────────────────

function drawStone(ctx, from, to) {
  const v = segmentVectors(from, to);
  if (!v) return;

  // Ligne principale épaisse gris moyen
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#9e9e9e';
  ctx.setLineDash([]);
  ctx.stroke();

  // Hachures croisées perpendiculaires : tirets courts à 45° des deux côtés
  const step = 8;   // espacement le long du mur
  const hl   = 5;   // demi-longueur du tiret
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#6e6e6e';

  for (let d = step; d < v.len - 2; d += step) {
    const cx = from.x + v.ux * d;
    const cy = from.y + v.uy * d;

    // Tiret "\" : direction (ux+px, uy+py) normalisée
    const ax = v.ux + v.px;
    const ay = v.uy + v.py;
    const al = Math.hypot(ax, ay);
    ctx.beginPath();
    ctx.moveTo(cx - (ax / al) * hl, cy - (ay / al) * hl);
    ctx.lineTo(cx + (ax / al) * hl, cy + (ay / al) * hl);
    ctx.stroke();

    // Tiret "/" : direction (ux-px, uy-py) normalisée
    const bx = v.ux - v.px;
    const by = v.uy - v.py;
    const bl = Math.hypot(bx, by);
    ctx.beginPath();
    ctx.moveTo(cx - (bx / bl) * hl, cy - (by / bl) * hl);
    ctx.lineTo(cx + (bx / bl) * hl, cy + (by / bl) * hl);
    ctx.stroke();
  }
}

function drawWood(ctx, from, to) {
  const v = segmentVectors(from, to);
  if (!v) return;

  // Ligne principale brun
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#a0522d';
  ctx.setLineDash([]);
  ctx.stroke();

  // Tirets parallèles au mur des deux côtés (style planches)
  const step   = 10;   // espacement entre tirets
  const tlen   = 4;    // longueur du tiret parallèle
  const offset = 3;    // décalage perpendiculaire
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#6b3219';

  for (let d = step; d < v.len - 2; d += step) {
    const cx = from.x + v.ux * d;
    const cy = from.y + v.uy * d;

    // Tiret côté +perp
    ctx.beginPath();
    ctx.moveTo(cx - v.ux * tlen / 2 + v.px * offset,
               cy - v.uy * tlen / 2 + v.py * offset);
    ctx.lineTo(cx + v.ux * tlen / 2 + v.px * offset,
               cy + v.uy * tlen / 2 + v.py * offset);
    ctx.stroke();

    // Tiret côté -perp
    ctx.beginPath();
    ctx.moveTo(cx - v.ux * tlen / 2 - v.px * offset,
               cy - v.uy * tlen / 2 - v.py * offset);
    ctx.lineTo(cx + v.ux * tlen / 2 - v.px * offset,
               cy + v.uy * tlen / 2 - v.py * offset);
    ctx.stroke();
  }
}

function drawGlass(ctx, from, to) {
  // Ligne fine bleu très clair semi-transparente en tirets
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#add8e6';
  ctx.setLineDash([8, 4]);
  ctx.stroke();
  ctx.restore();
}

function drawWater(ctx, from, to) {
  const v = segmentVectors(from, to);
  if (!v) return;

  // Ligne ondulée via sinusoïde le long du segment
  const amplitude = 3;
  const period    = 18;   // px entre deux crêtes
  const steps     = Math.max(2, Math.floor(v.len / 2));

  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const d    = (i / steps) * v.len;
    const wave = amplitude * Math.sin((d / period) * 2 * Math.PI);
    const x    = from.x + v.ux * d + v.px * wave;
    const y    = from.y + v.uy * d + v.py * wave;
    if (i === 0) ctx.moveTo(x, y);
    else         ctx.lineTo(x, y);
  }
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#1e90ff';
  ctx.setLineDash([]);
  ctx.stroke();
}

function drawFire(ctx, from, to) {
  const v = segmentVectors(from, to);
  if (!v) return;

  // Ligne en zigzag irrégulier orange-rouge
  const amplitude = 4;
  const period    = 10;   // px entre deux dents
  const steps     = Math.max(2, Math.floor(v.len / period));

  ctx.beginPath();
  ctx.moveTo(from.x, from.y);

  for (let i = 1; i <= steps; i++) {
    const d      = (i / steps) * v.len;
    const sign   = (i % 2 === 0) ? 1 : -1;
    const wobble = 0.6 + 0.4 * Math.sin(i * 2.3);  // irrégularité déterministe
    const x = from.x + v.ux * d + v.px * sign * amplitude * wobble;
    const y = from.y + v.uy * d + v.py * sign * amplitude * wobble;
    ctx.lineTo(x, y);
  }
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#ff4500';
  ctx.setLineDash([]);
  ctx.stroke();
}

function drawGrid(ctx, from, to) {
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#7ec8e3';
  ctx.setLineDash([]);
  ctx.stroke();
}

// ─── dispatcher ─────────────────────────────────────────────────────────────

function drawWallByTexture(ctx, from, to, texture) {
  switch (texture) {
    case 'stone': drawStone(ctx, from, to); break;
    case 'wood':  drawWood(ctx, from, to);  break;
    case 'glass': drawGlass(ctx, from, to); break;
    case 'water': drawWater(ctx, from, to); break;
    case 'fire':  drawFire(ctx, from, to);  break;
    default:      drawGrid(ctx, from, to);  break;
  }
}

// ─── API publique ────────────────────────────────────────────────────────────

export function drawWall(ctx, wall, nodes, camera, options = {}) {
  const { selected = false, preview = false } = options;

  const fromNode = nodes.find(n => n.id === wall.from);
  const toNode   = nodes.find(n => n.id === wall.to);
  if (!fromNode || !toNode) return;

  const from = worldToScreen(fromNode.x, fromNode.y, camera);
  const to   = worldToScreen(toNode.x,   toNode.y,   camera);

  ctx.save();

  if (selected) {
    // Highlight rouge — style inchangé
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#e94560';
    ctx.setLineDash([]);
    ctx.stroke();
  } else if (preview) {
    // Preview : tirets colorés semi-transparents (style précédent conservé)
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.lineWidth = 2;
    ctx.strokeStyle = TEXTURE_COLORS[wall.texture] ?? TEXTURE_COLORS.grid;
    ctx.globalAlpha = 0.6;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
  } else {
    // Rendu normal : style architectural par texture
    drawWallByTexture(ctx, from, to, wall.texture ?? 'grid');
  }

  ctx.restore();
}

export function drawWalls(ctx, walls, nodes, camera, state) {
  const selectedIds = state.ui?.selectedIds ?? [];

  for (const wall of walls) {
    if (wall.type === WALL_TYPE.ARC) continue;
    drawWall(ctx, wall, nodes, camera, {
      selected: selectedIds.includes(wall.id),
    });
  }
}
