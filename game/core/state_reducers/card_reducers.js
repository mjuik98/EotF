import { Actions } from '../state_action_types.js';

export const CardReducers = {
  [Actions.CARD_DISCARD](gs, { cardId, exhaust = false, skipHandRemove = false }) {
    const player = gs.player;

    if (!skipHandRemove) {
      const idx = player.hand.indexOf(cardId);
      if (idx >= 0) player.hand.splice(idx, 1);
    }

    if (exhaust) {
      player.exhausted.push(cardId);
      let preventedExhaust = false;
      if (typeof gs.triggerItems === 'function') {
        preventedExhaust = gs.triggerItems('card_exhaust', { cardId }) === true;
      }
      if (preventedExhaust) {
        const exIdx = player.exhausted.lastIndexOf(cardId);
        if (exIdx >= 0) player.exhausted.splice(exIdx, 1);
        player.graveyard.push(cardId);
        gs.markDirty('hand');
        return { cardId, exhausted: false, preventedExhaust: true };
      }
    } else {
      player.graveyard.push(cardId);
      if (typeof gs.triggerItems === 'function') {
        gs.triggerItems('card_discard', { cardId });
      }
    }
    gs.markDirty('hand');
    return { cardId, exhausted: exhaust };
  },

  [Actions.CARD_DRAW](gs, { count }) {
    const player = gs.player;
    let drewCards = 0;
    let attempts = 0;
    const handCap = Math.max(1, 8 - Math.max(0, Number(player._handCapMinus || 0)));

    for (let i = 0; i < count; i++) {
      if (!player.drawPile || player.drawPile.length === 0) {
        if (!player.graveyard || player.graveyard.length === 0) break;

        player.drawPile = [...player.graveyard];
        for (let j = player.drawPile.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1));
          [player.drawPile[j], player.drawPile[k]] = [player.drawPile[k], player.drawPile[j]];
        }
        player.graveyard = [];
        if (typeof gs.addLog === 'function') {
          gs.addLog('버린 더미를 드로우 더미로 다시 섞었습니다.', 'system');
        }
      }

      if (player.drawPile.length > 0) {
        attempts++;

        if (player.hand.length < handCap) {
          const cardId = player.drawPile.pop();
          player.hand.push(cardId);
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
