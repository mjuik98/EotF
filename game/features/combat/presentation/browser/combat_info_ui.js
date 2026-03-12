import { renderCombatInfoItems } from '../../../../ui/combat/combat_info_items_ui.js';
import { renderCombatInfoStatuses } from '../../../../ui/combat/combat_info_status_ui.js';
import {
  resetCombatInfoState,
  toggleCombatInfoState,
} from '../../../../ui/combat/combat_info_runtime_ui.js';

function _getDoc(deps) {
  return deps?.doc || document;
}

export const CombatInfoUI = {
  reset(deps = {}) {
    resetCombatInfoState(deps);
  },

  toggle(deps = {}) {
    toggleCombatInfoState(deps, {
      onOpen: () => this.refresh(deps),
    });
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
