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
import { getDoc as _getDoc, getHudUpdateDeps } from '../../../../shared/runtime/hud_runtime_deps.js';
import { renderFloatingPlayerHpPanel } from '../../ports/hud_shared_view_ports.js';
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

function resolveHudUpdateDeps(gs, deps = {}) {
  const shouldHydrateFromContract = !deps.updateStatusDisplay
    || !deps.StatusEffectsUI
    || !deps.statusEffectsUI
    || !deps.TooltipUI
    || !deps.tooltipUI;
  const contractDeps = shouldHydrateFromContract ? (getHudUpdateDeps(deps) || {}) : {};
  return resolvePartialHudDeps(gs, { ...contractDeps, ...deps }, _getDoc);
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
    updateCombatEnergyUI(gs, resolveHudUpdateDeps(gs, deps));
  },

  updatePlayerStats(gs, deps = {}) {
    const resolvedDeps = resolveHudUpdateDeps(gs, deps);
    renderFloatingPlayerHpPanel(resolvedDeps);
    updatePlayerStatsUI(gs, resolvedDeps);
    resolvedDeps.updateStatusDisplay?.();
  },

  api: {
    updateUI: (deps) => HudUpdateUI.updateUI(deps),
    updatePlayerStats: (gs, deps) => HudUpdateUI.updatePlayerStats(gs, deps),
    updateCombatEnergy: (gs, deps) => HudUpdateUI.updateCombatEnergy(gs, deps),
    resetCombatUI: (deps) => HudUpdateUI.resetCombatUI(deps),
    triggerDeckShufflePulse: (deps) => HudUpdateUI.triggerDeckShufflePulse(deps),
  },
};
