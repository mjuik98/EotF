import { Actions } from '../../../shared/state/public.js';
import { Logger } from '../../../utils/logger.js';
import { applyEnemyDamageState } from '../state/card_state_commands.js';

export function getDocFromDeps(deps) {
  return deps?.doc || deps?.win?.document || null;
}

export function getWinFromDeps(deps) {
  return deps?.win || deps?.doc?.defaultView || null;
}

export function createDamageRuntime(gs, deps = {}) {
  return {
    doc: getDocFromDeps(deps),
    win: getWinFromDeps(deps),
    enemies: Array.isArray(gs.combat?.enemies) ? gs.combat.enemies : [],
    getBuff: (id) => {
      if (typeof gs.getBuff === 'function') return gs.getBuff(id);
      return gs.player?.buffs?.[id] || null;
    },
    triggerItem: (trigger, payload) => (
      typeof gs.triggerItems === 'function' ? gs.triggerItems(trigger, payload) : undefined
    ),
  };
}

function applyCommonDamageBonuses(gs, amount, getBuff, options = {}) {
  const consumeSingleUseBuffs = !!options.consumeSingleUseBuffs;
  let dmg = amount;

  const resonance = getBuff('resonance');
  if (resonance) dmg += resonance.dmgBonus || 0;

  const acceleration = getBuff('acceleration');
  if (acceleration) dmg += acceleration.dmgBonus || 0;

  const shadowAtk = getBuff('shadow_atk');
  if (shadowAtk) {
    dmg += shadowAtk.dmgBonus || 0;
    if (consumeSingleUseBuffs && gs.player?.buffs) {
      delete gs.player.buffs.shadow_atk;
    }
  }

  const berserk = getBuff('berserk_mode');
  if (berserk) dmg += berserk.atkGrowth || 0;

  const berserkPlus = getBuff('berserk_mode_plus');
  if (berserkPlus) dmg += berserkPlus.atkGrowth || 0;

  const echoBerserk = getBuff('echo_berserk');
  if (echoBerserk) dmg += echoBerserk.atkGrowth || 0;

  const masteryFlat = Number(gs.player?._classMasteryFlatDamageBonus || 0);
  if (Number.isFinite(masteryFlat) && masteryFlat > 0) {
    dmg += Math.floor(masteryFlat);
  }

  const hasCriticalTurn = !!getBuff('critical_turn');
  const hasCritBuff = !!(getBuff('vanish') || getBuff('focus') || hasCriticalTurn);
  if (hasCritBuff) {
    dmg = Math.floor(dmg * 2);
    if (consumeSingleUseBuffs && !hasCriticalTurn && gs.player?.buffs) {
      if (getBuff('vanish')) delete gs.player.buffs.vanish;
      if (getBuff('focus')) delete gs.player.buffs.focus;
    }
  }

  if ((getBuff('weakened')?.stacks || 0) > 0) {
    dmg = Math.max(0, Math.floor(dmg * 0.5));
  }

  return { damage: dmg, hasCritBuff };
}

function applyChainBonus(gs, damage, noChain) {
  let dmg = damage;
  let chainBonus = 0;

  if (!noChain && gs.player.echoChain > 2) {
    chainBonus = Math.floor(dmg * 0.2);
    if (gs.player.chainBonusMult) {
      chainBonus = Math.floor(chainBonus * gs.player.chainBonusMult);
    }
  }

  dmg += chainBonus;
  return { damage: dmg, chainBonus };
}

function applyPostPreventionDamageModifiers(gs, damage, noChain, getBuff, triggerItem) {
  let dmg = damage;

  if ((getBuff('weakened')?.stacks || 0) > 0) {
    dmg = Math.max(0, Math.floor(dmg * 0.5));
  }

  const itemScaled = triggerItem('deal_damage', dmg);
  if (typeof itemScaled === 'number' && Number.isFinite(itemScaled)) {
    dmg = Math.max(0, Math.floor(itemScaled));
  }

  dmg = applyChainBonus(gs, dmg, noChain).damage;

  if (gs.player.echoChain > 0) {
    const chainScaled = triggerItem('chain_dmg', dmg);
    if (typeof chainScaled === 'number' && Number.isFinite(chainScaled)) {
      dmg = Math.max(0, Math.floor(chainScaled));
    }
  }

  return Math.floor(dmg);
}

export function calculatePotentialDamageValue(gs, amount, noChain, getBuff) {
  const base = applyCommonDamageBonuses(gs, amount, getBuff, {
    consumeSingleUseBuffs: false,
  });
  return Math.floor(applyChainBonus(gs, base.damage, noChain).damage);
}

export function calculateBaseResolvedDamageValue(gs, amount, getBuff) {
  const base = applyCommonDamageBonuses(gs, amount, getBuff, {
    consumeSingleUseBuffs: true,
  });
  return {
    damage: Math.floor(base.damage),
    hasCritBuff: base.hasCritBuff,
  };
}

export function finalizeResolvedDamageValue(gs, damage, noChain, getBuff, triggerItem) {
  return applyPostPreventionDamageModifiers(gs, damage, noChain, getBuff, triggerItem);
}

export function calculateResolvedDamageValue(gs, amount, noChain, getBuff, triggerItem) {
  const base = calculateBaseResolvedDamageValue(gs, amount, getBuff);
  return {
    damage: finalizeResolvedDamageValue(gs, base.damage, noChain, getBuff, triggerItem),
    hasCritBuff: base.hasCritBuff,
  };
}

export function resolveEnemyTargetIndex(gs, enemies, targetIdx) {
  Logger.debug('[dealDamage] Called with targetIdx:', targetIdx, '_selectedTarget:', gs._selectedTarget);
  Logger.debug('[dealDamage] Enemies:', enemies.map((enemy) => ({ name: enemy.name, hp: enemy.hp })));

  if (enemies.length === 0) return -1;

  if (targetIdx !== null && targetIdx !== undefined) {
    return enemies[targetIdx]?.hp > 0 ? targetIdx : -1;
  }

  const selected = gs._selectedTarget;
  if (selected !== null && selected !== undefined && enemies[selected]?.hp > 0) {
    Logger.debug('[dealDamage] Using _selectedTarget:', selected);
    return selected;
  }

  const firstAlive = enemies.findIndex((enemy) => enemy.hp > 0);
  Logger.debug('[dealDamage] Using first alive enemy:', firstAlive);
  return firstAlive;
}

export function handleEnemyDamagePrevention(gs, enemy, targetIdx) {
  if (enemy.statusEffects?.immune > 0) return 'immune';

  if (enemy.statusEffects?.dodge > 0) {
    gs._lastDodgedTarget = targetIdx;
    enemy.statusEffects.dodge -= 1;
    if (enemy.statusEffects.dodge <= 0) delete enemy.statusEffects.dodge;
    return 'dodge';
  }

  return null;
}

export function resolveEnemyDamageResult(gs, enemy, targetIdx, damage, isCrit) {
  const prevHp = Number(enemy.hp || 0);
  const prevShield = Number(enemy.shield || 0);
  const prevDamageDealt = Number(gs.stats?.damageDealt || 0);

  const buildObservedResult = () => {
    const hpAfter = Number(enemy.hp || 0);
    const shieldAfter = Number(enemy.shield || 0);
    const shieldAbsorbed = Math.max(0, prevShield - shieldAfter);
    const actualDamage = Math.max(0, prevHp - hpAfter);
    return {
      shieldAbsorbed,
      actualDamage,
      totalDamage: shieldAbsorbed + actualDamage,
      hpAfter,
      isDead: hpAfter <= 0,
      targetIdx,
    };
  };

  const applyFallbackDamage = () => {
    let remaining = Math.max(0, Math.floor(damage));
    if (prevShield > 0) {
      const absorbed = Math.min(prevShield, remaining);
      enemy.shield = Math.max(0, prevShield - absorbed);
      remaining -= absorbed;
    }

    enemy.hp = Math.max(0, prevHp - remaining);
    const actualDamage = Math.max(0, prevHp - enemy.hp);
    if (gs.stats) {
      gs.stats.damageDealt = Math.max(0, Number(gs.stats.damageDealt || 0)) + actualDamage;
    }

    return {
      shieldAbsorbed: Math.max(0, prevShield - Number(enemy.shield || 0)),
      actualDamage,
      totalDamage: Math.max(0, Math.floor(damage)),
      hpAfter: enemy.hp,
      isDead: enemy.hp <= 0,
      targetIdx,
    };
  };

  let result = null;
  if (typeof gs.dispatch === 'function') {
    try {
      result = applyEnemyDamageState(gs, { amount: damage, targetIdx, isCrit });
    } catch (dispatchErr) {
      Logger.warn('[dealDamage] ENEMY_DAMAGE dispatch failed; applying fallback mutation.', dispatchErr);
    }
  }

  const hasDispatchMutation = (
    Number(enemy.hp || 0) !== prevHp
    || Number(enemy.shield || 0) !== prevShield
    || Number(gs.stats?.damageDealt || 0) !== prevDamageDealt
  );

  if (!result || typeof result !== 'object' || !Number.isFinite(result.actualDamage)) {
    result = hasDispatchMutation ? buildObservedResult() : applyFallbackDamage();
  }

  return result;
}

export function advancePlayerChain(gs, enemy, noChain, deps, win) {
  if (!noChain) {
    const prevChain = gs.player.echoChain || 0;
    gs.player.echoChain = prevChain + 1;
    gs.triggerItems?.('chain_gain', { chain: gs.player.echoChain });
    if (prevChain < 5 && gs.player.echoChain >= 5) {
      gs.triggerItems?.('chain_reach_5', { chain: gs.player.echoChain });
    }
    gs.addEcho(10);

    const updateChainDisplay = deps.updateChainDisplay
      || gs.updateChainDisplay
      || win?.updateChainDisplay
      || win?.CombatLifecycle?.updateChainDisplay;

    if (typeof updateChainDisplay === 'function') {
      updateChainDisplay.call(win?.CombatLifecycle || gs, deps);
    } else {
      const updateChainUI = deps.updateChainUI || win?.updateChainUI;
      if (typeof updateChainUI === 'function') updateChainUI(gs.player.echoChain);
    }
  } else if (enemy.hp <= 0 && gs._echoAddedThisAction === false) {
    gs.addEcho(10);
  }
}

export function runDealDamageClassHook(gs, totalDamage, targetIdx, deps, win) {
  const classMechanics = deps.classMechanics || win?.ClassMechanics || win?.GAME?.Modules?.ClassMechanics;
  const classMech = classMechanics?.[gs.player.class];
  if (classMech && typeof classMech.onDealDamage === 'function') {
    classMech.onDealDamage(gs, totalDamage, targetIdx);
  }
}

export function applyLifesteal(gs, totalDamage, getBuff) {
  const lifesteal = getBuff('lifesteal');
  if (!lifesteal || !lifesteal.percent || totalDamage <= 0) return;

  const healAmt = Math.floor(totalDamage * (lifesteal.percent / 100));
  if (healAmt > 0) {
    gs.heal(healAmt, { name: 'lifesteal', type: 'buff' });
  }
}

export function resolveShieldGainAmount(gs, amount) {
  let actual = amount;

  if (gs.runConfig?.curse === 'fatigue' || gs.meta?.runConfig?.curse === 'fatigue') {
    actual = Math.max(0, amount - 10);
  }

  if (typeof gs.triggerItems === 'function') {
    const scaled = gs.triggerItems('shield_gain', actual);
    if (typeof scaled === 'number' && Number.isFinite(scaled)) {
      actual = Math.max(0, Math.floor(scaled));
    }
  }

  return actual;
}

export function resolveIncomingPlayerDamage(gs, amount, getBuff, triggerItem) {
  if (amount <= 0) {
    return { damage: 0, immuneBlocked: false, vulnerableTriggered: false, itemBlocked: false };
  }

  if (typeof gs.getBuff === 'function' && gs.getBuff('immune')) {
    return { damage: 0, immuneBlocked: true, vulnerableTriggered: false, itemBlocked: false };
  }

  let dmg = amount;
  let vulnerableTriggered = false;

  if ((getBuff('vulnerable')?.stacks || 0) > 0) {
    dmg = Math.floor(dmg * 1.5);
    vulnerableTriggered = true;
  }

  if ('dmgTakenMult' in gs.player) {
    dmg = Math.floor(dmg * gs.player.dmgTakenMult);
  }

  const itemScaled = triggerItem('damage_taken', dmg);
  if (itemScaled === true) {
    return { damage: 0, immuneBlocked: false, vulnerableTriggered, itemBlocked: true };
  }

  if (typeof itemScaled === 'number' && Number.isFinite(itemScaled)) {
    dmg = Math.max(0, Math.floor(itemScaled));
  }

  return { damage: dmg, immuneBlocked: false, vulnerableTriggered, itemBlocked: false };
}

export function resolveEnemyStatusTargetIndex(gs, targetIdx) {
  if (targetIdx !== null && targetIdx !== undefined) return targetIdx;

  const selected = gs._selectedTarget;
  if (selected !== null && selected !== undefined && gs.combat.enemies[selected]?.hp > 0) {
    return selected;
  }

  return gs.combat.enemies.findIndex((enemy) => enemy.hp > 0);
}

export function adjustEnemyStatusDuration(gs, status, duration, targetIdx) {
  let adjustedDuration = duration;
  if (typeof gs.triggerItems === 'function') {
    const adjusted = gs.triggerItems('enemy_status_apply', { status, duration, targetIdx });
    if (typeof adjusted === 'number' && Number.isFinite(adjusted)) {
      adjustedDuration = Math.max(0, Math.floor(adjusted));
    }
  }
  return adjustedDuration;
}
