import { createCanvasBindings } from '../bindings/canvas_bindings.js';
import { createCombatBindings } from '../bindings/combat_bindings.js';
import { createEventRewardBindings } from '../bindings/event_reward_bindings.js';
import { createUIBindings } from '../bindings/ui_bindings.js';
import { createTitleSettingsBindings } from '../bindings/title_settings_bindings.js';

export function registerGameBindings(modules, fns) {
  createCanvasBindings(modules, fns);
  createCombatBindings(modules, fns);
  createEventRewardBindings(modules, fns);
  createUIBindings(modules, fns);
  createTitleSettingsBindings(modules, fns);
  return fns;
}
