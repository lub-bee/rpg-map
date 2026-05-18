import { TEXTURE } from '../data/schema.js';

const TEXTURE_COLORS = {
  grid:  '#7ec8e3',
  stone: '#9e9e9e',
  wood:  '#a0522d',
  glass: '#add8e6',
  water: '#1e90ff',
  fire:  '#ff4500',
};

const _patternCache = new Map();

export function getTextureColor(texture) {
  return TEXTURE_COLORS[texture] ?? TEXTURE_COLORS.grid;
}

export function getTexturePattern(ctx, texture) {
  if (_patternCache.has(texture)) return _patternCache.get(texture);

  const SIZE = 16;
  const offscreen = document.createElement('canvas');
  offscreen.width = SIZE;
  offscreen.height = SIZE;
  const oc = offscreen.getContext('2d');

  if (texture === TEXTURE.STONE) {
    oc.fillStyle = '#9e9e9e';
    oc.fillRect(0, 0, SIZE, SIZE);
    oc.strokeStyle = '#6e6e6e';
    oc.lineWidth = 1;
    for (let y = 4; y < SIZE; y += 4) {
      oc.beginPath();
      oc.moveTo(0, y);
      oc.lineTo(SIZE, y);
      oc.stroke();
    }
  } else if (texture === TEXTURE.WOOD) {
    oc.fillStyle = '#a0522d';
    oc.fillRect(0, 0, SIZE, SIZE);
    oc.strokeStyle = '#6b3219';
    oc.lineWidth = 1;
    for (let x = 4; x < SIZE; x += 4) {
      oc.beginPath();
      oc.moveTo(x, 0);
      oc.lineTo(x, SIZE);
      oc.stroke();
    }
  } else {
    _patternCache.set(texture, null);
    return null;
  }

  const pattern = ctx.createPattern(offscreen, 'repeat');
  _patternCache.set(texture, pattern);
  return pattern;
}
