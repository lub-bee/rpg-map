import { getState, dispatch } from '../core/state.js';
import { clear } from '../core/history.js';

export function exportJSON() {
  const map = getState().map;
  const name = map.meta?.name || 'map';
  const timestamp = Date.now();
  const filename = `${name}-${timestamp}.json`;

  const blob = new Blob([JSON.stringify(map, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function importJSON() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      let map;
      try {
        map = JSON.parse(e.target.result);
      } catch {
        alert('Invalid JSON file.');
        return;
      }

      if (!map.meta || !Array.isArray(map.levels)) {
        alert('Invalid map file: missing meta or levels.');
        return;
      }

      dispatch({ type: 'SET_MAP', payload: map });
      clear();
    };
    reader.readAsText(file);
  });

  input.click();
}
