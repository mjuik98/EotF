import { GameStateCommonMethods } from '../../core/game_state_common_methods.js';
import { CardMethods } from '../../features/combat/application/card_methods_compat.js';
import { CombatMethods } from '../../features/combat/application/combat_methods_compat.js';
import { PlayerMethods } from './player_runtime_methods.js';

export const CombatGameStateRuntimeMethods = {
  ...CombatMethods,
  ...CardMethods,
};

export const CoreGameStateRuntimeMethods = {
  ...GameStateCommonMethods,
  ...PlayerMethods,
};

export const GameStateRuntimeMethods = {
  ...CoreGameStateRuntimeMethods,
  ...CombatGameStateRuntimeMethods,
};

export function attachCoreGameStateRuntimeMethods(target) {
  return Object.assign(target, CoreGameStateRuntimeMethods);
}

export function attachCombatGameStateRuntimeMethods(target) {
  return Object.assign(target, CombatGameStateRuntimeMethods);
}

export function attachGameStateRuntimeMethods(target, options = {}) {
  const {
    includeCombat = true,
  } = options;

  attachCoreGameStateRuntimeMethods(target);
  if (includeCombat) attachCombatGameStateRuntimeMethods(target);
  return target;
}
