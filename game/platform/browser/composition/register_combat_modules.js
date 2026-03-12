import { createCombatFeatureFacade } from '../../../features/combat/public.js';

export function registerCombatModules() {
  const capabilities = createCombatFeatureFacade().moduleCapabilities;
  return {
    ...capabilities.core,
    ...capabilities.cards,
    ...capabilities.hud,
  };
}
