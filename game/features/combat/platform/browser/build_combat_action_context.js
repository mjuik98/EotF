function createShuffleArray(modules) {
  if (typeof modules.RandomUtils?.shuffleArray === 'function') {
    return modules.RandomUtils.shuffleArray.bind(modules.RandomUtils);
  }
  return (items) => items.sort(() => Math.random() - 0.5);
}

function resolveRunRuleHelper(modules, namedExportKey) {
  if (typeof modules?.[namedExportKey] === 'function') {
    return modules[namedExportKey];
  }

  const methodName = namedExportKey;
  if (typeof modules?.RunRules?.[methodName] === 'function') {
    return modules.RunRules[methodName].bind(modules.RunRules);
  }

  return undefined;
}

function resolveGameState(modules) {
  return modules?.featureScopes?.core?.GS || modules?.GS;
}

function createIntentDeps(ports, forceFullRender) {
  return ports.getCombatDeps({
    ...(forceFullRender === undefined ? {} : { forceFullRender }),
    hideIntentTooltipHandlerName: 'hideIntentTooltip',
    selectTargetHandlerName: 'selectTarget',
    showIntentTooltipHandlerName: 'showIntentTooltip',
  });
}

export function createCombatActionContext(modules, fns, ports, combatApplication) {
  return {
    modules,
    fns,
    ports,
    combatApplication,
    resolveGameState: () => resolveGameState(modules),
    createIntentDeps: (forceFullRender) => createIntentDeps(ports, forceFullRender),
    createStartCombatDeps: () => ports.getCombatDeps({
      classMechanics: modules.ClassMechanics,
      difficultyScaler: modules.DifficultyScaler,
      getBaseRegionIndex: resolveRunRuleHelper(modules, 'getBaseRegionIndex'),
      getRegionCount: resolveRunRuleHelper(modules, 'getRegionCount'),
      getRegionData: resolveRunRuleHelper(modules, 'getRegionData'),
      refreshCombatInfoPanel: fns._refreshCombatInfoPanel,
      renderCombatCards: fns.renderCombatCards,
      renderCombatEnemies: fns.renderCombatEnemies,
      resetCombatInfoPanel: fns._resetCombatInfoPanel,
      showTurnBanner: fns.showTurnBanner,
      showWorldMemoryNotice: fns.showWorldMemoryNotice,
      shuffleArray: createShuffleArray(modules),
      updateChainUI: fns.updateChainUI,
      updateClassSpecialUI: fns.updateClassSpecialUI,
      updateCombatLog: fns.updateCombatLog,
      updateNoiseWidget: fns.updateNoiseWidget,
      updateUI: fns.updateUI,
    }),
  };
}
