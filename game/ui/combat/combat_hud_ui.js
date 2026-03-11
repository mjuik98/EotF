import { applyEchoSkillButtonState } from '../hud/hud_render_helpers.js';
import {
  closeBattleChronicleOverlay,
  isChronicleOverlayOpen,
  openBattleChronicleOverlay,
} from './combat_hud_chronicle.js';
import {
  hideEchoSkillTooltip as hideEchoSkillTooltipOverlay,
  showEchoSkillTooltip as showEchoSkillTooltipOverlay,
  showTurnBanner as showCombatTurnBanner,
} from './combat_hud_feedback.js';
import { updateCombatLog as updateCombatLogEntries } from './combat_hud_log_ui.js';
import { renderCombatHudClassSpecial } from './combat_hud_special_ui.js';
import { updateCombatChainWidgets, updateNoiseWidgetUI } from './combat_hud_widgets_ui.js';

let _hudPinned = false;

function _getDoc(deps) {
  return deps?.doc || document;
}

function _getWin(deps) {
  return deps?.win || window;
}

export const CombatHudUI = {
  toggleHudPin(deps = {}) {
    _hudPinned = !_hudPinned;
    const doc = _getDoc(deps);
    const hud = doc.getElementById('hoverHud');
    const hint = doc.getElementById('hudPinHint');
    if (!hud) return;

    hud.classList.toggle('pinned', _hudPinned);
    if (_hudPinned && hint) hint.style.display = 'none';
    else if (!_hudPinned && hint) hint.style.display = '';
  },

  showEchoSkillTooltip(event, deps = {}) {
    showEchoSkillTooltipOverlay(_getDoc(deps), _getWin(deps), event, deps.gs);
  },

  hideEchoSkillTooltip(deps = {}) {
    hideEchoSkillTooltipOverlay(_getDoc(deps));
  },

  showTurnBanner(type, deps = {}) {
    showCombatTurnBanner(_getDoc(deps), _getWin(deps), type);
  },

  updateCombatLog(deps = {}) {
    const gs = deps.gs;
    if (!gs?.combat?.log) return;
    updateCombatLogEntries(_getDoc(deps), gs.combat.log);
  },

  updateEchoSkillBtn(deps = {}) {
    const gs = deps.gs;
    if (!gs?.player) return;

    const doc = _getDoc(deps);
    const btn = doc.getElementById('useEchoSkillBtn');
    if (!btn) return;

    applyEchoSkillButtonState(btn, gs.player.echo);
  },

  updateChainUI(chain, deps = {}) {
    const gs = deps.gs;
    if (!gs) return;
    updateCombatChainWidgets(_getDoc(deps), chain, !!gs.combat?.active);
  },

  updateNoiseWidget(deps = {}) {
    const gs = deps.gs;
    if (!gs) return;
    updateNoiseWidgetUI(_getDoc(deps), gs);
  },

  updateClassSpecialUI(deps = {}) {
    renderCombatHudClassSpecial(_getDoc(deps), deps.gs, deps.classMechanics, deps);
  },

  openBattleChronicle(deps = {}) {
    const doc = _getDoc(deps);
    const win = _getWin(deps);
    openBattleChronicleOverlay(doc, deps.gs?.combat?.log || [], {
      requestAnimationFrame: win.requestAnimationFrame?.bind(win),
    });
  },

  closeBattleChronicle(deps = {}) {
    closeBattleChronicleOverlay(_getDoc(deps));
  },

  toggleBattleChronicle(deps = {}) {
    const doc = _getDoc(deps);
    const overlay = doc.getElementById('battleChronicleOverlay');
    if (isChronicleOverlayOpen(overlay, doc)) {
      this.closeBattleChronicle(deps);
    } else {
      this.openBattleChronicle(deps);
    }
  },
};
