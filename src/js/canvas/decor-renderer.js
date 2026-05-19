import { addLayerRenderer } from './renderer.js';
import { worldToScreen } from './coords.js';
import { LAYER } from '../data/schema.js';
import { ELEMENT_DIMENSIONS } from '../data/presets.js';

// Retourne les demi-dimensions en pixels pour un elementType donné
function halfPx(elementType, gridSize, zoom) {
  const dim = ELEMENT_DIMENSIONS[elementType] ?? { width: 1, height: 1 };
  const scale = gridSize * zoom;
  return {
    hw: (dim.width  * scale) / 2,
    hh: (dim.height * scale) / 2,
  };
}

export function drawDecorNode(ctx, decorNode, camera, gridSize) {
  const { x: sx, y: sy } = worldToScreen(decorNode.x, decorNode.y, camera);
  const gs = gridSize ?? 64;
  const rotation = (decorNode.rotation ?? 0) * (Math.PI / 180);

  ctx.save();
  ctx.translate(sx, sy);
  if (rotation !== 0) ctx.rotate(rotation);

  const { hw, hh } = halfPx(decorNode.elementType, gs, camera.zoom);

  switch (decorNode.elementType) {
    case 'table':
      ctx.fillStyle = '#8b4513';
      ctx.beginPath();
      ctx.ellipse(0, 0, hw, hh, 0, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'chair':
      ctx.fillStyle = '#a0522d';
      ctx.fillRect(-hw, -hh, hw * 2, hh * 2);
      break;

    case 'bed':
      ctx.fillStyle = '#4a4a8a';
      ctx.fillRect(-hw, -hh, hw * 2, hh * 2);
      // tête de lit
      ctx.fillStyle = '#6a6aaa';
      ctx.fillRect(-hw, -hh, hw * 2, hh * 0.25);
      break;

    case 'candle':
      ctx.shadowColor = '#ffcc00';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.arc(0, 0, hw, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'rug':
    case 'carpet':
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#8b0000';
      ctx.beginPath();
      ctx.ellipse(0, 0, hw, hh, 0, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'fireplace':
      ctx.fillStyle = '#555';
      ctx.fillRect(-hw, -hh, hw * 2, hh * 2);
      ctx.fillStyle = '#ff4500';
      ctx.fillRect(-hw * 0.5, -hh * 0.6, hw, hh * 1.2);
      break;

    case 'nightstand':
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(-hw, -hh, hw * 2, hh * 2);
      break;

    case 'armchair': {
      ctx.fillStyle = '#6a4a2a';
      const r = Math.min(hw, hh) * 0.3;
      ctx.beginPath();
      ctx.moveTo(-hw + r, -hh);
      ctx.lineTo( hw - r, -hh);
      ctx.quadraticCurveTo( hw, -hh,  hw, -hh + r);
      ctx.lineTo( hw,  hh - r);
      ctx.quadraticCurveTo( hw,  hh,  hw - r,  hh);
      ctx.lineTo(-hw + r,  hh);
      ctx.quadraticCurveTo(-hw,  hh, -hw,  hh - r);
      ctx.lineTo(-hw, -hh + r);
      ctx.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'stool':
    case 'tabouret':
      ctx.fillStyle = '#7a5a3a';
      ctx.beginPath();
      ctx.arc(0, 0, hw, 0, Math.PI * 2);
      ctx.fill();
      break;

    default:
      ctx.fillStyle = '#888888';
      ctx.beginPath();
      ctx.moveTo(0, -hw);
      ctx.lineTo(hw, 0);
      ctx.lineTo(0, hw);
      ctx.lineTo(-hw, 0);
      ctx.closePath();
      ctx.fill();
      break;
  }

  ctx.restore();
}

export function initDecorRenderer() {
  addLayerRenderer((ctx, canvas, camera, state) => {
    const level = state.map.levels[state.ui.activeLevelIndex];
    if (!level || !level.decorNodes) return;

    const gridSize = state.map.meta.gridSize ?? state.ui.gridSize ?? 64;
    const sorted = [...level.decorNodes].sort((a, b) => a.layer - b.layer);
    for (const node of sorted) {
      drawDecorNode(ctx, node, camera, gridSize);
    }
  });
}
