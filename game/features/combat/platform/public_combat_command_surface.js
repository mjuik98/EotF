import { createCombatApplicationCapabilities } from '../ports/public_application_capabilities.js';

function getCombatApplication() {
  return createCombatApplicationCapabilities();
}

export function applyCombatEnemyDamage({
  amount,
  targetIdx,
  gs,
  runtimeDeps = {},
} = {}) {
  const combatApplication = getCombatApplication();
  const result = combatApplication.applyEnemyDamageState(gs, { amount, targetIdx });
  if (typeof result?.actualDamage === 'number') return result.actualDamage;
  return combatApplication.applyEnemyDamageRuntime(gs, {
    amount,
    targetIdx,
    deps: runtimeDeps,
  }) || 0;
}

export function discardCombatCard({
  cardId,
  isExhaust = false,
  gs,
  skipHandRemove = false,
  logger,
} = {}) {
  return getCombatApplication().discardStateCard(cardId, isExhaust, gs, skipHandRemove, logger);
}

export function playCombatRuntimeCard(payload = {}) {
  return getCombatApplication().playRuntimeCard(payload);
}

export function endCombatRuntimeFlow({
  gs,
  runtimeDeps = {},
} = {}) {
  return getCombatApplication().endCombatRuntime(gs, runtimeDeps);
}
