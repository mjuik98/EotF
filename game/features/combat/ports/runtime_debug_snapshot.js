import {
  getEnemyAnchor,
  getViewportSummary,
  toFiniteNumber,
} from '../../ui/ports/public_shared_support_capabilities.js';

function collectEnemyState(enemies = []) {
  return enemies.map((enemy, index) => ({
    index,
    id: enemy?.id || enemy?.key || enemy?.name || `enemy-${index}`,
    hp: toFiniteNumber(enemy?.hp),
    maxHp: toFiniteNumber(enemy?.maxHp),
    alive: toFiniteNumber(enemy?.hp) > 0,
    intent: enemy?.nextAction || enemy?.intent || null,
    statusKeys: Object.keys(enemy?.status || enemy?.statuses || {}),
  }));
}

export function collectCombatRuntimeDebugSnapshot({ modules, doc, win }) {
  const gs = modules?.featureScopes?.core?.GS || modules?.GS || {};
  const view = win || doc?.defaultView || null;
  const viewport = getViewportSummary(doc, view, gs);
  const enemies = Array.isArray(gs?.combat?.enemies) ? gs.combat.enemies : [];
  const enemyStates = collectEnemyState(enemies).map((enemy) => ({
    ...enemy,
    anchor: getEnemyAnchor(enemy.index, enemies.length, viewport),
    targetable: enemy.alive,
  }));
  const targetableEnemyIndexes = enemyStates
    .filter((enemy) => enemy.targetable)
    .map((enemy) => enemy.index);
  const selectedTarget = toFiniteNumber(gs?._selectedTarget, -1);

  return {
    combat: {
      active: !!gs?.combat?.active,
      playerTurn: !!gs?.combat?.playerTurn,
      turn: toFiniteNumber(gs?.combat?.turn),
      selectedTarget,
      selectedEnemyId: enemyStates.find((enemy) => enemy.index === selectedTarget)?.id || null,
      layout: {
        viewport,
        playerAnchor: {
          x: Math.round(viewport.width / 2),
          y: Math.round(viewport.height * 0.78),
        },
      },
      aliveEnemyCount: targetableEnemyIndexes.length,
      targetableEnemyIndexes,
      enemies: enemyStates,
      logSize: Array.isArray(gs?.combat?.log) ? gs.combat.log.length : 0,
    },
  };
}
