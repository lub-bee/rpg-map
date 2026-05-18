import { addLayerRenderer } from './renderer.js';
import { drawWalls } from '../entities/wall.js';
import { drawArcWalls } from '../entities/arc-wall.js';
import { drawNodes } from '../entities/node.js';
import { on } from '../core/events.js';
import { LAYER, WALL_TYPE } from '../data/schema.js';

const _visible = new Set([LAYER.OPENINGS, LAYER.FLOOR, LAYER.WALLS, LAYER.FURNITURE]);

export function initLayerRenderer() {
  on('layer:visibility-change', ({ layer, visible }) => {
    if (visible) {
      _visible.add(layer);
    } else {
      _visible.delete(layer);
    }
  });

  addLayerRenderer((ctx, canvas, camera, state) => {
    const level = state.map.levels[state.ui.activeLevelIndex];
    if (!level) return;

    if (_visible.has(LAYER.OPENINGS)) {
      // reserved for future openings entities
    }

    if (_visible.has(LAYER.FLOOR)) {
      // reserved for future floor entities
    }

    if (_visible.has(LAYER.WALLS)) {
      const visibleWalls = level.walls.filter(w => w.type !== WALL_TYPE.SEPARATOR);
      drawWalls(ctx, visibleWalls, level.nodes, camera, state);
      drawArcWalls(ctx, level.walls, level.nodes, camera, state);
      drawNodes(ctx, level.nodes, camera, state);
    }

    if (_visible.has(LAYER.FURNITURE)) {
      // reserved for future furniture entities
    }
  });
}
