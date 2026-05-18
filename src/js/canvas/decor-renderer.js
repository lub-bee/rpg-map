import { addLayerRenderer } from './renderer.js';
import { worldToScreen } from './coords.js';
import { LAYER } from '../data/schema.js';

export function drawDecorNode(ctx, decorNode, camera) {
  const { x: sx, y: sy } = worldToScreen(decorNode.x, decorNode.y, camera);

  ctx.save();

  switch (decorNode.elementType) {
    case 'table':
      ctx.fillStyle = '#8b4513';
      ctx.beginPath();
      ctx.arc(sx, sy, 12, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'chair':
      ctx.fillStyle = '#a0522d';
      ctx.fillRect(sx - 4, sy - 4, 8, 8);
      break;

    case 'bed':
      ctx.fillStyle = '#4a4a8a';
      ctx.fillRect(sx - 10, sy - 6, 20, 12);
      break;

    case 'candle':
      ctx.shadowColor = '#ffcc00';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'rug':
    case 'carpet':
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#8b0000';
      ctx.beginPath();
      ctx.ellipse(sx, sy, 30, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'fireplace':
      ctx.fillStyle = '#ff4500';
      ctx.fillRect(sx - 8, sy - 4, 16, 8);
      break;

    case 'nightstand':
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(sx - 4, sy - 4, 8, 8);
      break;

    case 'armchair': {
      ctx.fillStyle = '#6a4a2a';
      const r = 5;
      ctx.beginPath();
      ctx.moveTo(sx - 5 + r, sy - 5);
      ctx.lineTo(sx + 5 - r, sy - 5);
      ctx.quadraticCurveTo(sx + 5, sy - 5, sx + 5, sy - 5 + r);
      ctx.lineTo(sx + 5, sy + 5 - r);
      ctx.quadraticCurveTo(sx + 5, sy + 5, sx + 5 - r, sy + 5);
      ctx.lineTo(sx - 5 + r, sy + 5);
      ctx.quadraticCurveTo(sx - 5, sy + 5, sx - 5, sy + 5 - r);
      ctx.lineTo(sx - 5, sy - 5 + r);
      ctx.quadraticCurveTo(sx - 5, sy - 5, sx - 5 + r, sy - 5);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'stool':
    case 'tabouret':
      ctx.fillStyle = '#7a5a3a';
      ctx.beginPath();
      ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.fill();
      break;

    default:
      ctx.fillStyle = '#888888';
      ctx.beginPath();
      ctx.moveTo(sx, sy - 8);
      ctx.lineTo(sx + 8, sy);
      ctx.lineTo(sx, sy + 8);
      ctx.lineTo(sx - 8, sy);
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

    const sorted = [...level.decorNodes].sort((a, b) => a.layer - b.layer);
    for (const node of sorted) {
      drawDecorNode(ctx, node, camera);
    }
  });
}
