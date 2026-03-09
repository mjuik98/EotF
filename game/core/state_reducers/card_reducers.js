import { Actions } from '../state_action_types.js';

export const CardReducers = {
  [Actions.CARD_DISCARD](gs, { cardId, exhaust = false, skipHandRemove = false }) {
    if (!skipHandRemove) {
      const idx = gs.player.hand.indexOf(cardId);
      if (idx >= 0) gs.player.hand.splice(idx, 1);
    }

    if (exhaust) {
      gs.player.exhausted.push(cardId);
      let preventedExhaust = false;
      if (typeof gs.triggerItems === 'function') {
        preventedExhaust = gs.triggerItems('card_exhaust', { cardId }) === true;
      }
      if (preventedExhaust) {
        const exIdx = gs.player.exhausted.lastIndexOf(cardId);
        if (exIdx >= 0) gs.player.exhausted.splice(exIdx, 1);
        gs.player.graveyard.push(cardId);
        gs.markDirty('hand');
        return { cardId, exhausted: false, preventedExhaust: true };
      }
    } else {
      gs.player.graveyard.push(cardId);
      if (typeof gs.triggerItems === 'function') {
        gs.triggerItems('card_discard', { cardId });
      }
    }
    gs.markDirty('hand');
    return { cardId, exhausted: exhaust };
  },

  [Actions.CARD_DRAW](gs, { count }) {
    let drewCards = 0;
    let attempts = 0;
    const handCap = Math.max(1, 8 - Math.max(0, Number(gs.player._handCapMinus || 0)));

    for (let i = 0; i < count; i++) {
      if (!gs.player.drawPile || gs.player.drawPile.length === 0) {
        if (!gs.player.graveyard || gs.player.graveyard.length === 0) break;

        gs.player.drawPile = [...gs.player.graveyard];
        for (let j = gs.player.drawPile.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1));
          [gs.player.drawPile[j], gs.player.drawPile[k]] = [gs.player.drawPile[k], gs.player.drawPile[j]];
        }
        gs.player.graveyard = [];
        if (typeof gs.addLog === 'function') {
          gs.addLog('Discard pile reshuffled into draw pile.', 'system');
        }
      }

      if (gs.player.drawPile.length > 0) {
        attempts++;

        if (gs.player.hand.length < handCap) {
          const cardId = gs.player.drawPile.pop();
          gs.player.hand.push(cardId);
          drewCards++;

          if (typeof gs.triggerItems === 'function') {
            gs.triggerItems('card_draw', { cardId });
          }
        }
      }
    }

    if (drewCards > 0) {
      gs.markDirty('hand');
      gs.markDirty('hud');
    }

    return { drewCards, drawn: drewCards, attempts };
  },
};
