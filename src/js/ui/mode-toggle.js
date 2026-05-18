import { dispatch, subscribe, getState } from '../core/state.js';
import { emit } from '../core/events.js';
import { DISPLAY_MODE } from '../data/schema.js';

export function initModeToggle() {
  const buttons = document.querySelectorAll('.mode-btn');

  function setActive(mode) {
    for (const btn of buttons) {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    }
  }

  for (const btn of buttons) {
    btn.addEventListener('click', () => {
      dispatch({ type: 'SET_MODE', payload: btn.dataset.mode });
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    if (e.target.closest('input, textarea, select')) return;
    e.preventDefault();
    const current = getState().ui.mode;
    const next = current === DISPLAY_MODE.EDIT ? DISPLAY_MODE.PREVIEW : DISPLAY_MODE.EDIT;
    dispatch({ type: 'SET_MODE', payload: next });
  });

  let _prevMode = getState().ui.mode;

  subscribe((state) => {
    if (state.ui.mode !== _prevMode) {
      _prevMode = state.ui.mode;
      setActive(state.ui.mode);
      emit('mode:changed', state.ui.mode);
    }
  });

  setActive(getState().ui.mode);
}
