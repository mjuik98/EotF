import { createCombatStartRuntime } from '../../application/create_combat_start_runtime.js';

export function buildCombatFlowContractBuilders(ctx) {
  const { buildBaseDeps, getRefs } = ctx;

  return {
    combatFlow: () => {
      const refs = getRefs();
      const deps = {
        ...buildBaseDeps('run'),
        startCombat: (mode = 'normal') => refs.startCombat?.(mode),
      };
      return {
        ...deps,
        createRuntime: (overrides = {}) => createCombatStartRuntime(overrides),
      };
    },
  };
}
