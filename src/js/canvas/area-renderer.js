import { addLayerRenderer } from './renderer.js';
import { getState } from '../core/state.js';
import { drawAreasOverlay } from '../entities/area.js';

export function initAreaRenderer() {
  addLayerRenderer((ctx, canvas, camera, state) => {
    const level = state.map.levels[state.ui.activeLevelIndex];
    if (!level) return;
    drawAreasOverlay(ctx, level.areas, level.nodes, camera, state.ui.showAreas);
  });
}
