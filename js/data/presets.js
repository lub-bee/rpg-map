import { LAYER, ELEMENT_TYPE, createId } from './schema.js';

// Dimensions en unités grille (1 case ≈ 1,5 m)
export const ELEMENT_DIMENSIONS = {
  table:      { width: 1.5, height: 1.5 },
  chair:      { width: 0.7, height: 0.7 },
  stool:      { width: 0.7, height: 0.7 },
  tabouret:   { width: 0.7, height: 0.7 },
  bed:        { width: 1.0, height: 2.0 },
  candle:     { width: 0.3, height: 0.3 },
  rug:        { width: 2.0, height: 3.0 },
  carpet:     { width: 2.0, height: 3.0 },
  fireplace:  { width: 1.5, height: 1.0 },
  nightstand: { width: 0.6, height: 0.6 },
  armchair:   { width: 1.0, height: 1.0 },
};

export const PRESETS = {
  'dining-set': {
    id: 'dining-set',
    name: 'Dining Set',
    layer: LAYER.FURNITURE,
    elements: [
      { elementType: ELEMENT_TYPE.CARPET, dx: 0, dy: 0 },
      { elementType: 'table', dx: 0, dy: 0 },
      { elementType: 'chair', dx: -1, dy: 0 },
      { elementType: 'chair', dx: 1, dy: 0 },
      { elementType: 'chair', dx: 0, dy: -1 },
      { elementType: 'chair', dx: 0, dy: 1 },
      { elementType: 'candle', dx: 0, dy: 0 },
    ],
  },
  'bed-single': {
    id: 'bed-single',
    name: 'Single Bed',
    layer: LAYER.FURNITURE,
    elements: [
      { elementType: 'bed', dx: 0, dy: 0 },
      { elementType: 'nightstand', dx: 1, dy: 0 },
    ],
  },
  fireplace: {
    id: 'fireplace',
    name: 'Fireplace',
    layer: LAYER.FURNITURE,
    elements: [
      { elementType: ELEMENT_TYPE.CARPET, dx: 0, dy: 0 },
      { elementType: 'fireplace', dx: 0, dy: 0 },
      { elementType: 'armchair', dx: -1, dy: 1 },
      { elementType: 'armchair', dx: 1, dy: 1 },
    ],
  },
  'tavern-table': {
    id: 'tavern-table',
    name: 'Tavern Table',
    layer: LAYER.FURNITURE,
    elements: [
      { elementType: 'table', dx: 0, dy: 0 },
      { elementType: 'stool', dx: -1, dy: 0 },
      { elementType: 'stool', dx: 1, dy: 0 },
      { elementType: 'stool', dx: 0, dy: -1 },
      { elementType: 'stool', dx: 0, dy: 1 },
    ],
  },
};
