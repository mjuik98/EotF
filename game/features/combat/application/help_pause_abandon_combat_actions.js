import { deactivateCombat } from '../ports/public_state_capabilities.js';

export function cleanupCombatAfterAbandon(deps = {}) {
  const { gs, doc } = deps;
  if (!gs?.combat?.active) return false;

  deactivateCombat(gs);
  const hudUpdateUI = deps.hudUpdateUI || null;
  if (typeof hudUpdateUI?.resetCombatUI === 'function') {
    hudUpdateUI.resetCombatUI({ ...deps, doc, gs });
  } else {
    doc?.getElementById?.('combatOverlay')?.classList.remove('active');
  }

  return true;
}
