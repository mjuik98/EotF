import { GameStateCommonMethods } from '../../core/game_state_common_methods.js';
import { CardMethods } from '../../features/combat/application/card_methods_compat.js';
import { CombatMethods } from '../../features/combat/application/combat_methods_compat.js';
import { PlayerMethods } from './player_runtime_methods.js';

export const CombatGameStateRuntimeMethods = {
  ...CombatMethods,
};

export const CardGameStateRuntimeMethods = {
  ...CardMethods,
};

export const CoreGameStateRuntimeMethods = {
  ...GameStateCommonMethods,
  ...PlayerMethods,
};

export const GameStateRuntimeMethods = {
  ...CoreGameStateRuntimeMethods,
};

export function attachCoreGameStateRuntimeMethods(target) {
  return Object.assign(target, CoreGameStateRuntimeMethods);
}

export function attachCombatGameStateRuntimeMethods(target) {
  return Object.assign(target, CombatGameStateRuntimeMethods);
}

export function attachCardGameStateRuntimeMethods(target) {
  return Object.assign(target, CardGameStateRuntimeMethods);
}

export function attachGameStateRuntimeMethods(target, options = {}) {
  const {
    includeCombat = false,
    includeCards = false,
  } = options;

  attachCoreGameStateRuntimeMethods(target);
  if (includeCombat) attachCombatGameStateRuntimeMethods(target);
  if (includeCards) attachCardGameStateRuntimeMethods(target);
  return target;
}
