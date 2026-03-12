import { performCombatDrawCard } from '../../../../ui/combat/combat_actions_runtime_ui.js';

export const CombatActionsUI = {
  drawCard(deps = {}) {
    performCombatDrawCard(deps.gs);
  },
};
