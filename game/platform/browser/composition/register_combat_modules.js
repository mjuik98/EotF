import { createCombatFeatureFacade } from '../../../features/combat/public.js';

export function registerCombatModules() {
  const groups = createCombatFeatureFacade().modules;

  return {
    ...groups.core,
    ...groups.cards,
    ...groups.hud,
  };
}
