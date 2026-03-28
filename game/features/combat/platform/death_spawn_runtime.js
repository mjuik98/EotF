import { ENEMIES } from '../../../../data/enemies.js';
import { DifficultyScaler } from '../domain/difficulty_scaler.js';

export function spawnScaledEnemyForRegion(gs, deps = {}) {
  const {
    getRegionData,
    renderCombatEnemies,
    enableActionButtons,
    doc,
    win,
  } = deps;
  const region = getRegionData?.(gs.currentRegion, gs);
  if (!region) return null;

  const pool = (gs.currentFloor <= 1 && region.strongEnemies)
    ? region.enemies
    : [...region.enemies, ...(region.strongEnemies || [])];
  const enemyKey = pool[Math.floor(Math.random() * pool.length)];
  const enemyData = ENEMIES[enemyKey];

  if (!enemyData || gs.combat.enemies.length >= 3) return null;

  const enemy = DifficultyScaler.scaleEnemy(
    { ...enemyData, statusEffects: {} },
    gs,
    undefined,
    undefined,
    gs.currentFloor,
  );
  gs.combat.enemies.push(enemy);

  if (typeof renderCombatEnemies === 'function') {
    renderCombatEnemies();
  }

  if (gs.combat.playerTurn) {
    if (typeof enableActionButtons === 'function') {
      enableActionButtons();
    } else {
      doc?.querySelectorAll?.('.combat-actions .action-btn')?.forEach((button) => {
        button.disabled = false;
      });
    }
  }

  return { enemy, win };
}
