import { PlayerResourceUseCaseMethods } from '../player/player_resource_use_cases.js';
import { PlayerRuntimeEffectMethods } from '../player/player_runtime_effects.js';
import { PlayerUiEffectMethods } from '../player/player_ui_effects.js';

export const PlayerMethods = {
  ...PlayerResourceUseCaseMethods,
  ...PlayerRuntimeEffectMethods,
  ...PlayerUiEffectMethods,
};
