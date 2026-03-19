import {
  addCombatEnemyState,
  prepareCombatDeckState,
  resetCombatSetupState,
  syncCombatSelectedTargetState,
} from '../state/combat_setup_state_commands.js';
import { createEnemySpawnPlan } from '../domain/enemy_spawn_plan_domain.js';
import { registerEnemyEncounter } from '../../../shared/codex/codex_records.js';

function spawnScaledEnemy(gs, enemyData, difficultyScaler, extra = {}) {
  if (!gs || !enemyData) return;
  const payload = { ...enemyData, statusEffects: {}, ...extra };
  const enemy = difficultyScaler?.scaleEnemy?.(payload, gs) || payload;
  addCombatEnemyState(gs, enemy);
}

function applyAbyssEmpowerment(enemy) {
  if (!enemy) return null;
  const roll = Math.floor(Math.random() * 4);
  enemy.statusEffects = enemy.statusEffects || {};

  if (roll === 0) {
    enemy.shield = (enemy.shield || 0) + 20;
    return 'shield';
  }
  if (roll === 1) {
    enemy.atk = Math.max(1, Math.ceil((enemy.atk || 1) * 1.3));
    return 'atk';
  }
  if (roll === 2) {
    enemy.statusEffects.abyss_regen = 5;
    return 'regen';
  }
  enemy.statusEffects.draw_block = 1;
  return 'draw_block';
}

function applyAbyssRegionBuffs(gs, region) {
  if (!gs || !region || Number(region.id) !== 6) return;
  const labelByBuff = {
    shield: '심연 강화: 방어막 +20',
    atk: '심연 강화: 공격력 +30%',
    regen: '심연 강화: 턴당 재생 5',
    draw_block: '심연 강화: 드로우 봉쇄',
  };
  gs.combat.enemies.forEach((enemy) => {
    if (!enemy || enemy.hp <= 0) return;
    const buffKey = applyAbyssEmpowerment(enemy);
    if (buffKey && typeof gs.addLog === 'function') {
      gs.addLog(`${enemy.name} ${labelByBuff[buffKey] || '심연 강화'}`, 'system');
    }
  });
}

export const CombatInitializer = {
  resetCombatState(gs) {
    resetCombatSetupState(gs);
  },

  spawnEnemies(gs, data, mode, {
    getRegionData,
    getBaseRegionIndex,
    getRegionCount,
    difficultyScaler,
  }) {
    const plan = createEnemySpawnPlan({
      gs,
      data,
      mode,
      getRegionData,
      getBaseRegionIndex,
      getRegionCount,
    });
    const region = plan.region;
    if (!region) return { spawnedKeys: [], isHiddenBoss: false };

    plan.entries.forEach(({ key, extra }) => {
      const enemyData = data.enemies[key] || data.enemies.ancient_echo;
      spawnScaledEnemy(gs, enemyData, difficultyScaler, extra);
    });

    if (plan.combatMode === 'boss') {
      gs.triggerItems?.('boss_start');
    }

    applyAbyssRegionBuffs(gs, region);

    const encounterCounts = {};
    plan.spawnedKeys.forEach((key) => {
      if (!key) return;
      encounterCounts[key] = (encounterCounts[key] || 0) + 1;
    });
    Object.entries(encounterCounts).forEach(([key, count]) => {
      registerEnemyEncounter(gs, key, count);
    });

    return { spawnedKeys: plan.spawnedKeys, isHiddenBoss: plan.isHiddenBoss };
  },

  applyRegionDebuffs(gs, _getBaseRegionIndex, deps = {}) {
    const runRules = deps.runRules;
    if (runRules && typeof runRules.onCombatStart === 'function') {
      runRules.onCombatStart(gs);
    }
  },

  initDeck(gs, { shuffleArrayFn, drawCardsFn } = {}) {
    prepareCombatDeckState(gs);
    if (shuffleArrayFn) shuffleArrayFn(gs.player.drawPile);

    const masteryOpeningDraw = Math.max(0, Math.floor(Number(gs.player._classMasteryOpeningDrawBonus || 0)));
    const openingDrawCount = 5 + masteryOpeningDraw;

    if (drawCardsFn) {
      drawCardsFn(openingDrawCount, gs);
    } else if (typeof gs.drawCards === 'function') {
      gs.drawCards(openingDrawCount);
    } else {
      for (let i = 0; i < openingDrawCount; i += 1) {
        if (gs.player.drawPile.length > 0) gs.player.hand.push(gs.player.drawPile.pop());
      }
    }

    syncCombatSelectedTargetState(gs);
  },
};
