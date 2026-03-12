import { createCombatFeatureFacade } from '../../../features/combat/public.js';

export function buildCombatCardModules() {
  return createCombatFeatureFacade().modules.cards;
}
