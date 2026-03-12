import { LogUtils } from '../../../utils/log_utils.js';
import { handleEnemyEffectLogic } from '../../../domain/combat/turn/enemy_effect_resolver.js';
import {
  isInfiniteStackBuff,
  normalizeInfiniteStack,
} from '../../../domain/combat/turn/infinite_stack_buffs.js';
import { buildEnemyStatusTickPlan } from './enemy_status_tick_plan_domain.js';
import {
  applyEnemyDamageState,
  applyEnemyHealState,
  applyEnemyStatusUpdatesState,
  replacePlayerBuffsState,
  setCurrentCombatAttackerState,
} from '../state/enemy_turn_state_commands.js';

function trackEnemyDamage(gs, enemy, nextHp) {
  return applyEnemyDamageState(gs, enemy, nextHp);
}

function handleEnemyDeath(gs, enemy, index) {
  if (enemy.hp <= 0) {
    gs.onEnemyDeath?.(enemy, index);
    return true;
  }
  return false;
}

export function processEnemyAttack(gs, enemy, index, action) {
  setCurrentCombatAttackerState(gs, index);
  const hitCount = action.multi || 1;
  gs.addLog?.(LogUtils.formatSystem(`${enemy.name}의 행동: ${action.intent}`), 'damage');

  const results = [];
  for (let hitIndex = 0; hitIndex < hitCount; hitIndex += 1) {
    if (!gs.combat.active || gs.player.hp <= 0) break;

    let dmg = action.dmg;
    let weakened = false;
    if (enemy.statusEffects?.weakened > 0) {
      dmg = Math.floor(dmg * 0.5);
      weakened = true;
      gs.addLog?.(`💫 ${enemy.name}: 약화 (피해 감소)`, 'echo');
    }

    let reflected = false;
    let enemyDied = false;

    if (gs.player.buffs?.dodge) {
      gs.addLog?.(LogUtils.formatSystem('💨 회피: 공격을 피했습니다!'), 'system');
      const buff = gs.player.buffs.dodge;
      if (buff.stacks > 1) buff.stacks--;
      else delete gs.player.buffs.dodge;
      continue;
    }

    const mirrorBuff = gs.player.buffs?.mirror;
    const spikeShieldBuff = gs.player.buffs?.spike_shield;
    if (mirrorBuff || spikeShieldBuff) {
      trackEnemyDamage(gs, enemy, enemy.hp - dmg);
      gs.addLog?.(LogUtils.formatAttack('반사막', enemy.name, dmg), 'echo');
      if (mirrorBuff) {
        if (Number.isFinite(mirrorBuff.stacks) && mirrorBuff.stacks > 1) mirrorBuff.stacks--;
        else delete gs.player.buffs.mirror;
      }
      reflected = true;
      enemyDied = handleEnemyDeath(gs, enemy, index);
    } else {
      gs.takeDamage?.(dmg, { name: enemy.name, type: 'enemy' });
    }

    results.push({ dmg, reflected, enemyDied, weakened, hitIndex });
    if (enemyDied) break;
  }

  return results;
}

export function processEnemyStatusTicks(gs) {
  if (!gs?.combat?.enemies) return [];

  const events = [];

  gs.combat.enemies.forEach((enemy, index) => {
    if (!enemy.statusEffects || enemy.hp <= 0) return;
    const steps = buildEnemyStatusTickPlan(enemy, index, {
      poisonDamageScaleFn: typeof gs.triggerItems === 'function'
        ? (payload) => gs.triggerItems('poison_damage', payload)
        : undefined,
    });

    for (const step of steps) {
      applyEnemyStatusUpdatesState(enemy, step.statusUpdates);

      if (step.type === 'poison') {
        trackEnemyDamage(gs, enemy, enemy.hp - step.dmg);
        gs.addLog?.(LogUtils.formatAttack('독', enemy.name, step.dmg), 'damage');
        const enemyDied = handleEnemyDeath(gs, enemy, index);
        events.push({ index, type: 'poison', dmg: step.dmg, enemyDied, color: step.color });
        if (enemyDied) break;
        continue;
      }

      if (step.type === 'burning') {
        trackEnemyDamage(gs, enemy, enemy.hp - step.dmg);
        gs.addLog?.(LogUtils.formatAttack('화염', enemy.name, step.dmg), 'damage');
        const enemyDied = handleEnemyDeath(gs, enemy, index);
        events.push({ index, type: 'burning', dmg: step.dmg, enemyDied, color: step.color });
        if (enemyDied) break;
        continue;
      }

      if (step.type === 'abyss_regen') {
        applyEnemyHealState(enemy, step.heal);
        gs.addLog?.(LogUtils.formatHeal(enemy.name, step.heal), 'heal');
        continue;
      }

      if (step.type === 'marked_explode') {
        trackEnemyDamage(gs, enemy, enemy.hp - step.dmg);
        gs.addLog?.(LogUtils.formatAttack('표식', enemy.name, step.dmg), 'echo');
        const enemyDied = handleEnemyDeath(gs, enemy, index);
        events.push({ index, type: 'marked_explode', dmg: step.dmg, enemyDied, color: step.color });
        if (enemyDied) break;
        continue;
      }

      if (step.type === 'doom_explode') {
        gs.takeDamage?.(step.dmg, { name: '파멸', type: 'enemy' });
        events.push({ index, type: 'doom_explode', dmg: step.dmg, enemyDied: false, color: step.color });
        continue;
      }

      if (step.type === 'doom_countdown') {
        gs.addLog?.(`☠️ ${enemy.name}: 파멸 카운트다운 ${step.remaining}`, 'system');
      }
    }
  });

  return events;
}

export function handleBossPhaseShift(gs, enemy) {
  if (!gs || !enemy) return null;

  if (!enemy.statusEffects) enemy.statusEffects = {};
  enemy.statusEffects.immune = Math.max(enemy.statusEffects.immune || 0, 1);
  gs.addLog?.(LogUtils.formatStatus(enemy.name, '무적', 1), 'echo');

  enemy.phase = (enemy.phase || 1) + 1;

  let buffsPurged = false;
  if (enemy.phase === 2) {
    gs.addLog?.(LogUtils.formatSystem(`${enemy.name} 2페이즈 각성!`), 'echo');
    const permanentBuffs = {};
    Object.keys(gs.player.buffs).forEach((buffId) => {
      const buff = gs.player.buffs[buffId];
      normalizeInfiniteStack(buffId, buff);
      if (isInfiniteStackBuff(buffId, buff)) {
        permanentBuffs[buffId] = buff;
      }
    });
    replacePlayerBuffsState(gs, permanentBuffs);
    gs.addLog?.(LogUtils.formatSystem('플레이어 모든 버프 해제!'), 'damage');
    buffsPurged = true;
  } else if (enemy.phase === 3) {
    gs.addLog?.(`💀 ${enemy.name} 최종 페이즈!`, 'damage');
    enemy.atk = Math.floor(enemy.atk * 1.3);
  }

  return { phase: enemy.phase, buffsPurged };
}

export function handleEnemyEffect(effect, gs, enemy, { regionId, data } = {}) {
  return handleEnemyEffectLogic(effect, gs, enemy, { regionId, data });
}

export function processEnemyStun(enemy) {
  if (enemy.statusEffects?.stunned > 0) {
    enemy.statusEffects.stunned--;
    if (enemy.statusEffects.stunned <= 0) delete enemy.statusEffects.stunned;

    if (enemy.statusEffects?.weakened > 0) {
      enemy.statusEffects.weakened--;
      if (enemy.statusEffects.weakened <= 0) delete enemy.statusEffects.weakened;
    }
    return true;
  }
  return false;
}

export function getEnemyAction(enemy, turn) {
  try {
    return enemy.ai(turn);
  } catch {
    return { type: 'strike', intent: `공격 ${enemy.atk}`, dmg: enemy.atk };
  }
}

export function decayEnemyWeaken(enemy) {
  if (enemy.statusEffects?.weakened > 0) {
    enemy.statusEffects.weakened--;
    if (enemy.statusEffects.weakened <= 0) delete enemy.statusEffects.weakened;
  }
}
