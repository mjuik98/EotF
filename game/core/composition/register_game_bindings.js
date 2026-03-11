import { registerCanvasBindingGroup } from './register_canvas_binding_group.js';
import { registerCombatBindingGroup } from './register_combat_binding_group.js';
import { registerEventBindingGroup } from './register_event_binding_group.js';
import { registerScreenBindingGroup } from './register_screen_binding_group.js';
import { registerTitleBindingGroup } from './register_title_binding_group.js';

export function registerGameBindings(modules, fns) {
  registerCanvasBindingGroup(modules, fns);
  registerCombatBindingGroup(modules, fns);
  registerEventBindingGroup(modules, fns);
  registerScreenBindingGroup(modules, fns);
  registerTitleBindingGroup(modules, fns);
  return fns;
}
