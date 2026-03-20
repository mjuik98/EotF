export function buildCombatPlayerActionGroup(ctx) {
  const { modules, fns, ports, combatApplication } = ctx;

  return {
    useEchoSkill() {
      const gs = ctx.resolveGameState();
      const deps = ports.getCombatDeps({
        applyEnemyAreaDamage: (amount, extraDeps = {}) => combatApplication.applyEnemyAreaDamageRuntime(
          gs,
          { amount, deps: { ...ports.getCombatDeps({ gs }), ...extraDeps } },
        ),
        applyEnemyDamage: (amount, targetIdx = null, noChain = true, source = null, extraDeps = {}) =>
          combatApplication.applyEnemyDamageRuntime(gs, {
            amount,
            targetIdx,
            noChain,
            source,
            deps: { ...ports.getCombatDeps({ gs }), ...extraDeps },
          }),
        drawCardsState: (targetGs, count, options = {}) => combatApplication.drawStateCards({
          count,
          gs: targetGs,
          options,
          runRuntimeDeps: ports.getCombatDeps({ gs: targetGs }),
        }),
        renderCombatCards: fns.renderCombatCards,
        renderCombatEnemies: fns.renderCombatEnemies,
        showEchoBurstOverlay: fns.showEchoBurstOverlay,
      });
      modules.EchoSkillUI?.useEchoSkill?.(deps);
    },

    drawCard() {
      const gs = ctx.resolveGameState();
      modules.CombatActionsUI?.drawCard?.(ports.getCombatDeps({ gs }));
    },

    playCard(cardId, handIdx) {
      const gs = ctx.resolveGameState();
      return combatApplication.playRuntimeCard({
        cardId,
        handIdx,
        gs,
        deps: ports.getCombatDeps({ gs }),
      });
    },

    endCombat() {
      const gs = ctx.resolveGameState();
      return combatApplication.endCombatRuntime(gs, ports.getCombatDeps({ gs }));
    },
  };
}
