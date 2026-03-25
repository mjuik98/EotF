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

function applyPostPreventionDamageModifiers(gs, damage, noChain, getBuff, triggerItem, targetIdx = null) {
  let dmg = damage;

  if ((getBuff('weakened')?.stacks || 0) > 0) {
    dmg = Math.max(0, Math.floor(dmg * 0.5));
  }

  const itemScaled = triggerItem('deal_damage', { amount: dmg, targetIdx });
  if (typeof itemScaled === 'number' && Number.isFinite(itemScaled)) {
    dmg = Math.max(0, Math.floor(itemScaled));
  } else if (itemScaled && typeof itemScaled === 'object' && Number.isFinite(itemScaled.amount)) {
    dmg = Math.max(0, Math.floor(itemScaled.amount));
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

export function finalizeResolvedDamageValue(gs, damage, noChain, getBuff, triggerItem, targetIdx = null) {
  return applyPostPreventionDamageModifiers(gs, damage, noChain, getBuff, triggerItem, targetIdx);
}

export function calculateResolvedDamageValue(gs, amount, noChain, getBuff, triggerItem, targetIdx = null) {
  const base = calculateBaseResolvedDamageValue(gs, amount, getBuff);
  return {
    damage: finalizeResolvedDamageValue(gs, base.damage, noChain, getBuff, triggerItem, targetIdx),
    hasCritBuff: base.hasCritBuff,
  };
}
