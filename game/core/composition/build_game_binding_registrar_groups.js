import { registerCanvasBindingGroup } from './register_canvas_binding_group.js';
import { registerCombatBindingGroup } from './register_combat_binding_group.js';
import { registerEventBindingGroup } from './register_event_binding_group.js';
import { registerScreenBindingGroup } from './register_screen_binding_group.js';
import { registerTitleBindingGroup } from './register_title_binding_group.js';

export function buildGameBindingRegistrarGroups() {
  return {
    gameplay: [
      registerCanvasBindingGroup,
      registerCombatBindingGroup,
      registerEventBindingGroup,
    ],
    shell: [
      registerScreenBindingGroup,
      registerTitleBindingGroup,
    ],
  };
}
