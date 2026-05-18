import { init as initRenderer } from './canvas/renderer.js';
import { initEntitiesRenderer } from './canvas/entities-renderer.js';
import { initToolbar } from './ui/toolbar.js';
import { initModeToggle } from './ui/mode-toggle.js';
import { initStatusbar } from './ui/statusbar.js';
import { initToolManager } from './tools/tool-manager.js';
import { undo, redo, canUndo, canRedo } from './core/history.js';

function boot() {
  const canvas = document.getElementById('map-canvas');

  initStatusbar();
  initToolbar();
  initModeToggle();
  initEntitiesRenderer();
  initRenderer(canvas);
  initToolManager(canvas);

  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select')) return;
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      if (canUndo()) undo();
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      if (canRedo()) redo();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
