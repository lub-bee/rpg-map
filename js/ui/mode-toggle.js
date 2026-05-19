import { dispatch, subscribe, getState } from '../core/state.js';
import { emit } from '../core/events.js';
import { DISPLAY_MODE } from '../data/schema.js';

export function initModeToggle() {
  const app = document.getElementById('app');
  const previewToggleBtn = document.getElementById('preview-toggle');
  const previewExitBtn   = document.getElementById('preview-exit');

  function setPreview(on) {
    app.setAttribute('data-preview', on ? 'true' : 'false');

    // Update icône du bouton preview-toggle
    const icon = previewToggleBtn?.querySelector('i');
    if (icon) {
      icon.setAttribute('data-lucide', on ? 'eye-off' : 'eye');
      if (window.lucide) lucide.createIcons({ nodes: [previewToggleBtn] });
    }

    // Dispatch pour synchroniser l'état interne
    const mode = on ? DISPLAY_MODE.PREVIEW : DISPLAY_MODE.EDIT;
    dispatch({ type: 'SET_MODE', payload: mode });
  }

  if (previewToggleBtn) {
    previewToggleBtn.addEventListener('click', () => {
      const isPreview = app.getAttribute('data-preview') === 'true';
      setPreview(!isPreview);
    });
  }

  if (previewExitBtn) {
    previewExitBtn.addEventListener('click', () => setPreview(false));
  }

  // Tab → toggle preview, Escape → exit preview
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' && e.key !== 'Escape') return;
    if (e.target.closest('input, textarea, select')) return;

    if (e.key === 'Tab') {
      e.preventDefault();
      const isPreview = app.getAttribute('data-preview') === 'true';
      setPreview(!isPreview);
    } else if (e.key === 'Escape') {
      setPreview(false);
    }
  });

  let _prevMode = getState().ui.mode;

  subscribe((state) => {
    if (state.ui.mode !== _prevMode) {
      _prevMode = state.ui.mode;
      emit('mode:changed', state.ui.mode);
      // Sync data-preview en cas de changement d'état externe
      const on = state.ui.mode === DISPLAY_MODE.PREVIEW;
      app.setAttribute('data-preview', on ? 'true' : 'false');
    }
  });
}
