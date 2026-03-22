export function buildCombatUiContractBuilders(ctx) {
  const { getRefs, buildBaseDeps, getCombatDeps, getHudDeps, getRaf } = ctx;

  return {
    hudUpdate: () => {
      const refs = getRefs();
      const combatRefs = refs.featureRefs?.combat || {};
      return {
        ...buildBaseDeps('hud'),
        setBonusSystem: refs.SetBonusSystem,
        classMechanics: combatRefs.ClassMechanics || refs.ClassMechanics,
        StatusEffectsUI: combatRefs.StatusEffectsUI || refs.StatusEffectsUI,
        statusEffectsUI: combatRefs.StatusEffectsUI || refs.StatusEffectsUI,
        TooltipUI: combatRefs.TooltipUI || refs.TooltipUI,
        tooltipUI: combatRefs.TooltipUI || refs.TooltipUI,
        cardCostUtils: combatRefs.CardCostUtils || refs.CardCostUtils,
        CardCostUtils: combatRefs.CardCostUtils || refs.CardCostUtils,
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
      const combatRefs = refs.featureRefs?.combat || {};
      return {
        ...buildBaseDeps('combat'),
        playCard: combatRefs.playCard || refs.playCard,
        renderCombatEnemies: combatRefs.renderCombatEnemies || refs.renderCombatEnemies,
      };
    },

    baseCard: () => {
      const refs = getRefs();
      const combatRefs = refs.featureRefs?.combat || {};
      const tooltipUI = combatRefs.TooltipUI || refs.TooltipUI;
      return {
        ...getCombatDeps(),
        playCardHandler: combatRefs.playCard || refs.playCard,
        dragStartHandler: combatRefs.handleCardDragStart || refs.handleCardDragStart,
        dragEndHandler: combatRefs.handleCardDragEnd || refs.handleCardDragEnd,
        showTooltipHandler: refs.showTooltip
          || (tooltipUI
            ? (event, cardId) => tooltipUI.showTooltip?.(event, cardId, getCombatDeps())
            : undefined),
        hideTooltipHandler: refs.hideTooltip
          || (tooltipUI
            ? () => tooltipUI.hideTooltip?.(getCombatDeps())
            : undefined),
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
