import { LogUtils } from '../../../utils/log_utils.js';
import { handleEnemyEffectLogic } from '../../../domain/combat/turn/enemy_effect_resolver.js';
import {
  isInfiniteStackBuff,
  normalizeInfiniteStack,
} from '../../../domain/combat/turn/infinite_stack_buffs.js';

function trackEnemyDamage(gs, enemy, nextHp) {
  const hpBefore = Number(enemy?.hp || 0);
  enemy.hp = Math.max(0, nextHp);
  const dealt = Math.max(0, hpBefore - enemy.hp);
  if (dealt > 0 && gs?.stats) {
    gs.stats.damageDealt = (gs.stats.damageDealt || 0) + dealt;
  }
  return dealt;
}

function handleEnemyDeath(gs, enemy, index) {
  if (enemy.hp <= 0) {
    gs.onEnemyDeath?.(enemy, index);
    return true;
  }
  return false;
}

export function processEnemyAttack(gs, enemy, index, action) {
  gs.combat._currentAttackerIdx = index;
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
    const se = enemy.statusEffects;

    if (se.poisoned > 0) {
      let dmg = se.poisoned * 5;
      if (typeof gs.triggerItems === 'function') {
        const scaled = gs.triggerItems('poison_damage', { amount: dmg, targetIdx: index });
        if (typeof scaled === 'number' && Number.isFinite(scaled)) {
          dmg = Math.max(0, Math.floor(scaled));
        } else if (scaled && typeof scaled.amount === 'number') {
          dmg = Math.max(0, Math.floor(scaled.amount));
        }
      }

      trackEnemyDamage(gs, enemy, enemy.hp - dmg);
      gs.addLog?.(LogUtils.formatAttack('독', enemy.name, dmg), 'damage');

      const enemyDied = handleEnemyDeath(gs, enemy, index);
      if (!enemyDied) {
        se.poisonDuration = (se.poisonDuration || 1) - 1;
        if (se.poisonDuration <= 0) {
          delete se.poisoned;
          delete se.poisonDuration;
        }
      }

      events.push({ index, type: 'poison', dmg, enemyDied, color: '#44ff88' });
      if (enemyDied) return;
    }

    if (se.burning > 0) {
      const dmg = 5;
      trackEnemyDamage(gs, enemy, enemy.hp - dmg);
      gs.addLog?.(LogUtils.formatAttack('화염', enemy.name, dmg), 'damage');
      se.burning--;
      if (se.burning <= 0) delete se.burning;
      const enemyDied = handleEnemyDeath(gs, enemy, index);
      events.push({ index, type: 'burning', dmg, enemyDied, color: '#ff8844' });
      if (enemyDied) return;
    }

    if (se.abyss_regen > 0) {
      const heal = Math.max(0, Math.floor(Number(se.abyss_regen) || 0));
      if (heal > 0) {
        enemy.hp = Math.min(enemy.maxHp || enemy.hp, (enemy.hp || 0) + heal);
        gs.addLog?.(LogUtils.formatHeal(enemy.name, heal), 'heal');
      }
    }

    if (se.marked !== undefined) {
      se.marked--;
      if (se.marked <= 0) {
        const dmg = 30;
        trackEnemyDamage(gs, enemy, enemy.hp - dmg);
        gs.addLog?.(LogUtils.formatAttack('표식', enemy.name, dmg), 'echo');
        delete se.marked;
        const enemyDied = handleEnemyDeath(gs, enemy, index);
        events.push({ index, type: 'marked_explode', dmg, enemyDied, color: '#ff2255' });
        if (enemyDied) return;
      }
    }

    if (se.immune > 0) {
      se.immune--;
      if (se.immune <= 0) delete se.immune;
    }

    if (se.doom !== undefined) {
      se.doom--;
      if (se.doom <= 0) {
        const dmg = 40;
        gs.takeDamage?.(dmg, { name: '파멸', type: 'enemy' });
        delete se.doom;
        events.push({ index, type: 'doom_explode', dmg, enemyDied: false, color: '#ff00ff' });
      } else {
        gs.addLog?.(`☠️ ${enemy.name}: 파멸 카운트다운 ${se.doom}`, 'system');
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
    gs.player.buffs = permanentBuffs;
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
