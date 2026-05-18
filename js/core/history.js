import { dispatch, getState } from './state.js';

const MAX_UNDO = 50;

let _undoStack = [];
let _redoStack = [];

export function execute(command) {
  const before = getState().map;
  const after = command.execute(getState());
  dispatch({ type: 'SET_MAP', payload: after.map });
  _undoStack.push({ before, after: getState().map, command });
  if (_undoStack.length > MAX_UNDO) _undoStack.shift();
  _redoStack = [];
}

export function executeWithBefore(command, mapBefore) {
  const after = command.execute(getState());
  dispatch({ type: 'SET_MAP', payload: after.map });
  _undoStack.push({ before: mapBefore, after: getState().map, command });
  if (_undoStack.length > MAX_UNDO) _undoStack.shift();
  _redoStack = [];
}

export function undo() {
  if (!_undoStack.length) return;
  const entry = _undoStack.pop();
  dispatch({ type: 'SET_MAP', payload: entry.before });
  _redoStack.push(entry);
}

export function redo() {
  if (!_redoStack.length) return;
  const entry = _redoStack.pop();
  dispatch({ type: 'SET_MAP', payload: entry.after });
  _undoStack.push(entry);
}

export function canUndo() {
  return _undoStack.length > 0;
}

export function canRedo() {
  return _redoStack.length > 0;
}

export function clear() {
  _undoStack = [];
  _redoStack = [];
}
