import { dispatch, subscribe, getState } from '../core/state.js';

const TOOL_KEYS = {
  w: 'wall',
  a: 'arc',
  s: 'select',
  d: 'decor',
  e: 'area',
  r: 'separator',
};

// Tool → Lucide icon name mapping for status-tool display
const TOOL_ICONS = {
  wall:      'brick-wall',
  arc:       'spline',
  select:    'mouse-pointer-2',
  decor:     'shapes',
  area:      'lasso-select',
  separator: 'separator-horizontal',
};

const TOOL_LABELS = {
  wall:      'Wall',
  arc:       'Arc',
  select:    'Select',
  decor:     'Decor',
  area:      'Area',
  separator: 'Separator',
};

export function initToolbar() {
  // Sélectionne uniquement les boutons tool (pas save/load/export/help/preview-toggle)
  const buttons = document.querySelectorAll('.tool-btn[data-tool]');

  function setActive(tool) {
    for (const btn of buttons) {
      const isActive = btn.dataset.tool === tool;
      if (isActive) {
        btn.setAttribute('data-active', 'true');
      } else {
        btn.removeAttribute('data-active');
      }
    }
    // Update status-tool indicator
    updateStatusTool(tool);
  }

  for (const btn of buttons) {
    btn.addEventListener('click', () => {
      dispatch({ type: 'SET_TOOL', payload: btn.dataset.tool });
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select')) return;
    if (e.key === 'Escape') {
      dispatch({ type: 'SET_TOOL', payload: null });
      return;
    }
    const tool = TOOL_KEYS[e.key];
    if (tool) dispatch({ type: 'SET_TOOL', payload: tool });
  });

  subscribe((state) => setActive(state.ui.activeTool));
  setActive(getState().ui.activeTool);
}

export function updateStatusTool(tool) {
  const el = document.getElementById('status-tool');
  if (!el) return;
  const icon = TOOL_ICONS[tool] ?? 'mouse-pointer-2';
  const label = TOOL_LABELS[tool] ?? (tool ?? 'No tool');
  el.innerHTML = `<i data-lucide="${icon}"></i><span>${label}</span>`;
  if (window.lucide) lucide.createIcons({ nodes: [el] });
}
