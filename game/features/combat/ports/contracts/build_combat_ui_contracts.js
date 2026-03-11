export function buildCombatUiContractBuilders(ctx) {
  const { getRefs, buildBaseDeps, getCombatDeps, getHudDeps, getRaf } = ctx;

  return {
    hudUpdate: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps('hud'),
        setBonusSystem: refs.SetBonusSystem,
        classMechanics: refs.ClassMechanics,
        StatusEffectsUI: refs.StatusEffectsUI,
        statusEffectsUI: refs.StatusEffectsUI,
        TooltipUI: refs.TooltipUI,
        tooltipUI: refs.TooltipUI,
        cardCostUtils: refs.CardCostUtils,
        CardCostUtils: refs.CardCostUtils,
        runRules: refs.RunRules,
        isGameStarted: () => refs._gameStarted?.(),
        requestAnimationFrame: getRaf(),
        setBar: (id, pct) => refs.setBar?.(id, pct),
        setText: (id, val) => refs.setText?.(id, val),
        updateNoiseWidget: () => refs.updateNoiseWidget?.(),
        updateEchoSkillBtn: (overrideDeps) => refs.CombatHudUI?.updateEchoSkillBtn?.(overrideDeps || getHudDeps()),
        updateStatusDisplay: () => refs.updateStatusDisplay?.(),
        renderCombatEnemies: () => refs.renderCombatEnemies?.(),
        renderCombatCards: () => refs.renderCombatCards?.(),
        showItemTooltip: (event, id) => refs.showItemTooltip?.(event, id),
        hideItemTooltip: () => refs.hideItemTooltip?.(),
        showGeneralTooltip: (event, title, desc, deps) => refs.showGeneralTooltip?.(event, title, desc, deps),
        hideGeneralTooltip: () => refs.hideGeneralTooltip?.(),
        getRegionData: refs.getRegionData,
      };
    },

    combatHud: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps('hud'),
        updateChainUI: refs.updateChainUI,
        updateNoiseWidget: refs.updateNoiseWidget,
        updateClassSpecialUI: refs.updateClassSpecialUI,
        updateUI: refs.updateUI,
        getBaseRegionIndex: refs.getBaseRegionIndex,
      };
    },

    cardTarget: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps('combat'),
        renderCombatEnemies: refs.renderCombatEnemies,
      };
    },

    baseCard: () => {
      const refs = getRefs();
      return {
        ...getCombatDeps(),
        playCardHandler: refs.GS?.playCard?.bind(refs.GS),
        renderCombatCardsHandler: refs.renderCombatCards,
        dragStartHandler: refs.handleCardDragStart,
        dragEndHandler: refs.handleCardDragEnd,
        showTooltipHandler: refs.showTooltip,
        hideTooltipHandler: refs.hideTooltip,
      };
    },

    combatInfo: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps('combat'),
        statusKr: refs.StatusEffectsUI?.getStatusMap?.() || {},
      };
    },
  };
}
