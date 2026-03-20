import {
  generateCombatDeathFragmentChoices,
  handleCombatEnemyDeath,
  handleCombatPlayerDeath,
  showCombatDeathScreen,
  spawnEnemyForCombat,
} from './death_flow_actions.js';

export const DeathHandler = {
  spawnEnemy(deps = {}) {
    return spawnEnemyForCombat(this, deps);
  },

  onEnemyDeath(enemy, idx, deps = {}) {
    return handleCombatEnemyDeath(this, enemy, idx, deps);
  },

  onPlayerDeath(deps = {}) {
    return handleCombatPlayerDeath(this, deps);
  },

  showDeathScreen(deps = {}) {
    return showCombatDeathScreen(this, deps);
  },

  generateFragmentChoices(deps = {}) {
    return generateCombatDeathFragmentChoices(this, deps);
  },
};
