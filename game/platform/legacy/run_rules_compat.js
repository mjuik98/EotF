import { GAME } from './public.js';
import { getLegacyRoot } from './global_bridge_helpers.js';
import { createRunRuleCapabilities } from '../../features/run/ports/public_rule_capabilities.js';

function getCompatGameState() {
  if (GAME.State) return GAME.State;
  const root = getLegacyRoot();
  return root?.GS || root?.GameState || null;
}

function getRunRules() {
  return createRunRuleCapabilities();
}

export function finalizeRunOutcome(kind = 'defeat', options = {}, deps = {}) {
  return getRunRules().finalizeRunOutcome(kind, options, {
    getGameState: getCompatGameState,
    ...deps,
  });
}

export function getBaseRegionIndex(...args) {
  return getRunRules().getBaseRegionIndex(...args);
}

export function getRegionCount(...args) {
  return getRunRules().getRegionCount(...args);
}

export function getRegionData(...args) {
  return getRunRules().getRegionData(...args);
}

export function getRegionIdForStage(...args) {
  return getRunRules().getRegionIdForStage(...args);
}

export const RunRules = createRunRuleCapabilities().RunRules;
