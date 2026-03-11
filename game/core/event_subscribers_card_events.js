import { EventBus } from './event_bus.js';
import { GAME } from './global_bridge.js';
import { Actions } from './state_actions.js';
import { playUiCard } from '../domain/audio/audio_event_helpers.js';

export function registerCardEventSubscribers(ctx) {
  EventBus.on(Actions.CARD_DRAW, () => {
    playUiCard(GAME.Audio);
    ctx.callAction('renderHand');
    ctx.callAction('renderCombatCards');
    ctx.ui.HudUpdateUI?.triggerDrawCardAnimation?.();
  });

  EventBus.on(Actions.CARD_PLAY, ({ payload }) => {
    const { card } = payload || {};
    if (card) {
      const showCardPlayEffect = ctx.ui.CombatUI?.showCardPlayEffect || ctx.resolveAction('showCardPlayEffect');
      showCardPlayEffect?.(card);
    }
    ctx.callAction('renderCombatCards');
  });

  EventBus.on(Actions.CARD_DISCARD, () => {
    ctx.callAction('renderCombatCards');
  });
}
