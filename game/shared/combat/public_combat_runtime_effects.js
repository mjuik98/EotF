export { registerCardUsed, registerEnemyKill } from '../codex/codex_record_state_use_case.js';
export { createLegacyGameStateRuntimeFacade } from '../state/game_state_runtime_compat.js';
export {
  recordEnemyWorldKill,
  replaceCombatEnemies,
  scheduleCombatEnd,
  setCombatActive,
  syncSelectedTarget,
} from '../state/runtime_session_commands.js';
