import { dispatch } from '../core/state.js';
import { setDecorSelection, setSnapToGrid } from '../tools/decor-tool.js';
import { PRESETS } from '../data/presets.js';
import { LAYER } from '../data/schema.js';

const SINGLE_ELEMENTS = [
  { elementType: 'table',     label: 'Table',      layer: LAYER.FURNITURE },
  { elementType: 'chair',     label: 'Chair',      layer: LAYER.FURNITURE },
  { elementType: 'rug',       label: 'Rug',        layer: LAYER.FLOOR },
  { elementType: 'candle',    label: 'Candle',     layer: LAYER.FURNITURE },
  { elementType: 'bed',       label: 'Bed',        layer: LAYER.FURNITURE },
  { elementType: 'fireplace', label: 'Fireplace',  layer: LAYER.FURNITURE },
];

export function initDecorPanel() {
  // Le decor panel est un panneau flottant / contextuel créé dynamiquement.
  // Dans le nouveau layout, il s'insère dans le tab "areas" du panel-left
  // (après la liste des areas) pour rester dans la sidebar existante.
  // Si le tab areas n'existe pas, il se place à la fin du panel-body.

  const section = document.createElement('div');
  section.id = 'decor-panel';
  section.style.padding = '8px 12px 16px';

  // Titre
  const titleEl = document.createElement('div');
  titleEl.className = 'section-header';
  titleEl.innerHTML = '<span class="section-title">Decors</span>';
  section.appendChild(titleEl);

  // Éléments simples
  const elemSubTitle = document.createElement('div');
  elemSubTitle.style.cssText = 'font-size:10.5px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-dim);margin:8px 0 6px';
  elemSubTitle.textContent = 'Elements';
  section.appendChild(elemSubTitle);

  const elemList = document.createElement('div');
  elemList.className = 'list';

  for (const def of SINGLE_ELEMENTS) {
    const row = document.createElement('div');
    row.className = 'list-row decor-item';
    row.textContent = def.label;
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => {
      setDecorSelection({ type: 'single', elementType: def.elementType, layer: def.layer });
      dispatch({ type: 'SET_TOOL', payload: 'decor' });
      _setActive(section, row);
    });
    elemList.appendChild(row);
  }
  section.appendChild(elemList);

  // Groupes
  const groupSubTitle = document.createElement('div');
  groupSubTitle.style.cssText = 'font-size:10.5px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-dim);margin:12px 0 6px';
  groupSubTitle.textContent = 'Groups';
  section.appendChild(groupSubTitle);

  const groupList = document.createElement('div');
  groupList.className = 'list';

  for (const [key, preset] of Object.entries(PRESETS)) {
    const row = document.createElement('div');
    row.className = 'list-row decor-item';
    row.textContent = preset.name;
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => {
      setDecorSelection({ type: 'group', key });
      dispatch({ type: 'SET_TOOL', payload: 'decor' });
      _setActive(section, row);
    });
    groupList.appendChild(row);
  }
  section.appendChild(groupList);

  // Snap to grid
  const snapRow = document.createElement('div');
  snapRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-top:10px;padding:4px 0';

  const snapCheckbox = document.createElement('input');
  snapCheckbox.type = 'checkbox';
  snapCheckbox.id = 'decor-snap-checkbox';
  snapCheckbox.checked = true;
  snapCheckbox.addEventListener('change', () => setSnapToGrid(snapCheckbox.checked));

  const snapLabel = document.createElement('label');
  snapLabel.htmlFor = 'decor-snap-checkbox';
  snapLabel.textContent = 'Snap to grid';
  snapLabel.style.fontSize = '12px';
  snapLabel.style.color = 'var(--text-muted)';

  snapRow.appendChild(snapCheckbox);
  snapRow.appendChild(snapLabel);
  section.appendChild(snapRow);

  // Insertion dans le tab areas du panel-left
  const areasTab = document.querySelector('[data-tab-content="areas"]');
  if (areasTab) {
    areasTab.appendChild(section);
  } else {
    const panelBody = document.querySelector('#panel-left .panel-body');
    if (panelBody) panelBody.appendChild(section);
  }
}

function _setActive(section, activeLi) {
  for (const row of section.querySelectorAll('.decor-item')) {
    if (row === activeLi) {
      row.setAttribute('data-active', 'true');
    } else {
      row.removeAttribute('data-active');
    }
  }
}
