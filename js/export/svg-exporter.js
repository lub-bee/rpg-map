import { WALL_TYPE, ELEMENT_TYPE } from '../data/schema.js';

const TEXTURE_COLORS = {
  grid:  '#7ec8e3',
  stone: '#9e9e9e',
  wood:  '#a0522d',
  glass: '#add8e6',
  water: '#1e90ff',
  fire:  '#ff4500',
};

const PADDING = 32;
const MIN_W = 800;
const MIN_H = 600;

function computeBounds(level) {
  const xs = [];
  const ys = [];

  for (const n of level.nodes) {
    xs.push(n.x);
    ys.push(n.y);
  }
  for (const d of level.decorNodes) {
    xs.push(d.x);
    ys.push(d.y);
  }

  if (xs.length === 0) {
    return { minX: 0, minY: 0, width: MIN_W, height: MIN_H };
  }

  const minX = Math.min(...xs) - PADDING;
  const minY = Math.min(...ys) - PADDING;
  const maxX = Math.max(...xs) + PADDING;
  const maxY = Math.max(...ys) + PADDING;

  return {
    minX,
    minY,
    width:  Math.max(maxX - minX, MIN_W),
    height: Math.max(maxY - minY, MIN_H),
  };
}

function tx(wx, bounds) { return wx - bounds.minX; }
function ty(wy, bounds) { return wy - bounds.minY; }

function nodeById(nodes, id) {
  return nodes.find(n => n.id === id);
}

function lerp(a, b, t) { return a + (b - a) * t; }

function wallElements(wall, nodes, bounds) {
  if (!wall.elements || wall.elements.length === 0) return '';

  const fromNode = nodeById(nodes, wall.from);
  const toNode   = nodeById(nodes, wall.to);
  if (!fromNode || !toNode) return '';

  const x1 = tx(fromNode.x, bounds);
  const y1 = ty(fromNode.y, bounds);
  const x2 = tx(toNode.x, bounds);
  const y2 = ty(toNode.y, bounds);

  const dx = x2 - x1;
  const dy = y2 - y1;
  const wallAngle = Math.atan2(dy, dx);
  const perpAngle = wallAngle + Math.PI / 2;
  const cosP = Math.cos(perpAngle);
  const sinP = Math.sin(perpAngle);

  let out = '';
  for (const el of wall.elements) {
    const cx = lerp(x1, x2, el.offset);
    const cy = lerp(y1, y2, el.offset);
    const deg = (wallAngle * 180) / Math.PI;

    switch (el.type) {
      case ELEMENT_TYPE.DOOR: {
        const rx = cx - 2.5 * Math.cos(wallAngle) + 0 * cosP;
        const ry = cy - 2.5 * Math.sin(wallAngle) + 0 * sinP;
        out += `<rect x="${(rx - 0).toFixed(2)}" y="${(ry - 0).toFixed(2)}" width="5" height="10" fill="#8b4513" transform="rotate(${deg.toFixed(2)},${cx.toFixed(2)},${cy.toFixed(2)}) translate(${(-2.5).toFixed(2)},${(-10).toFixed(2)})"/>`;
        break;
      }
      case ELEMENT_TYPE.WINDOW: {
        const ax = cx + cosP * -8;
        const ay = cy + sinP * -8;
        const bx = cx + cosP * 8;
        const by = cy + sinP * 8;
        out += `<line x1="${ax.toFixed(2)}" y1="${ay.toFixed(2)}" x2="${bx.toFixed(2)}" y2="${by.toFixed(2)}" stroke="#add8e6" stroke-width="2" stroke-dasharray="3 3"/>`;
        break;
      }
      case ELEMENT_TYPE.SECRET: {
        const ax = cx + cosP * -6;
        const ay = cy + sinP * -6;
        const bx = cx + cosP * 6;
        const by = cy + sinP * 6;
        out += `<line x1="${ax.toFixed(2)}" y1="${ay.toFixed(2)}" x2="${bx.toFixed(2)}" y2="${by.toFixed(2)}" stroke="#555555" stroke-width="1.5" stroke-dasharray="2 4"/>`;
        break;
      }
      case ELEMENT_TYPE.CARPET: {
        out += `<rect x="${(cx - 6).toFixed(2)}" y="${(cy - 6).toFixed(2)}" width="12" height="12" fill="#8b0000" opacity="0.5"/>`;
        break;
      }
    }
  }
  return out;
}

function svgWalls(level, bounds) {
  let lines = '';
  let elements = '';

  for (const wall of level.walls) {
    if (wall.type === WALL_TYPE.SEPARATOR) continue;

    const color = TEXTURE_COLORS[wall.texture] ?? TEXTURE_COLORS.grid;

    if (wall.type === WALL_TYPE.ARC) {
      const fromNode = nodeById(level.nodes, wall.from);
      const toNode   = nodeById(level.nodes, wall.to);
      if (!fromNode || !toNode) continue;

      const wCx = wall.cx;
      const wCy = wall.cy;
      const distA = Math.hypot(fromNode.x - wCx, fromNode.y - wCy);
      const distB = Math.hypot(toNode.x   - wCx, toNode.y   - wCy);
      const radius = (distA + distB) / 2;
      if (radius < 0.001) continue;

      const angleA = Math.atan2(fromNode.y - wCy, fromNode.x - wCx);
      const angleB = Math.atan2(toNode.y   - wCy, toNode.x   - wCx);

      let delta = angleB - angleA;
      while (delta > Math.PI)  delta -= 2 * Math.PI;
      while (delta < -Math.PI) delta += 2 * Math.PI;
      const anticlockwise = delta < 0;

      const x1 = tx(fromNode.x, bounds);
      const y1 = ty(fromNode.y, bounds);
      const x2 = tx(toNode.x, bounds);
      const y2 = ty(toNode.y, bounds);

      const largeArcFlag = Math.abs(delta) > Math.PI ? 1 : 0;
      const sweepFlag = anticlockwise ? 0 : 1;

      lines += `<path d="M ${x1.toFixed(2)},${y1.toFixed(2)} A ${radius.toFixed(2)},${radius.toFixed(2)} 0 ${largeArcFlag},${sweepFlag} ${x2.toFixed(2)},${y2.toFixed(2)}" stroke="${color}" stroke-width="3" fill="none"/>`;
    } else {
      const fromNode = nodeById(level.nodes, wall.from);
      const toNode   = nodeById(level.nodes, wall.to);
      if (!fromNode || !toNode) continue;

      const x1 = tx(fromNode.x, bounds).toFixed(2);
      const y1 = ty(fromNode.y, bounds).toFixed(2);
      const x2 = tx(toNode.x, bounds).toFixed(2);
      const y2 = ty(toNode.y, bounds).toFixed(2);

      lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="3"/>`;
    }

    elements += wallElements(wall, level.nodes, bounds);
  }

  return `<g id="walls">${lines}${elements}</g>`;
}

function svgDecor(level, bounds) {
  let out = '';
  const sorted = [...level.decorNodes].sort((a, b) => a.layer - b.layer);

  for (const d of sorted) {
    const x = tx(d.x, bounds);
    const y = ty(d.y, bounds);

    switch (d.elementType) {
      case 'table':
        out += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="12" fill="#8b4513"/>`;
        break;
      case 'chair':
        out += `<rect x="${(x - 4).toFixed(2)}" y="${(y - 4).toFixed(2)}" width="8" height="8" fill="#a0522d"/>`;
        break;
      case 'bed':
        out += `<rect x="${(x - 10).toFixed(2)}" y="${(y - 6).toFixed(2)}" width="20" height="12" fill="#4a4a8a"/>`;
        break;
      case 'candle':
        out += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="3" fill="#ffcc00"/>`;
        break;
      case 'rug':
      case 'carpet':
        out += `<ellipse cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" rx="30" ry="20" fill="#8b0000" opacity="0.4"/>`;
        break;
      case 'fireplace':
        out += `<rect x="${(x - 8).toFixed(2)}" y="${(y - 4).toFixed(2)}" width="16" height="8" fill="#ff4500"/>`;
        break;
      case 'nightstand':
        out += `<rect x="${(x - 4).toFixed(2)}" y="${(y - 4).toFixed(2)}" width="8" height="8" fill="#5a3a1a"/>`;
        break;
      case 'armchair':
        out += `<rect x="${(x - 5).toFixed(2)}" y="${(y - 5).toFixed(2)}" width="10" height="10" rx="5" fill="#6a4a2a"/>`;
        break;
      case 'stool':
      case 'tabouret':
        out += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="5" fill="#7a5a3a"/>`;
        break;
      default: {
        const pts = `${x.toFixed(2)},${(y - 8).toFixed(2)} ${(x + 8).toFixed(2)},${y.toFixed(2)} ${x.toFixed(2)},${(y + 8).toFixed(2)} ${(x - 8).toFixed(2)},${y.toFixed(2)}`;
        out += `<polygon points="${pts}" fill="#888888"/>`;
      }
    }
  }

  return `<g id="decor">${out}</g>`;
}

function svgAreas(level, bounds) {
  let out = '';
  for (const area of level.areas) {
    if (!area.nodeIds || area.nodeIds.length < 3) continue;

    const points = area.nodeIds.map(id => {
      const n = nodeById(level.nodes, id);
      if (!n) return null;
      return `${tx(n.x, bounds).toFixed(2)},${ty(n.y, bounds).toFixed(2)}`;
    }).filter(Boolean);

    if (points.length < 3) continue;

    const cx = area.nodeIds.reduce((s, id) => {
      const n = nodeById(level.nodes, id);
      return s + (n ? tx(n.x, bounds) : 0);
    }, 0) / area.nodeIds.length;
    const cy = area.nodeIds.reduce((s, id) => {
      const n = nodeById(level.nodes, id);
      return s + (n ? ty(n.y, bounds) : 0);
    }, 0) / area.nodeIds.length;

    out += `<polygon points="${points.join(' ')}" fill="${area.color}" opacity="0.3"/>`;
    out += `<text x="${cx.toFixed(2)}" y="${cy.toFixed(2)}" font-family="sans-serif" font-size="12" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${area.name}</text>`;
  }

  return `<g id="areas">${out}</g>`;
}

export function exportSVG(state) {
  const { map, ui } = state;
  const level = map.levels[ui.activeLevelIndex];
  if (!level) return;

  const bounds = computeBounds(level);
  const { width, height } = bounds;

  const bgColor = ui.mode === 'preview' ? '#1a1a2e' : '#111827';

  const svgParts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="${width}" height="${height}" fill="${bgColor}"/>`,
    svgWalls(level, bounds),
    svgDecor(level, bounds),
    svgAreas(level, bounds),
    `</svg>`,
  ];

  const svgString = svgParts.join('\n');
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  const name = map.meta?.name || 'map';
  const timestamp = Date.now();
  const filename = `${name}-level${ui.activeLevelIndex}-${timestamp}.svg`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
