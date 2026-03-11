import {
  triggerDeckShufflePulseUI,
  enableActionButtonsUI,
  triggerDrawCardAnimationUI,
  triggerCardShakeAnimationUI,
  resetCombatUIUI,
  hideNodeOverlayUI,
} from './hud_effects_ui.js';
import { updateCombatEnergyUI, updatePlayerStatsUI } from './hud_stats_ui.js';
import { DomValueUI } from './dom_value_ui.js';
import { getDoc as _getDoc } from '../../utils/runtime_deps.js';
import { renderFloatingPlayerHpPanel } from '../shared/player_hp_panel_ui.js';
import { updateHudPanels } from './hud_panel_sections.js';
import {
  performHudRefresh,
  processHudDirtyFlags,
  resolvePartialHudDeps,
  scheduleHudUpdate,
  updateEndButtonWarn,
} from './hud_update_runtime_helpers.js';

function _getGS(deps) {
  return deps?.gs;
}

export const HudUpdateUI = {
  triggerDeckShufflePulse(deps = {}) {
    triggerDeckShufflePulseUI(deps);
  },

  enableActionButtons(deps = {}) {
    enableActionButtonsUI(deps);
  },

  triggerDrawCardAnimation(deps = {}) {
    triggerDrawCardAnimationUI(deps);
  },

  triggerCardShakeAnimation(deps = {}) {
    triggerCardShakeAnimationUI(deps);
  },

  resetCombatUI(deps = {}) {
    resetCombatUIUI(deps);
  },

  hideNodeOverlay(deps = {}) {
    hideNodeOverlayUI(deps);
  },

  updateEndBtnWarn(deps = {}) {
    updateEndButtonWarn(_getGS(deps), _getDoc(deps));
  },

  updateUI(deps = {}) {
    scheduleHudUpdate(deps, () => this.doUpdateUI(deps));
  },

  processDirtyFlags(deps = {}) {
    processHudDirtyFlags(_getGS(deps), deps, () => this.updateUI(deps));
  },

  doUpdateUI(deps = {}) {
    performHudRefresh({
      gs: _getGS(deps),
      deps,
      doc: _getDoc(deps),
      setText: (id, val, domDeps) => DomValueUI.setText(id, val, domDeps),
      renderFloatingPlayerHpPanel,
      updatePlayerStatsUI,
      updateCombatEnergyUI,
      updateHudPanels,
      updateEndBtnWarn: () => this.updateEndBtnWarn(deps),
    });
  },

  updateCombatEnergy(gs, deps = {}) {
    updateCombatEnergyUI(gs, resolvePartialHudDeps(gs, deps, _getDoc));
  },

  updatePlayerStats(gs, deps = {}) {
    const resolvedDeps = resolvePartialHudDeps(gs, deps, _getDoc);
    renderFloatingPlayerHpPanel(resolvedDeps);
    updatePlayerStatsUI(gs, resolvedDeps);
  },

  api: {
    updateUI: (deps) => HudUpdateUI.updateUI(deps),
    updatePlayerStats: (gs, deps) => HudUpdateUI.updatePlayerStats(gs, deps),
    updateCombatEnergy: (gs, deps) => HudUpdateUI.updateCombatEnergy(gs, deps),
    resetCombatUI: (deps) => HudUpdateUI.resetCombatUI(deps),
    triggerDeckShufflePulse: (deps) => HudUpdateUI.triggerDeckShufflePulse(deps),
  },
};
