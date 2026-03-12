import { createCombatFeatureFacade } from '../../../features/combat/public.js';

export function buildCombatHudModules() {
  return createCombatFeatureFacade().moduleCapabilities.hud;
}
