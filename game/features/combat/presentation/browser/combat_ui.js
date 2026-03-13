import {
  hideEnemyStatusTooltipOverlay,
  showEnemyStatusTooltipOverlay,
} from './combat_enemy_status_tooltip_ui.js';
import {
  hideEnemyIntentTooltip,
  showEnemyIntentTooltip,
} from './combat_intent_ui.js';
import {
  ENEMY_STATUS_DESC,
  ENEMY_STATUS_KR,
} from '../../../../../data/status_effects_data.js';
import {
  createEnemyCardView,
  updateEnemyCardView,
  updateEnemyHpView,
} from './combat_enemy_card_ui.js';
import {
  buildEnemyHpUpdateViewModel,
  syncCombatEnemyFloatingTooltips,
} from './combat_enemy_runtime_ui.js';
import {
  buildCombatEnemyHandlers,
  cleanupCombatTooltips,
  renderCombatEnemyList,
} from './combat_enemy_list_presenter.js';
import { buildEnemyViewModel } from './combat_enemy_view_model_presenter.js';

export { ENEMY_STATUS_DESC, ENEMY_STATUS_KR };

function _getDoc(deps) {
  return deps?.doc || document;
}

export function resolveEnemyStatusTooltipMetrics(_statusKey, statusValue) {
  const value = Number(statusValue);
  if (!Number.isFinite(value) || value <= 0) {
    return { duration: '-', stacks: '-' };
  }

  const normalized = Math.floor(value);
  const duration = normalized >= 99 ? '무한' : `${normalized}턴`;
  return {
    duration,
    stacks: String(normalized),
  };
}

export const CombatUI = {
  showEnemyStatusTooltip(event, statusKey, statusValueOrDeps = null, deps = {}) {
    showEnemyStatusTooltipOverlay(event, statusKey, statusValueOrDeps, deps);
  },

  hideEnemyStatusTooltip(deps = {}) {
    hideEnemyStatusTooltipOverlay(deps);
  },

  showIntentTooltip(event, enemyIdx, deps = {}) {
    showEnemyIntentTooltip(event, enemyIdx, deps);
  },

  hideIntentTooltip(deps = {}) {
    hideEnemyIntentTooltip(deps);
  },

  cleanupAllTooltips(deps = {}) {
    cleanupCombatTooltips({ ...deps, doc: _getDoc(deps) });
  },

  renderCombatEnemies(deps = {}) {
    const gs = deps.gs;
    const data = deps.data;
    if (!gs?.combat?.enemies || !data?.cards) return;

    const doc = _getDoc(deps);
    const zone = doc.getElementById('enemyZone');
    if (!zone) return;

    renderCombatEnemyList({
      createEnemyCardView,
      data,
      deps,
      doc,
      buildEnemyViewModel,
      gs,
      handlers: buildCombatEnemyHandlers(this),
      syncCombatEnemyFloatingTooltips,
      ui: this,
      updateEnemyCardView,
      zone,
    });
  },

  updateEnemyHpUI(idx, enemy, deps = {}) {
    if (!enemy) return;
    const doc = _getDoc(deps);
    updateEnemyHpView(buildEnemyHpUpdateViewModel({ doc, index: idx, enemy }));
  },

  api: {
    updateCombatUI: (deps) => CombatUI.renderCombatEnemies(deps),
    showIntentTooltip: (event, idx, deps) => CombatUI.showIntentTooltip(event, idx, deps),
    hideIntentTooltip: (deps) => CombatUI.hideIntentTooltip(deps),
    renderCombatEnemies: (deps) => CombatUI.renderCombatEnemies(deps),
  },
};
