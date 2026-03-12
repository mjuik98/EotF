import { createCombatFeatureFacade } from '../../../features/combat/public.js';

export function buildCombatCoreModules() {
  return createCombatFeatureFacade().moduleCapabilities.core;
}
