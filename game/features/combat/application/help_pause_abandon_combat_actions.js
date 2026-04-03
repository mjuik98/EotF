import { applyCombatEndCleanupState } from '../ports/public_state_capabilities.js';
import { buildCombatEndItemTriggerPayload } from './combat_end_item_trigger_payload.js';

export function cleanupCombatAfterAbandon(deps = {}) {
  const { gs, doc } = deps;
  if (!gs?.combat?.active) return false;

  gs.triggerItems?.('combat_end', buildCombatEndItemTriggerPayload({
    isBoss: false,
    defeated: true,
    abandoned: true,
  }));
  applyCombatEndCleanupState(gs);
  const hudUpdateUI = deps.hudUpdateUI || null;
  if (typeof hudUpdateUI?.resetCombatUI === 'function') {
    hudUpdateUI.resetCombatUI({ ...deps, doc, gs });
  } else {
    doc?.getElementById?.('combatOverlay')?.classList.remove('active');
  }

  return true;
}
