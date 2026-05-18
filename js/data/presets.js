import { LAYER, ELEMENT_TYPE, createId } from './schema.js';

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
