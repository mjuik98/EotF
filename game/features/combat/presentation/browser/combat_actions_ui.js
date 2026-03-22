import { performCombatDrawCard } from './combat_actions_runtime_ui.js';

export const CombatActionsUI = {
  drawCard(deps = {}) {
    return performCombatDrawCard(deps.gs, deps);
  },
};
