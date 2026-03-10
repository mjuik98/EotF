import { renderCombatInfoItems } from './combat_info_items_ui.js';
import { renderCombatInfoStatuses } from './combat_info_status_ui.js';

let _combatInfoOpen = false;

function _getDoc(deps) {
  return deps?.doc || document;
}

function _applyClosedState(doc) {
  const panel = doc.getElementById('combatInfoPanel');
  const tab = doc.getElementById('combatInfoTab');
  if (panel) panel.style.left = '-260px';
  if (tab) {
    tab.style.left = '0';
    tab.textContent = '📋 정보';
  }
}

export const CombatInfoUI = {
  reset(deps = {}) {
    _combatInfoOpen = false;
    const doc = _getDoc(deps);
    _applyClosedState(doc);
  },

  toggle(deps = {}) {
    const doc = _getDoc(deps);
    const panel = doc.getElementById('combatInfoPanel');
    const tab = doc.getElementById('combatInfoTab');
    if (!panel) return;

    _combatInfoOpen = !_combatInfoOpen;
    if (_combatInfoOpen) {
      panel.style.left = '0px';
      if (tab) {
        tab.style.left = '256px';
        tab.textContent = '✕ 닫기';
      }
      this.refresh(deps);
    } else {
      _applyClosedState(doc);
    }
  },

  refresh(deps = {}) {
    const gs = deps.gs;
    const data = deps.data;
    const statusKr = deps.statusKr;
    if (!gs?.player || !data?.items || !statusKr) return;

    const doc = _getDoc(deps);
    const statusEl = doc.getElementById('combatStatusList');
    const itemEl = doc.getElementById('combatItemList');
    if (!statusEl || !itemEl) return;

    renderCombatInfoStatuses({
      doc,
      statusEl,
      buffs: gs.player.buffs,
      statusKr,
    });
    renderCombatInfoItems({
      doc,
      itemEl,
      items: gs.player.items,
      data,
    });
  },
};
