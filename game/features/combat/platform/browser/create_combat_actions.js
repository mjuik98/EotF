import { createCombatApplicationCapabilities } from '../../ports/public_application_capabilities.js';

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

export function createCombatActions(modules, fns, ports) {
  const combatApplication = createCombatApplicationCapabilities();

  return {
    startCombat(isBoss = false) {
      const deps = ports.getCombatDeps({
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
      });
      modules.CombatStartUI?.startCombat?.(isBoss, deps);
    },

    endPlayerTurn() {
      modules.CombatTurnUI?.endPlayerTurn?.(ports.getCombatTurnBaseDeps());
    },

    enemyTurn() {
      modules.CombatTurnUI?.enemyTurn?.(ports.getCombatTurnBaseDeps());
    },

    processEnemyStatusTicks() {
      modules.CombatTurnUI?.processEnemyStatusTicks?.(ports.getCombatTurnBaseDeps());
    },

    handleBossPhaseShift(enemy, idx) {
      modules.CombatTurnUI?.handleBossPhaseShift?.(enemy, idx, ports.getCombatTurnBaseDeps());
    },

    handleEnemyEffect(effect, enemy, idx) {
      modules.CombatTurnUI?.handleEnemyEffect?.(effect, enemy, idx, ports.getCombatTurnBaseDeps());
    },

    toggleHudPin() {
      modules.CombatHudUI?.toggleHudPin?.(ports.getHudDeps());
    },

    showEchoSkillTooltip(event) {
      modules.CombatHudUI?.showEchoSkillTooltip?.(event, ports.getHudDeps());
    },

    hideEchoSkillTooltip() {
      modules.CombatHudUI?.hideEchoSkillTooltip?.(ports.getHudDeps());
    },

    showTurnBanner(type) {
      modules.CombatHudUI?.showTurnBanner?.(type, ports.getHudDeps());
    },

    showIntentTooltip(event, enemyIdx) {
      const deps = ports.getCombatDeps({
        hideIntentTooltipHandlerName: 'hideIntentTooltip',
        selectTargetHandlerName: 'selectTarget',
        showIntentTooltipHandlerName: 'showIntentTooltip',
      });
      modules.CombatUI?.showIntentTooltip?.(event, enemyIdx, deps);
    },

    hideIntentTooltip() {
      const deps = ports.getCombatDeps({
        hideIntentTooltipHandlerName: 'hideIntentTooltip',
        selectTargetHandlerName: 'selectTarget',
        showIntentTooltipHandlerName: 'showIntentTooltip',
      });
      modules.CombatUI?.hideIntentTooltip?.(deps);
    },

    renderCombatEnemies(forceFullRender = false) {
      const deps = ports.getCombatDeps({
        forceFullRender,
        hideIntentTooltipHandlerName: 'hideIntentTooltip',
        selectTargetHandlerName: 'selectTarget',
        showIntentTooltipHandlerName: 'showIntentTooltip',
      });
      modules.CombatUI?.renderCombatEnemies?.(deps);
    },

    updateEnemyHpUI(idx, enemy) {
      const deps = ports.getCombatDeps({
        hideIntentTooltipHandlerName: 'hideIntentTooltip',
        selectTargetHandlerName: 'selectTarget',
        showIntentTooltipHandlerName: 'showIntentTooltip',
      });
      modules.CombatUI?.updateEnemyHpUI?.(idx, enemy, deps);
    },

    renderCombatCards() {
      modules.CardUI?.renderCombatCards?.(ports.getBaseCardDeps());
    },

    updateHandFanEffect() {
      modules.CardUI?.updateHandFanEffect?.(ports.getBaseCardDeps());
    },

    renderHand() {
      modules.CardUI?.renderHand?.(ports.getBaseCardDeps());
    },

    getCardTypeClass(type) {
      return modules.CardUI?.getCardTypeClass?.(type) || '';
    },

    getCardTypeLabelClass(type) {
      return modules.CardUI?.getCardTypeLabelClass?.(type) || '';
    },

    updateCombatLog() {
      modules.CombatHudUI?.updateCombatLog?.(ports.getHudDeps());
    },

    updateEchoSkillBtn() {
      modules.CombatHudUI?.updateEchoSkillBtn?.(ports.getHudDeps());
    },

    toggleBattleChronicle() {
      modules.CombatHudUI?.toggleBattleChronicle?.(ports.getHudDeps());
    },

    openBattleChronicle() {
      modules.CombatHudUI?.openBattleChronicle?.(ports.getHudDeps());
    },

    closeBattleChronicle() {
      modules.CombatHudUI?.closeBattleChronicle?.(ports.getHudDeps());
    },

    useEchoSkill() {
      const deps = ports.getCombatDeps({
        applyEnemyAreaDamage: (amount, extraDeps = {}) => combatApplication.applyEnemyAreaDamageRuntime(
          modules.GS,
          { amount, deps: { ...ports.getCombatDeps({ gs: modules.GS }), ...extraDeps } },
        ),
        applyEnemyDamage: (amount, targetIdx = null, noChain = true, source = null, extraDeps = {}) =>
          combatApplication.applyEnemyDamageRuntime(modules.GS, {
            amount,
            targetIdx,
            noChain,
            source,
            deps: { ...ports.getCombatDeps({ gs: modules.GS }), ...extraDeps },
          }),
        drawCardsState: (gs, count, options = {}) => combatApplication.drawStateCards({
          count,
          gs,
          options,
          runRuntimeDeps: ports.getCombatDeps({ gs }),
        }),
        renderCombatCards: fns.renderCombatCards,
        renderCombatEnemies: fns.renderCombatEnemies,
        showEchoBurstOverlay: fns.showEchoBurstOverlay,
      });
      modules.EchoSkillUI?.useEchoSkill?.(deps);
    },

    drawCard() {
      modules.CombatActionsUI?.drawCard?.(ports.getCombatDeps({ gs: modules.GS }));
    },

    playCard(cardId, handIdx) {
      return combatApplication.playRuntimeCard({
        cardId,
        handIdx,
        gs: modules.GS,
        deps: ports.getCombatDeps({ gs: modules.GS }),
      });
    },

    endCombat() {
      return combatApplication.endCombatRuntime(
        modules.GS,
        ports.getCombatDeps({ gs: modules.GS }),
      );
    },

    handleCardDragStart(event, cardId, idx) {
      modules.CardTargetUI?.handleDragStart?.(event, cardId, idx, ports.getCardTargetDeps());
    },

    handleCardDragEnd(event) {
      modules.CardTargetUI?.handleDragEnd?.(event, ports.getCardTargetDeps());
    },

    handleCardDropOnEnemy(event, enemyIdx) {
      modules.CardTargetUI?.handleDropOnEnemy?.(event, enemyIdx, ports.getCardTargetDeps());
    },

    selectTarget(idx) {
      modules.CardTargetUI?.selectTarget?.(idx, ports.getCardTargetDeps());
    },

    showCombatSummary(dealt, taken, kills) {
      modules.FeedbackUI?.showCombatSummary?.(dealt, taken, kills, ports.getFeedbackDeps());
    },

    showDmgPopup(dmg, x, y, color = '#ff3366') {
      modules.FeedbackUI?.showDmgPopup?.(dmg, x, y, color, ports.getFeedbackDeps());
    },

    showEdgeDamage() {
      modules.FeedbackUI?.showEdgeDamage?.(ports.getFeedbackDeps());
    },

    showEchoBurstOverlay() {
      modules.FeedbackUI?.showEchoBurstOverlay?.(ports.getFeedbackDeps());
    },

    showCardPlayEffect(card) {
      modules.FeedbackUI?.showCardPlayEffect?.(card, ports.getFeedbackDeps());
    },

    showItemToast(item, options = {}) {
      modules.FeedbackUI?.showItemToast?.(item, ports.getFeedbackDeps(), options);
    },

    showLegendaryAcquire(item) {
      modules.FeedbackUI?.showLegendaryAcquire?.(item, ports.getFeedbackDeps());
    },

    showChainAnnounce(text) {
      modules.FeedbackUI?.showChainAnnounce?.(text, ports.getFeedbackDeps());
    },

    showWorldMemoryNotice(text) {
      modules.FeedbackUI?.showWorldMemoryNotice?.(text, ports.getFeedbackDeps());
    },

    _flushNoticeQueue() {
      modules.FeedbackUI?._flushNoticeQueue?.(ports.getFeedbackDeps());
    },
  };
}
