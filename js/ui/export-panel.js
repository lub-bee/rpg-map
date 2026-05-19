import { exportJSON, importJSON } from '../export/json-exporter.js';
import { exportSVG } from '../export/svg-exporter.js';
import { exportPNG } from '../export/image-exporter.js';
import { getState } from '../core/state.js';

export function initExportPanel() {
  const canvas = document.getElementById('map-canvas');

  // Nouveaux IDs directs (handoff v2)
  document.getElementById('save-json')?.addEventListener('click', () => exportJSON());
  document.getElementById('load-json')?.addEventListener('click', () => importJSON());
  document.getElementById('export-svg')?.addEventListener('click', () => exportSVG(getState()));
  document.getElementById('export-png')?.addEventListener('click', () => exportPNG(canvas));
}
