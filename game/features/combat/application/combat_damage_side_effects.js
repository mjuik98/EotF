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
