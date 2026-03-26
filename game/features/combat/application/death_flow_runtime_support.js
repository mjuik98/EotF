export { DATA as CombatGameData } from '../../../../data/game_data.js';
export {
  playReactionEnemyDeath,
  playReactionPlayerDeath,
  playStatusHeal,
} from '../../ui/ports/public_shared_support_capabilities.js';
export {
  registerEnemyKill,
  recordEnemyWorldKill,
  replaceCombatEnemies,
  scheduleCombatEnd,
  setCombatActive,
  syncSelectedTarget,
} from '../../../shared/combat/public_combat_runtime_effects.js';
