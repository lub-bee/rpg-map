import { init as initRenderer } from './canvas/renderer.js';
import { initLayerRenderer } from './canvas/layer-renderer.js';
import { initDecorRenderer } from './canvas/decor-renderer.js';
import { initAreaRenderer } from './canvas/area-renderer.js';
import { initWallElements } from './entities/wall-element.js';
import { initToolbar } from './ui/toolbar.js';
import { initModeToggle } from './ui/mode-toggle.js';
import { initStatusbar } from './ui/statusbar.js';
import { initLayerPanel } from './ui/layer-panel.js';
import { initTexturePanel } from './ui/texture-panel.js';
import { initElementPanel } from './ui/element-panel.js';
import { initDecorPanel } from './ui/decor-panel.js';
import { initAreaPanel } from './ui/area-panel.js';
import { initToolManager } from './tools/tool-manager.js';
import { initDecorTool } from './tools/decor-tool.js';
import { initAreaTool } from './tools/area-tool.js';
import { initSeparatorWallTool } from './tools/separator-wall-tool.js';
import { initArcTool } from './tools/arc-tool.js';
import { initSelectTool } from './tools/select-tool.js';
import { initInspector } from './ui/inspector.js';
import { undo, redo, canUndo, canRedo } from './core/history.js';
import { initExportPanel } from './ui/export-panel.js';

function boot() {
  const canvas = document.getElementById('map-canvas');

  initStatusbar();
  initToolbar();
  initModeToggle();
  initLayerPanel();
  initTexturePanel();
  initElementPanel();
  initDecorPanel();
  initAreaPanel();
  initExportPanel();
  initInspector();

  // Register layer renderers before initRenderer starts the RAF loop
  initLayerRenderer();
  initDecorRenderer();
  initAreaRenderer();
  initWallElements();

  initRenderer(canvas);
  initToolManager(canvas);
  initDecorTool(canvas);
  initAreaTool(canvas);
  initSeparatorWallTool(canvas);
  initArcTool(canvas);
  initSelectTool(canvas);

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
