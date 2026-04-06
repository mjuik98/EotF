import { CARDS } from '../../../shared/cards/card_data.js';
import {
  drawStateCards,
  playStateCard,
} from './public_combat_command_actions.js';
import { createCombatCardRuntimePorts } from '../integration/card_runtime_capabilities.js';

export const CardMethods = {
  drawCards(count = 1, options = {}) {
    const gs = this;
    const ports = createCombatCardRuntimePorts();
    return drawStateCards({
      count,
      gs,
      options,
      runRuntimeDeps: ports.getRunRuntimeDeps(),
    });
  },

  playCard(cardId, handIdx) {
    const gs = this;
    const ports = createCombatCardRuntimePorts();
    return playStateCard({
      cardId,
      handIdx,
      gs,
      card: ports.getCurrentCard(cardId),
      cardCostUtils: ports.getCardCostUtils(),
      classMechanics: ports.getClassMechanics(),
      audioEngine: ports.getAudioEngine(),
      combatRuntimeDeps: ports.getCombatRuntimeDeps(),
      hudUpdateUI: ports.getHudUpdateUI(),
    });
  },

  getRandomCard(rarity = 'common') {
    const allCards = Object.values(CARDS);
    const pool = allCards.filter((c) => c.rarity === rarity && !c.upgraded).map((c) => c.id);

    if (!pool.length) {
      const commonPool = allCards.filter((c) => c.rarity === 'common' && !c.upgraded).map((c) => c.id);
      return commonPool[Math.floor(Math.random() * commonPool.length)];
    }

    return pool[Math.floor(Math.random() * pool.length)];
  },
};
