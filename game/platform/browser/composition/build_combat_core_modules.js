import { createCombatFeatureFacade } from '../../../features/combat/public.js';

export function buildCombatCoreModules() {
  return createCombatFeatureFacade().modules.core;
}
