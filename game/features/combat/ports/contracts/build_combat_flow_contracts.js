export function buildCombatFlowContractBuilders(ctx) {
  const { buildBaseDeps, getRefs } = ctx;

  return {
    combatFlow: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps('run'),
        startCombat: (mode = 'normal') => refs.startCombat?.(mode),
      };
    },
  };
}
