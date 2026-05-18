import { worldToScreen } from '../canvas/coords.js';

export function drawNode(ctx, node, camera, options = {}) {
  const { highlight = false, selected = false, isOrigin = false } = options;
  const { x, y } = worldToScreen(node.x, node.y, camera);

  ctx.save();

  if (isOrigin) {
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 204, 0, 0.2)';
    ctx.fill();
  }

  let radius = 5;
  let color = '#7ec8e3';

  if (isOrigin) {
    radius = 8;
    color = '#ffcc00';
  } else if (selected) {
    radius = 6;
    color = '#e94560';
  } else if (highlight) {
    radius = 7;
    color = '#ffffff';
  }

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.restore();
}

export function drawNodes(ctx, nodes, camera, state, originNodeId = null) {
  const selectedIds = state.ui?.selectedIds ?? [];
  const hoverNodeId = state.ui?._hoverNodeId ?? null;

  for (const node of nodes) {
    drawNode(ctx, node, camera, {
      highlight: node.id === hoverNodeId,
      selected: selectedIds.includes(node.id),
      isOrigin: node.id === originNodeId,
    });
  }
}
