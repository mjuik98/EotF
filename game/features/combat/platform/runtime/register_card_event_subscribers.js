export function registerCardEventSubscribers(ctx) {
  const subscribeAction = ctx.subscribeAction || (() => () => {});

  subscribeAction('CARD_DRAW', () => {
    ctx.playUiCardAudio?.();
    ctx.callAction('renderCombatCards');
    ctx.ui.HudUpdateUI?.triggerDrawCardAnimation?.();
  });

  subscribeAction('CARD_PLAY', ({ payload }) => {
    const { card } = payload || {};
    if (card) {
      const showCardPlayEffect = ctx.ui.CombatUI?.showCardPlayEffect || ctx.resolveAction('showCardPlayEffect');
      showCardPlayEffect?.(card);
    }
    ctx.callAction('renderCombatCards');
  });

  subscribeAction('CARD_DISCARD', () => {
    ctx.callAction('renderCombatCards');
  });
}
