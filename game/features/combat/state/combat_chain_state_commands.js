export function syncCombatMaxChainState(state, chain = state?.player?.echoChain || 0) {
  if (!state?.stats) return chain;
  state.stats.maxChain = Math.max(state.stats.maxChain || 0, chain);
  return chain;
}

export function applyPassiveResonanceBurstState(state, burstDmg, { onEnemyDeath, resolveDamage } = {}) {
  if (!state?.combat || !Number.isFinite(burstDmg) || burstDmg <= 0) return [];

  const hits = [];
  state.combat.enemies.forEach((enemy, index) => {
    if (!enemy || enemy.hp <= 0) return;

    let resolvedDamage = burstDmg;
    const scaled = resolveDamage?.({ amount: burstDmg, enemy, index, state });
    if (typeof scaled === 'number' && Number.isFinite(scaled)) {
      resolvedDamage = Math.max(0, Math.floor(scaled));
    } else if (scaled && typeof scaled === 'object' && Number.isFinite(scaled.amount)) {
      resolvedDamage = Math.max(0, Math.floor(scaled.amount));
    }

    const hpBefore = enemy.hp;
    enemy.hp = Math.max(0, enemy.hp - resolvedDamage);
    const dealt = Math.max(0, hpBefore - enemy.hp);
    if (dealt > 0) {
      state.stats.damageDealt = (state.stats.damageDealt || 0) + dealt;
    }

    const killed = enemy.hp <= 0;
    if (killed && typeof onEnemyDeath === 'function') onEnemyDeath(enemy, index);
    hits.push({ index, dealt, killed });
  });

  return hits;
}
