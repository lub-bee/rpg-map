import { subscribe } from '../core/state.js';
import { initWallTool } from './wall-tool.js';
import { initFreeNodeTool } from './free-node-tool.js';

export function initToolManager(canvas) {
  initWallTool(canvas);
  initFreeNodeTool(canvas);

  let _lastTool = null;

  subscribe((state) => {
    const tool = state.ui.activeTool;
    if (tool !== _lastTool) {
      _lastTool = tool;
    }
  });
}
