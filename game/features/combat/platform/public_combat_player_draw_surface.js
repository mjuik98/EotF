import { createCombatApplicationCapabilities } from '../ports/public_application_capabilities.js';

function getCombatApplication() {
  return createCombatApplicationCapabilities();
}

export function drawCombatPlayerCards({
  count = 1,
  gs,
  options = {},
  runRuntimeDeps,
} = {}) {
  return getCombatApplication().drawStateCards({
    count,
    gs,
    options,
    runRuntimeDeps,
  });
}

export function executeCombatPlayerDraw(payload = {}) {
  return getCombatApplication().executePlayerDrawService(payload);
}
