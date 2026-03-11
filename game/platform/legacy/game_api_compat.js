import { Logger } from '../../utils/logger.js';
import { drawCardsService, executePlayerDrawService } from '../../app/combat/card_draw_service.js';
import { playCardService } from '../../app/combat/play_card_service.js';
import { setScreenService } from '../../app/system/screen_service.js';
import { Actions } from '../../core/state_actions.js';
import { GAME } from './global_bridge.js';

function getRuntimeDeps() {
  return GAME.getDeps?.() || {};
}

function getModule(name) {
  return GAME.Modules?.[name];
}

export const GameAPI = {
  applyPlayerDamage(amount, gs = GAME.State) {
    if (amount <= 0) return;
    if (typeof gs.takeDamage === 'function') {
      gs.takeDamage(amount);
    } else {
      gs.dispatch(Actions.PLAYER_DAMAGE, { amount, source: 'api' });
    }
  },

  addShield(amount, gs = GAME.State) {
    if (amount <= 0) return;
    if (typeof gs.addShield === 'function') {
      gs.addShield(amount);
    } else {
      gs.dispatch(Actions.PLAYER_SHIELD, { amount });
    }
  },

  healPlayer(amount, gs = GAME.State) {
    if (amount <= 0) return;
    if (typeof gs.heal === 'function') {
      gs.heal(amount);
    } else {
      gs.dispatch(Actions.PLAYER_HEAL, { amount });
    }
  },

  addGold(amount, gs = GAME.State) {
    if (amount === 0) return;
    const result = gs.dispatch(Actions.PLAYER_GOLD, { amount });
    Logger.info(`[API] Gold ${amount > 0 ? '+' : ''}${amount}. Current: ${result?.goldAfter}`);
  },

  applyEnemyDamage(amount, targetIdx, gs = GAME.State) {
    if (typeof gs.dealDamage === 'function') {
      return gs.dealDamage(amount, targetIdx);
    }
    const result = gs.dispatch(Actions.ENEMY_DAMAGE, { amount, targetIdx });
    getModule('HudUpdateUI')?.updateEnemyHpUI?.(targetIdx, gs.combat?.enemies?.[targetIdx]);
    return result?.actualDamage || 0;
  },

  modifyEnergy(amount, gs = GAME.State) {
    const result = gs.dispatch(Actions.PLAYER_ENERGY, { amount });
    Logger.debug(`[API] Energy modified by ${amount}. Current: ${result?.energyAfter}`);
  },

  drawCards(count = 1, gs = GAME.State, options = {}) {
    const runtimeDeps = getRuntimeDeps();
    return drawCardsService({
      count,
      gs,
      options,
      deps: {
        getRegionData: runtimeDeps.getRegionData,
        runtimeDeps,
      },
    });
  },

  executePlayerDraw(gs = GAME.State) {
    return executePlayerDrawService({
      gs,
      modifyEnergy: (amount, state) => this.modifyEnergy(amount, state),
      drawCards: (count, state) => this.drawCards(count, state),
      playHit: () => GAME.Audio?.playHit?.(),
      updateUI: () => getRuntimeDeps().updateUI?.(),
    });
  },

  discardCard(cardId, isExhaust = false, gs = GAME.State, skipHandRemove = false) {
    gs.dispatch(Actions.CARD_DISCARD, { cardId, exhaust: isExhaust, skipHandRemove });
    Logger.info(`[API] Card ${isExhaust ? 'exhausted' : 'discarded'}: ${cardId}`);
  },

  playCard(cardId, handIdx, gs = GAME.State) {
    return playCardService({
      cardId,
      handIdx,
      gs,
      card: GAME.Data?.cards?.[cardId],
      cardCostUtils: getModule('CardCostUtils'),
      classMechanics: getModule('ClassMechanics'),
      discardCard: (nextCardId, isExhaust, state, skipHandRemove) =>
        this.discardCard(nextCardId, isExhaust, state, skipHandRemove),
      logger: Logger,
      audioEngine: GAME.Audio,
      runtimeDeps: getRuntimeDeps(),
      hudUpdateUI: getModule('HudUpdateUI'),
    });
  },

  async endCombat(gs = GAME.State) {
    if (!gs.combat?.active || gs._endCombatRunning) return;
    return gs.endCombat();
  },

  setScreen(screenName, gs = GAME.State) {
    setScreenService({
      screenName,
      gs,
      logger: Logger,
      screenUI: getModule('ScreenUI'),
      switchScreen: (screen) => getRuntimeDeps().switchScreen?.(screen),
    });
  },

  toggleHudPin() {
    const combatHudUI = getModule('CombatHudUI');
    if (combatHudUI?.toggleHudPin) {
      combatHudUI.toggleHudPin(getRuntimeDeps());
      return;
    }
    console.warn('[API] CombatHudUI.toggleHudPin not available');
  },

  closeDeckView() {
    const deckModalUI = getModule('DeckModalUI');
    if (deckModalUI?.closeDeckView) {
      deckModalUI.closeDeckView(getRuntimeDeps());
      return;
    }
    console.warn('[API] DeckModalUI.closeDeckView not available');
  },

  closeCodex() {
    const codexUI = getModule('CodexUI');
    if (codexUI?.closeCodex) {
      codexUI.closeCodex(getRuntimeDeps());
      return;
    }
    console.warn('[API] CodexUI.closeCodex not available');
  },
};
