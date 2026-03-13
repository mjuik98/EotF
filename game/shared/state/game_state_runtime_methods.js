import { GameStateCommonMethods } from '../../core/game_state_common_methods.js';
import { CardMethods } from '../../features/combat/application/card_methods_compat.js';
import { CombatMethods } from '../../features/combat/application/combat_methods_compat.js';
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
