function clampTickDamage(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}

function resolveScaledPoisonDamage(baseDamage, index, poisonDamageScaleFn) {
  if (typeof poisonDamageScaleFn !== 'function') {
    return clampTickDamage(baseDamage);
  }

  const scaled = poisonDamageScaleFn({ amount: baseDamage, targetIdx: index });
  if (typeof scaled === 'number' && Number.isFinite(scaled)) {
    return clampTickDamage(scaled);
  }
  if (scaled && typeof scaled.amount === 'number') {
    return clampTickDamage(scaled.amount);
  }
  return clampTickDamage(baseDamage);
}

function buildStatusUpdate(statusKey, nextValue) {
  return { statusKey, nextValue };
}

export function buildEnemyStatusTickPlan(enemy, index, { poisonDamageScaleFn } = {}) {
  if (!enemy?.statusEffects || enemy.hp <= 0) return [];

  const steps = [];
  const statusEffects = enemy.statusEffects;
  const maxHp = Math.max(Number(enemy.maxHp || enemy.hp || 0), Number(enemy.hp || 0));
  let projectedHp = Number(enemy.hp || 0);

  if ((statusEffects.poisoned || 0) > 0) {
    const dmg = resolveScaledPoisonDamage((statusEffects.poisoned || 0) * 5, index, poisonDamageScaleFn);
    projectedHp = Math.max(0, projectedHp - dmg);
    const poisonDuration = (statusEffects.poisonDuration || 1) - 1;
    const statusUpdates = [];
    if (projectedHp > 0) {
      statusUpdates.push(buildStatusUpdate('poisonDuration', poisonDuration > 0 ? poisonDuration : undefined));
      if (poisonDuration <= 0) {
        statusUpdates.push(buildStatusUpdate('poisoned', undefined));
      }
    }
    steps.push({
      type: 'poison',
      dmg,
      color: '#44ff88',
      enemyDied: projectedHp <= 0,
      statusUpdates,
    });
    if (projectedHp <= 0) return steps;
  }

  if ((statusEffects.burning || 0) > 0) {
    const nextBurning = statusEffects.burning - 1;
    const dmg = 5;
    projectedHp = Math.max(0, projectedHp - dmg);
    steps.push({
      type: 'burning',
      dmg,
      color: '#ff8844',
      enemyDied: projectedHp <= 0,
      statusUpdates: [buildStatusUpdate('burning', nextBurning > 0 ? nextBurning : undefined)],
    });
    if (projectedHp <= 0) return steps;
  }

  if ((statusEffects.abyss_regen || 0) > 0) {
    const heal = clampTickDamage(statusEffects.abyss_regen);
    if (heal > 0) {
      projectedHp = Math.min(maxHp, projectedHp + heal);
      steps.push({
        type: 'abyss_regen',
        heal,
        projectedHp,
        statusUpdates: [],
      });
    }
  }

  if (statusEffects.marked !== undefined) {
    const nextMarked = statusEffects.marked - 1;
    if (nextMarked <= 0) {
      const dmg = 30;
      projectedHp = Math.max(0, projectedHp - dmg);
      steps.push({
        type: 'marked_explode',
        dmg,
        color: '#ff2255',
        enemyDied: projectedHp <= 0,
        statusUpdates: [buildStatusUpdate('marked', undefined)],
      });
      if (projectedHp <= 0) return steps;
    } else {
      steps.push({
        type: 'marked_tick',
        statusUpdates: [buildStatusUpdate('marked', nextMarked)],
      });
    }
  }

  if ((statusEffects.immune || 0) > 0) {
    const nextImmune = statusEffects.immune - 1;
    steps.push({
      type: 'immune_tick',
      statusUpdates: [buildStatusUpdate('immune', nextImmune > 0 ? nextImmune : undefined)],
    });
  }

  if (statusEffects.doom !== undefined) {
    const nextDoom = statusEffects.doom - 1;
    if (nextDoom <= 0) {
      steps.push({
        type: 'doom_explode',
        dmg: 40,
        color: '#ff00ff',
        enemyDied: false,
        statusUpdates: [buildStatusUpdate('doom', undefined)],
      });
    } else {
      steps.push({
        type: 'doom_countdown',
        remaining: nextDoom,
        statusUpdates: [buildStatusUpdate('doom', nextDoom)],
      });
    }
  }

  return steps;
}
