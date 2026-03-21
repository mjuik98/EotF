import { applyEchoSkillButtonState } from './hud_render_helpers.js';
import {
  hideEchoSkillTooltip as hideEchoSkillTooltipOverlay,
  showEchoSkillTooltip as showEchoSkillTooltipOverlay,
  showTurnBanner as showCombatTurnBanner,
} from './combat_hud_feedback.js';
import { updateCombatLog as updateCombatLogEntries } from './combat_hud_log_ui.js';
import { renderCombatHudClassSpecial } from './combat_hud_special_ui.js';
import {
  updateCombatChainWidgets,
  updateNoiseWidgetUI,
} from './combat_hud_widgets_ui.js';
import { ensureCombatChronicleBrowserModules } from '../../platform/browser/ensure_combat_chronicle_browser_modules.js';

let _hudPinned = false;

function _getDoc(deps) {
  return deps?.doc || document;
}

function _getWin(deps) {
  return deps?.win || deps?.doc?.defaultView || _getDoc(deps)?.defaultView || null;
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

  async openBattleChronicle(deps = {}) {
    const doc = _getDoc(deps);
    const win = _getWin(deps);
    const chronicleModules = await ensureCombatChronicleBrowserModules(doc);
    chronicleModules?.openBattleChronicleOverlay?.(doc, deps.gs?.combat?.log || [], {
      requestAnimationFrame: win?.requestAnimationFrame,
    });
  },

  async closeBattleChronicle(deps = {}) {
    const chronicleModules = await ensureCombatChronicleBrowserModules(_getDoc(deps));
    chronicleModules?.closeBattleChronicleOverlay?.(_getDoc(deps));
  },

  async toggleBattleChronicle(deps = {}) {
    const doc = _getDoc(deps);
    const overlay = doc.getElementById('battleChronicleOverlay');
    const chronicleModules = await ensureCombatChronicleBrowserModules(doc);
    if (chronicleModules?.isChronicleOverlayOpen?.(overlay, doc)) {
      await this.closeBattleChronicle(deps);
    } else {
      await this.openBattleChronicle(deps);
    }
  },
};
