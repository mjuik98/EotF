/**
 * @deprecated compat-only barrel. Prefer focused data runtime support facades.
 */
export {
  addPlayerItemAndRegisterState,
} from './runtime_player_state_support.js';
export {
  clearHandScopedCostTargets,
  getHandScopedCostTargets,
  reindexHandScopedRuntimeState,
  setHandScopedCascadeEntry,
  setHandScopedCostTarget,
} from './runtime_hand_state_support.js';
export {
  registerCardDiscovered,
  registerItemFound,
} from './runtime_codex_support.js';
