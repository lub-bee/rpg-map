import { screenToWorld, worldToScreen } from './coords.js';

export function drawGrid(ctx, canvasWidth, canvasHeight, camera, gridSize) {
  const topLeft = screenToWorld(0, 0, camera);
  const bottomRight = screenToWorld(canvasWidth, canvasHeight, camera);

  const startCol = Math.floor(topLeft.x / gridSize);
  const endCol = Math.ceil(bottomRight.x / gridSize);
  const startRow = Math.floor(topLeft.y / gridSize);
  const endRow = Math.ceil(bottomRight.y / gridSize);

  ctx.save();

  for (let col = startCol; col <= endCol; col++) {
    const sx = worldToScreen(col * gridSize, 0, camera).x;
    if (col % 10 === 0) {
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#4a4a6a';
    } else if (col % 5 === 0) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#3a3a5a';
    } else {
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = '#2a2a4a';
    }
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, canvasHeight);
    ctx.stroke();
  }

  for (let row = startRow; row <= endRow; row++) {
    const sy = worldToScreen(0, row * gridSize, camera).y;
    if (row % 10 === 0) {
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#4a4a6a';
    } else if (row % 5 === 0) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#3a3a5a';
    } else {
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = '#2a2a4a';
    }
    ctx.beginPath();
    ctx.moveTo(0, sy);
    ctx.lineTo(canvasWidth, sy);
    ctx.stroke();
  }

  ctx.restore();
}
