import { createCombatFeatureFacade } from '../../features/combat/public.js';

export function createCombatBindings(modules, fns) {
  const { bindings } = createCombatFeatureFacade();
  Object.assign(fns, bindings.createCombatBindings(modules, fns));
}
