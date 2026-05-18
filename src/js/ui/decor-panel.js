import { dispatch } from '../core/state.js';
import { setDecorSelection } from '../tools/decor-tool.js';
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
  const section = document.createElement('section');
  section.id = 'decor-panel';

  const title = document.createElement('div');
  title.className = 'panel-title';
  title.textContent = 'Decors';
  section.appendChild(title);

  const elemTitle = document.createElement('div');
  elemTitle.className = 'panel-subtitle';
  elemTitle.textContent = 'Elements';
  section.appendChild(elemTitle);

  const elemList = document.createElement('ul');
  elemList.className = 'panel-list';

  for (const def of SINGLE_ELEMENTS) {
    const li = document.createElement('li');
    li.className = 'decor-item';
    li.textContent = def.label;
    li.addEventListener('click', () => {
      setDecorSelection({ type: 'single', elementType: def.elementType, layer: def.layer });
      dispatch({ type: 'SET_TOOL', payload: 'decor' });
      _setActive(section, li);
    });
    elemList.appendChild(li);
  }
  section.appendChild(elemList);

  const groupTitle = document.createElement('div');
  groupTitle.className = 'panel-subtitle';
  groupTitle.textContent = 'Groups';
  section.appendChild(groupTitle);

  const groupList = document.createElement('ul');
  groupList.className = 'panel-list';

  for (const [key, preset] of Object.entries(PRESETS)) {
    const li = document.createElement('li');
    li.className = 'decor-item';
    li.textContent = preset.name;
    li.addEventListener('click', () => {
      setDecorSelection({ type: 'group', key });
      dispatch({ type: 'SET_TOOL', payload: 'decor' });
      _setActive(section, li);
    });
    groupList.appendChild(li);
  }
  section.appendChild(groupList);

  const panelLeft = document.getElementById('panel-left');
  const areaPanel = document.getElementById('area-panel');

  if (areaPanel) {
    areaPanel.insertAdjacentElement('afterend', section);
  } else {
    panelLeft.appendChild(section);
  }
}

function _setActive(section, activeLi) {
  for (const li of section.querySelectorAll('.decor-item')) {
    li.classList.toggle('active', li === activeLi);
  }
}
