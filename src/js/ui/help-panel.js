export function initHelpPanel() {
  const overlay = document.createElement('div');
  overlay.id = 'help-overlay';
  overlay.innerHTML = `
    <div id="help-modal">
      <div class="help-title">Keyboard Shortcuts <button id="help-close">✕</button></div>
      <table class="help-table">
        <tr><td><kbd>W</kbd></td><td>Wall tool</td></tr>
        <tr><td><kbd>A</kbd></td><td>Arc tool</td></tr>
        <tr><td><kbd>S</kbd></td><td>Select tool</td></tr>
        <tr><td><kbd>D</kbd></td><td>Decor tool</td></tr>
        <tr><td><kbd>Tab</kbd></td><td>Toggle Edit / Preview</td></tr>
        <tr><td><kbd>Escape</kbd></td><td>Cancel / deselect</td></tr>
        <tr><td><kbd>Ctrl+Z</kbd></td><td>Undo</td></tr>
        <tr><td><kbd>Ctrl+Shift+Z</kbd></td><td>Redo</td></tr>
        <tr><td><kbd>Delete</kbd></td><td>Delete selected</td></tr>
        <tr><td><kbd>Space+drag</kbd></td><td>Pan canvas</td></tr>
        <tr><td><kbd>Scroll</kbd></td><td>Zoom in / out</td></tr>
      </table>
    </div>
  `;
  overlay.style.display = 'none';
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.style.display = 'none';
  });
  document.getElementById('help-close').addEventListener('click', () => {
    overlay.style.display = 'none';
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === '?' || (e.key === 'F1' && !e.ctrlKey)) {
      e.preventDefault();
      overlay.style.display = overlay.style.display === 'none' ? 'flex' : 'none';
    }
    if (e.key === 'Escape' && overlay.style.display !== 'none') {
      overlay.style.display = 'none';
    }
  });

  return {
    show: () => { overlay.style.display = 'flex'; },
  };
}
