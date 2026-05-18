import { exportJSON, importJSON } from '../export/json-exporter.js';
import { exportSVG } from '../export/svg-exporter.js';
import { exportPNG } from '../export/image-exporter.js';
import { getState } from '../core/state.js';

export function initExportPanel() {
  const canvas = document.getElementById('map-canvas');
  const group = document.getElementById('export-group');
  if (!group) return;

  group.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    switch (btn.dataset.action) {
      case 'save-json':
        exportJSON();
        break;
      case 'load-json':
        importJSON();
        break;
      case 'export-svg':
        exportSVG(getState());
        break;
      case 'export-png':
        exportPNG(canvas);
        break;
    }
  });
}
