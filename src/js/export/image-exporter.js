import { getState } from '../core/state.js';

export function exportPNG(canvas) {
  const state = getState();
  const name = state.map.meta?.name || 'map';
  const levelIndex = state.ui.activeLevelIndex;
  const timestamp = Date.now();
  const filename = `${name}-level${levelIndex}-${timestamp}.png`;

  const dataURL = canvas.toDataURL('image/png');

  const a = document.createElement('a');
  a.href = dataURL;
  a.download = filename;
  a.click();
}
