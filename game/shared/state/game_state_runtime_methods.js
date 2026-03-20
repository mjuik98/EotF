import { GameStateCommonMethods } from '../../core/game_state_common_methods.js';
import { CardGameStateRuntimeCompatMethods } from './compat/game_state_card_runtime_compat_methods.js';
import { CombatGameStateRuntimeCompatMethods } from './compat/game_state_combat_runtime_compat_methods.js';
import { PlayerMethods } from './player_runtime_methods.js';

export const CombatGameStateRuntimeMethods = {
  ...CombatGameStateRuntimeCompatMethods,
};

export const CardGameStateRuntimeMethods = {
  ...CardGameStateRuntimeCompatMethods,
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
