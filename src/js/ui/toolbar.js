import { dispatch, subscribe, getState } from '../core/state.js';

const TOOL_KEYS = {
  w: 'wall',
  a: 'arc',
  s: 'select',
  d: 'decor',
};

export function initToolbar() {
  const buttons = document.querySelectorAll('[data-tool]');

  function setActive(tool) {
    for (const btn of buttons) {
      btn.classList.toggle('active', btn.dataset.tool === tool);
    }
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
