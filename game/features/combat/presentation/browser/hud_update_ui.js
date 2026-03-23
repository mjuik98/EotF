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
import {
  getDoc as _getDoc,
  getHudUpdateDeps,
} from '../../ports/presentation_shared_runtime_capabilities.js';
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
    const gs = _getGS(deps);
    const resolvedDeps = resolveHudUpdateDeps(gs, deps);
    updateEndButtonWarn(gs, _getDoc(resolvedDeps));
  },

  updateUI(deps = {}) {
    const gs = _getGS(deps);
    const resolvedDeps = resolveHudUpdateDeps(gs, deps);
    scheduleHudUpdate(resolvedDeps, () => this.doUpdateUI(resolvedDeps));
  },

  processDirtyFlags(deps = {}) {
    const gs = _getGS(deps);
    const resolvedDeps = resolveHudUpdateDeps(gs, deps);
    processHudDirtyFlags(gs, resolvedDeps, () => this.updateUI(resolvedDeps));
  },

  doUpdateUI(deps = {}) {
    const gs = _getGS(deps);
    const resolvedDeps = resolveHudUpdateDeps(gs, deps);
    performHudRefresh({
      gs,
      deps: resolvedDeps,
      doc: _getDoc(resolvedDeps),
      setText: (id, val, domDeps) => DomValueUI.setText(id, val, domDeps),
      renderFloatingPlayerHpPanel,
      updatePlayerStatsUI,
      updateCombatEnergyUI,
      updateHudPanels,
      updateEndBtnWarn: () => this.updateEndBtnWarn(resolvedDeps),
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
