// area-tool.js — Area creation is now handled via the area-panel UI.
// This module is kept for compatibility (initAreaTool is called from main.js)
// but the canvas click handler has been removed.

export function initAreaTool(_canvas) {
  // No canvas interaction needed — areas are created via "Create Area from Selection"
  // button in the area-panel.
  return function detach() {};
}

export function setAreaTool() {
  // kept for potential external use
}
