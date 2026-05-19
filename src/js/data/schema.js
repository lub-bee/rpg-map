export const LAYER = {
  OPENINGS: 0,
  FLOOR: 1,
  WALLS: 2,
  FURNITURE: 3,
};

export const TEXTURE = {
  GRID: 'grid',
  STONE: 'stone',
  WOOD: 'wood',
  GLASS: 'glass',
  WATER: 'water',
  FIRE: 'fire',
};

export const WALL_TYPE = {
  STRAIGHT: 'straight',
  ARC: 'arc',
  SEPARATOR: 'separator',
};

export const ELEMENT_TYPE = {
  DOOR: 'door',
  WINDOW: 'window',
  OPENING: 'opening',
  SECRET: 'secret',
  CARPET: 'carpet',
};

export const DISPLAY_MODE = {
  EDIT: 'edit',
  PREVIEW: 'preview',
};

let _idCounter = 0;

export function createId() {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7);
  return `${ts}-${rand}-${(_idCounter++).toString(36)}`;
}

export function createNode(x, y, options = {}) {
  return {
    id: createId(),
    x,
    y,
    free: false,
    ...options,
  };
}

export function createWall(fromId, toId, options = {}) {
  return {
    id: createId(),
    from: fromId,
    to: toId,
    type: WALL_TYPE.STRAIGHT,
    texture: TEXTURE.GRID,
    elements: [],
    ...options,
  };
}

export function createWallElement(type, offset) {
  return {
    id: createId(),
    type,
    offset,
  };
}

export function createDecorNode(x, y, elementType, layer) {
  return {
    id: createId(),
    x,
    y,
    elementType,
    layer,
    rotation: 0,
    children: [],
  };
}

export function createArea(name, nodeIds, color) {
  return {
    id: createId(),
    name,
    nodeIds,
    color,
  };
}

export function createLevel(name) {
  return {
    id: createId(),
    name,
    nodes: [],
    walls: [],
    decorNodes: [],
    areas: [],
  };
}

export function createMap(name, gridSize = 64) {
  const now = Date.now();
  return {
    meta: {
      name,
      gridSize,
      created: now,
      modified: now,
    },
    levels: [createLevel('Ground Floor')],
  };
}
