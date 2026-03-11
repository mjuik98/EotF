import { CombatInitializer } from '../../combat/combat_initializer.js';
import { Actions } from '../state_action_types.js';

export const CombatReducers = {
  [Actions.COMBAT_START](gs, { enemies = [] }) {
    const combat = gs.combat;
    combat.active = true;
    combat.turn = 0;
    combat.playerTurn = true;
    combat.log = [];
    gs.currentScreen = 'game';
    gs.markDirty('hud');
    gs.markDirty('hand');
    return { enemyCount: enemies.length };
  },

  [Actions.COMBAT_END](gs, { victory = true }) {
    const combat = gs.combat;
    const player = gs.player;
    combat.active = false;
    combat.playerTurn = true;

    player.hand = [];
    CombatInitializer.resetCombatState(gs);

    player.graveyard = [];
    player.exhausted = [];
    player.drawPile = [];
    player.discardPile = [];

    player.silenceGauge = 0;
    player.timeRiftGauge = 0;
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
    const combat = gs.combat;
    combat.turn++;
    combat.playerTurn = isPlayerTurn;
    return { turn: combat.turn, isPlayerTurn };
  },

  [Actions.TURN_END](gs, { isPlayerTurn }) {
    return { turn: gs.combat.turn, isPlayerTurn };
  },
};
