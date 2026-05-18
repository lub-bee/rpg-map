import { on, emit } from './events.js';
import {
  createMap,
  createLevel,
  DISPLAY_MODE,
  LAYER,
} from '../data/schema.js';

let _state = {
  map: createMap('Untitled'),
  ui: {
    mode: DISPLAY_MODE.EDIT,
    activeTool: null,
    activeLevelIndex: 0,
    gridSize: 64,
    selectedIds: [],
    showAreas: false,
    activeLayer: LAYER.WALLS,
  },
};

function currentLevel(state) {
  return state.map.levels[state.ui.activeLevelIndex];
}

function updateLevel(state, updater) {
  const idx = state.ui.activeLevelIndex;
  const levels = state.map.levels.map((lvl, i) => i === idx ? updater(lvl) : lvl);
  return { ...state, map: { ...state.map, levels } };
}

function findAndUpdate(collection, id, props) {
  return collection.map(item => item.id === id ? { ...item, ...props } : item);
}

function removeById(collection, id) {
  return collection.filter(item => item.id !== id);
}

const _reducers = {
  SET_MAP: (state, payload) => ({ ...state, map: payload }),

  SET_MODE: (state, payload) => ({
    ...state,
    ui: { ...state.ui, mode: payload },
  }),

  SET_TOOL: (state, payload) => ({
    ...state,
    ui: { ...state.ui, activeTool: payload },
  }),

  SET_LEVEL: (state, payload) => ({
    ...state,
    ui: { ...state.ui, activeLevelIndex: payload },
  }),

  SET_GRID_SIZE: (state, payload) => ({
    ...state,
    map: { ...state.map, meta: { ...state.map.meta, gridSize: payload } },
    ui: { ...state.ui, gridSize: payload },
  }),

  SET_SELECTED: (state, payload) => ({
    ...state,
    ui: { ...state.ui, selectedIds: payload },
  }),

  TOGGLE_AREAS: (state) => ({
    ...state,
    ui: { ...state.ui, showAreas: !state.ui.showAreas },
  }),

  SET_LAYER: (state, payload) => ({
    ...state,
    ui: { ...state.ui, activeLayer: payload },
  }),

  ADD_NODE: (state, payload) =>
    updateLevel(state, lvl => ({ ...lvl, nodes: [...lvl.nodes, payload] })),

  ADD_WALL: (state, payload) =>
    updateLevel(state, lvl => ({ ...lvl, walls: [...lvl.walls, payload] })),

  ADD_DECOR_NODE: (state, payload) =>
    updateLevel(state, lvl => ({ ...lvl, decorNodes: [...lvl.decorNodes, payload] })),

  ADD_AREA: (state, payload) =>
    updateLevel(state, lvl => ({ ...lvl, areas: [...lvl.areas, payload] })),

  UPDATE_ENTITY: (state, payload) => {
    const { id, ...props } = payload;
    return updateLevel(state, lvl => ({
      ...lvl,
      nodes: findAndUpdate(lvl.nodes, id, props),
      walls: findAndUpdate(lvl.walls, id, props),
      decorNodes: findAndUpdate(lvl.decorNodes, id, props),
      areas: findAndUpdate(lvl.areas, id, props),
    }));
  },

  DELETE_ENTITY: (state, payload) => {
    const id = payload;
    return updateLevel(state, lvl => ({
      ...lvl,
      nodes: removeById(lvl.nodes, id),
      walls: removeById(lvl.walls, id),
      decorNodes: removeById(lvl.decorNodes, id),
      areas: removeById(lvl.areas, id),
    }));
  },

  ADD_LEVEL: (state, payload) => ({
    ...state,
    map: { ...state.map, levels: [...state.map.levels, payload] },
  }),

  SET_MAP_META: (state, payload) => ({
    ...state,
    map: { ...state.map, meta: { ...state.map.meta, ...payload } },
  }),
};

export function getState() {
  return _state;
}

export function dispatch(action) {
  const reducer = _reducers[action.type];
  if (!reducer) return;
  _state = reducer(_state, action.payload);
  emit('state:change', _state);
}

export function subscribe(fn) {
  on('state:change', fn);
}
