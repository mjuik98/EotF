import { createCombatApplicationCapabilities } from '../../ports/public_application_capabilities.js';
import { createCombatActionContext } from './build_combat_action_context.js';
import { buildCombatFeedbackActionGroup } from './build_combat_feedback_action_group.js';
import { buildCombatPlayerActionGroup } from './build_combat_player_action_group.js';
import { buildCombatTurnActionGroup } from './build_combat_turn_action_group.js';
import { buildCombatUiActionGroup } from './build_combat_ui_action_group.js';

export function createCombatActions(modules, fns, ports) {
  const ctx = createCombatActionContext(
    modules,
    fns,
    ports,
    createCombatApplicationCapabilities(),
  );

  return {
    ...buildCombatTurnActionGroup(ctx),
    ...buildCombatUiActionGroup(ctx),
    ...buildCombatPlayerActionGroup(ctx),
    ...buildCombatFeedbackActionGroup(ctx),
  };
}
