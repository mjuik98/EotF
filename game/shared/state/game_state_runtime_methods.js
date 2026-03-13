import { CombatMethods } from '../../combat/combat_methods.js';
import { CardMethods } from '../../combat/card_methods.js';
import { GameStateCommonMethods } from '../../core/game_state_common_methods.js';
import { PlayerMethods } from './player_runtime_methods.js';

export const GameStateRuntimeMethods = {
  ...GameStateCommonMethods,
  ...CombatMethods,
  ...CardMethods,
  ...PlayerMethods,
};

export function attachGameStateRuntimeMethods(target) {
  return Object.assign(target, GameStateRuntimeMethods);
}
