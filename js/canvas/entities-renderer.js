import { addLayerRenderer } from './renderer.js';
import { drawWalls } from '../entities/wall.js';
import { drawNodes } from '../entities/node.js';

export function initEntitiesRenderer() {
  addLayerRenderer((ctx, canvas, camera, state) => {
    const level = state.map.levels[state.ui.activeLevelIndex];
    if (!level) return;
    drawWalls(ctx, level.walls, level.nodes, camera, state);
    drawNodes(ctx, level.nodes, camera, state);
  });
}
