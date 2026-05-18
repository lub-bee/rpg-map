import { ELEMENT_TYPE } from '../data/schema.js';
import { worldToScreen } from '../canvas/coords.js';
import { addLayerRenderer } from '../canvas/renderer.js';

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function getSegment(wall, nodes, camera) {
  const fromNode = nodes.find(n => n.id === wall.from);
  const toNode   = nodes.find(n => n.id === wall.to);
  if (!fromNode || !toNode) return null;
  return {
    from: worldToScreen(fromNode.x, fromNode.y, camera),
    to:   worldToScreen(toNode.x,   toNode.y,   camera),
  };
}

function perpAngle(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return Math.atan2(dy, dx) + Math.PI / 2;
}

export function drawWallElements(ctx, wall, nodes, camera) {
  if (!wall.elements || wall.elements.length === 0) return;

  const seg = getSegment(wall, nodes, camera);
  if (!seg) return;

  const angle = perpAngle(seg.from, seg.to);
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);

  for (const el of wall.elements) {
    const cx = lerp(seg.from.x, seg.to.x, el.offset);
    const cy = lerp(seg.from.y, seg.to.y, el.offset);

    ctx.save();
    ctx.translate(cx, cy);

    switch (el.type) {
      case ELEMENT_TYPE.DOOR: {
        ctx.fillStyle = '#8b4513';
        ctx.rotate(angle);
        ctx.fillRect(-2.5, -10, 5, 10);
        break;
      }
      case ELEMENT_TYPE.WINDOW: {
        ctx.strokeStyle = '#add8e6';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(cosA * -8, sinA * -8);
        ctx.lineTo(cosA * 8,  sinA * 8);
        ctx.stroke();
        break;
      }
      case ELEMENT_TYPE.OPENING: {
        const wallAngle = Math.atan2(seg.to.y - seg.from.y, seg.to.x - seg.from.x);
        ctx.rotate(wallAngle);
        ctx.clearRect(-8, -4, 16, 8);
        break;
      }
      case ELEMENT_TYPE.SECRET: {
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.moveTo(cosA * -6, sinA * -6);
        ctx.lineTo(cosA * 6,  sinA * 6);
        ctx.stroke();
        break;
      }
      case ELEMENT_TYPE.CARPET: {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#8b0000';
        ctx.fillRect(-6, -6, 12, 12);
        break;
      }
    }

    ctx.restore();
  }
}

export function drawWallElementsAll(ctx, canvas, camera, state) {
  const level = state.map.levels[state.ui.activeLevelIndex];
  if (!level) return;
  for (const wall of level.walls) {
    drawWallElements(ctx, wall, level.nodes, camera);
  }
}

export function initWallElements() {
  addLayerRenderer(drawWallElementsAll);
}
