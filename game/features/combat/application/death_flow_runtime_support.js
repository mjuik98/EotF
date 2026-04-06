export { DEATH_QUOTES as CombatDeathQuotes } from '../../../../data/death_quotes.js';
export {
  playReactionEnemyDeath,
  playReactionPlayerDeath,
  playStatusHeal,
} from '../integration/ui_support_capabilities.js';
export {
  registerEnemyKill,
  recordEnemyWorldKill,
  replaceCombatEnemies,
  scheduleCombatEnd,
  setCombatActive,
  syncSelectedTarget,
} from '../../../shared/combat/public_combat_runtime_effects.js';
