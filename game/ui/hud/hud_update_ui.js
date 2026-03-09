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
import { getDoc as _getDoc, getRaf } from '../../utils/runtime_deps.js';
import { renderFloatingPlayerHpPanel } from '../shared/player_hp_panel_ui.js';
import { createDeps } from '../../core/deps_factory.js';
import { updateHudPanels } from './hud_panel_sections.js';

let _uiPending = false;

function _getGS(deps) {
  return deps?.gs;
}

function _resolvePartialHudDeps(gs, deps = {}) {
  const resolvedDoc = _getDoc(deps);
  const resolvedWin = deps?.win || globalThis.window || globalThis;
  const factoryDeps = createDeps('hudUpdate', {
    gs,
    doc: resolvedDoc,
    win: resolvedWin,
  });

  return {
    ...factoryDeps,
    ...deps,
    gs,
    doc: deps?.doc || factoryDeps.doc || resolvedDoc,
    win: deps?.win || factoryDeps.win || resolvedWin,
  };
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
    if (!gs) return;

    const doc = _getDoc(deps);
    const btn = doc.getElementById('combatOverlay')?.querySelector('.action-btn-end');
    if (!btn) return;
    const hasEnergy = gs.player.energy > 0 && gs.combat.active && gs.combat.playerTurn;
    btn.classList.toggle('energy-warn', hasEnergy);
  },

  updateUI(deps = {}) {
    const isGameStarted = typeof deps.isGameStarted === 'function'
      ? deps.isGameStarted()
      : !!deps.gameStarted;

    if (!isGameStarted) {
      this.doUpdateUI(deps);
      return;
    }

    if (_uiPending) return;
    _uiPending = true;

    const raf = getRaf(deps);
    if (typeof raf === 'function') {
      raf(() => {
        _uiPending = false;
        this.doUpdateUI(deps);
      });
      return;
    }

    _uiPending = false;
    this.doUpdateUI(deps);
  },

  processDirtyFlags(deps = {}) {
    const gs = _getGS(deps);
    if (!gs || !gs.isDirty()) return;

    if (gs.hasDirtyFlag('hud')) {
      this.updateUI(deps);
    }

    const renderCombatEnemies = deps.renderCombatEnemies;
    if (gs.hasDirtyFlag('enemies') && typeof renderCombatEnemies === 'function') {
      renderCombatEnemies();
    }

    const renderCombatCards = deps.renderCombatCards;
    if (gs.hasDirtyFlag('hand') && typeof renderCombatCards === 'function') {
      renderCombatCards();
    }

    gs.clearDirty();
  },

  doUpdateUI(deps = {}) {
    const gs = _getGS(deps);
    const player = gs?.player;
    if (!gs || !player) return;

    const doc = _getDoc(deps);
    const data = deps.data;
    const domDeps = deps?.doc ? deps : { ...deps, doc };
    const setText = (id, val) => DomValueUI.setText(id, val, domDeps);

    renderFloatingPlayerHpPanel({ ...deps, doc, gs });
    updatePlayerStatsUI(gs, domDeps);
    updateCombatEnergyUI(gs, domDeps);

    if (typeof deps.updateNoiseWidget === 'function') deps.updateNoiseWidget();

    updateHudPanels({ gs, deps, doc, data, setText });

    const updateStatusDisplay = deps.updateStatusDisplay
      || globalThis.updateStatusDisplay
      || globalThis.GAME?.API?.updateStatusDisplay;
    if (typeof updateStatusDisplay === 'function') updateStatusDisplay();
    this.updateEndBtnWarn(deps);

    gs.clearDirtyFlag('hud');
  },

  updateCombatEnergy(gs, deps = {}) {
    updateCombatEnergyUI(gs, _resolvePartialHudDeps(gs, deps));
  },

  updatePlayerStats(gs, deps = {}) {
    const resolvedDeps = _resolvePartialHudDeps(gs, deps);
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
