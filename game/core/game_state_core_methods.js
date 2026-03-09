import { CombatMethods } from '../combat/combat_methods.js';
import { CardMethods } from '../combat/card_methods.js';
import { PlayerMethods } from '../combat/player_methods.js';
import { GameStateCommonMethods } from './game_state_common_methods.js';

/**
 * Central facade that composes the game-state business methods.
 */
export const GameStateCoreMethods = {
  ...GameStateCommonMethods,
  ...CombatMethods,
  ...CardMethods,
  ...PlayerMethods,
};
