import { CombatInitializer } from '../../combat/combat_initializer.js';
import { Actions } from '../state_action_types.js';

export const CombatReducers = {
  [Actions.COMBAT_START](gs, { enemies = [] }) {
    gs.combat.active = true;
    gs.combat.turn = 0;
    gs.combat.playerTurn = true;
    gs.combat.log = [];
    gs.currentScreen = 'game';
    gs.markDirty('hud');
    gs.markDirty('hand');
    return { enemyCount: enemies.length };
  },

  [Actions.COMBAT_END](gs, { victory = true }) {
    gs.combat.active = false;
    gs.combat.playerTurn = true;

    gs.player.hand = [];
    CombatInitializer.resetCombatState(gs);

    gs.player.graveyard = [];
    gs.player.exhausted = [];
    gs.player.drawPile = [];
    gs.player.discardPile = [];

    gs.player.silenceGauge = 0;
    gs.player.timeRiftGauge = 0;
    gs._maskCount = 0;
    gs._batteryUsedTurn = false;
    gs._temporalTurn = 0;
    gs._activeRegionId = null;

    gs._ignoreShield = false;
    gs._scrollTempCard = null;
    gs._fragmentActive = false;
    gs._fragmentBaseMax = undefined;
    gs._glitch0 = null;
    gs._glitchPlus = null;
    gs._eternityActive = false;

    gs.markDirty('hud');
    return { victory };
  },

  [Actions.TURN_START](gs, { isPlayerTurn }) {
    gs.combat.turn++;
    gs.combat.playerTurn = isPlayerTurn;
    return { turn: gs.combat.turn, isPlayerTurn };
  },

  [Actions.TURN_END](gs, { isPlayerTurn }) {
    return { turn: gs.combat.turn, isPlayerTurn };
  },
};
