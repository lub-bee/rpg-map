import { getState, dispatch, subscribe } from './core/state.js';

// Entry point — wired up progressively each phase.
// Phase 0: module loads, state initializes, nothing rendered yet.
console.log('RPG Map Editor — Phase 0 loaded', getState());
