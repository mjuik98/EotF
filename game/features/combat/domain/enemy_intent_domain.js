import { Trigger } from '../../../data/triggers.js';

function createFallbackEnemyAction(enemy) {
  return { type: 'strike', intent: `공격 ${enemy.atk}`, dmg: enemy.atk };
}

export function getBaseEnemyAction(enemy, turn) {
  try {
    return enemy.ai(turn);
  } catch {
    return createFallbackEnemyAction(enemy);
  }
}

export function applyEnemyIntentModifiers(gs, enemy, action, turn) {
  if (!action || typeof action !== 'object') return action;
  if (typeof gs?.triggerItems !== 'function') return action;

  const result = gs.triggerItems(Trigger.ENEMY_INTENT, { enemy, action, turn });
  if (!result || typeof result !== 'object') return action;
  if (result.action && typeof result.action === 'object') return result.action;
  return action;
}

export function getResolvedEnemyAction(gs, enemy, turn) {
  return applyEnemyIntentModifiers(gs, enemy, getBaseEnemyAction(enemy, turn), turn);
}
