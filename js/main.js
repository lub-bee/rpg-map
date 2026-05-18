import { init as initRenderer } from './canvas/renderer.js';
import { initToolbar } from './ui/toolbar.js';
import { initModeToggle } from './ui/mode-toggle.js';
import { initStatusbar } from './ui/statusbar.js';

function boot() {
  const canvas = document.getElementById('map-canvas');
  initStatusbar();
  initToolbar();
  initModeToggle();
  initRenderer(canvas);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
