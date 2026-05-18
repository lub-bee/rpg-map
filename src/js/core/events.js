const _listeners = {};

export function on(event, fn) {
  if (!_listeners[event]) _listeners[event] = [];
  _listeners[event].push(fn);
}

export function off(event, fn) {
  if (!_listeners[event]) return;
  _listeners[event] = _listeners[event].filter(f => f !== fn);
}

export function emit(event, data) {
  if (!_listeners[event]) return;
  for (const fn of _listeners[event]) fn(data);
}
