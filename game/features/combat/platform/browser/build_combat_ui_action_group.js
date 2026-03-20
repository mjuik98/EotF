export function buildCombatUiActionGroup(ctx) {
  const { modules, ports } = ctx;

  return {
    showIntentTooltip(event, enemyIdx) {
      modules.CombatUI?.showIntentTooltip?.(event, enemyIdx, ctx.createIntentDeps());
    },

    hideIntentTooltip() {
      modules.CombatUI?.hideIntentTooltip?.(ctx.createIntentDeps());
    },

    renderCombatEnemies(forceFullRender = false) {
      modules.CombatUI?.renderCombatEnemies?.(ctx.createIntentDeps(forceFullRender));
    },

    updateEnemyHpUI(idx, enemy) {
      modules.CombatUI?.updateEnemyHpUI?.(idx, enemy, ctx.createIntentDeps());
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
  };
}
