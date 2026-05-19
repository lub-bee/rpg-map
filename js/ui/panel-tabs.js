/**
 * initPanelTabs — gère les onglets du panel gauche et le collapse des deux panels.
 */
export function initPanelTabs() {
  // ── Tabs du panel gauche ──────────────────────────────────────────────────
  const tabs    = document.querySelectorAll('.panel-tab[data-tab]');
  const panels  = document.querySelectorAll('.tab-panel[data-tab-content]');

  for (const tab of tabs) {
    tab.addEventListener('click', () => {
      // Désactiver tous les tabs
      for (const t of tabs) {
        t.removeAttribute('data-active');
        t.setAttribute('aria-selected', 'false');
      }
      // Activer le tab cliqué
      tab.setAttribute('data-active', 'true');
      tab.setAttribute('aria-selected', 'true');

      // Afficher le bon tab-panel
      const which = tab.dataset.tab;
      for (const p of panels) {
        if (p.dataset.tabContent === which) {
          p.setAttribute('data-active', 'true');
        } else {
          p.removeAttribute('data-active');
        }
      }
    });
  }

  // ── Collapse panels ───────────────────────────────────────────────────────
  bindCollapse('collapse-left',  'panel-left');
  bindCollapse('collapse-right', 'panel-right');

  // Cliquer sur le rail d'un panel collapsed le réouvre
  for (const id of ['panel-left', 'panel-right']) {
    const panel = document.getElementById(id);
    if (!panel) continue;
    panel.addEventListener('click', (e) => {
      if (panel.getAttribute('data-collapsed') !== 'true') return;
      if (e.target.closest('.panel-collapse')) return;
      panel.setAttribute('data-collapsed', 'false');
    });
  }
}

function bindCollapse(btnId, panelId) {
  const btn   = document.getElementById(btnId);
  const panel = document.getElementById(panelId);
  if (!btn || !panel) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const collapsed = panel.getAttribute('data-collapsed') === 'true';
    panel.setAttribute('data-collapsed', collapsed ? 'false' : 'true');
  });
}
