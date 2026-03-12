import { EndingScreenUI } from './ending_screen_ui.js';
import { removeFloatingPlayerHpPanel } from '../shared/player_hp_panel_ui.js';
import { deactivateCombat } from '../../shared/state/runtime_flow_controls.js';
import {
  clearActiveRunSave,
  getDoc,
  resolveGs,
} from './help_pause_ui_helpers.js';

export function confirmAbandonRun(deps = {}, onClosePauseMenu = () => {}) {
  const gs = resolveGs(deps);
  if (!gs) return false;

  const doc = getDoc(deps);
  doc.getElementById('abandonConfirm')?.remove();
  onClosePauseMenu(doc);

  if (gs.combat.active) {
    deactivateCombat(gs);
    const hudUpdateUI = deps.hudUpdateUI || null;
    if (typeof hudUpdateUI?.resetCombatUI === 'function') {
      hudUpdateUI.resetCombatUI({ ...deps, doc, gs });
    } else {
      doc.getElementById('combatOverlay')?.classList.remove('active');
    }
  }

  removeFloatingPlayerHpPanel({ doc });

  if (typeof deps.finalizeRunOutcome === 'function') {
    deps.finalizeRunOutcome('defeat', { echoFragments: 2, abandoned: true }, { gs });
  }

  clearActiveRunSave(deps);
  return EndingScreenUI.showOutcome('abandon', deps);
}
