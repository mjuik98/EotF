import {
  setCombatActionButtonsDisabled,
  setCombatTurnIndicator,
  triggerBossPhaseShiftSprite,
} from '../../ui/combat/combat_turn_render_ui.js';
import { playEventBossPhase } from '../../domain/audio/audio_event_helpers.js';

function getDoc(deps) {
  return deps?.doc || document;
}

function getWin(deps) {
  return deps?.win || window;
}

export function cleanupCombatTurnTooltips(deps = {}) {
  const doc = getDoc(deps);
  const win = getWin(deps);
  const cleanupTooltips = deps.cleanupAllTooltips || win.CombatUI?.cleanupAllTooltips;
  if (typeof cleanupTooltips === 'function') {
    cleanupTooltips({ doc, win });
  } else {
    doc.getElementById('enemyStatusTooltip')?.classList.remove('visible');
    doc.getElementById('intentTooltip')?.classList.remove('visible');
  }

  const tooltipUI = deps.tooltipUI || win.TooltipUI;
  tooltipUI?.hideGeneralTooltip?.({ doc, win });
}

export function setEnemyTurnUiState(deps = {}) {
  const doc = getDoc(deps);
  setCombatTurnIndicator(doc, 'enemy', '적의 턴');
  deps.showTurnBanner?.('enemy');
  setCombatActionButtonsDisabled(doc, true);
}

export function syncCombatTurnEnergy(gs, deps = {}) {
  if (typeof deps.updateCombatEnergy === 'function') {
    deps.updateCombatEnergy(gs);
  } else if (typeof deps.hudUpdateUI?.updateCombatEnergy === 'function') {
    deps.hudUpdateUI.updateCombatEnergy(gs);
  } else if (typeof deps.win?.HudUpdateUI?.updateCombatEnergy === 'function') {
    deps.win.HudUpdateUI.updateCombatEnergy(gs);
  }
}

export function setPlayerTurnUiState(gs, deps = {}) {
  const doc = getDoc(deps);
  setCombatTurnIndicator(doc, 'player', '플레이어 턴');
  deps.showTurnBanner?.('player');
  setCombatActionButtonsDisabled(doc, false);

  deps.renderCombatCards?.();
  deps.renderCombatEnemies?.();
  deps.updateUI?.();

  setTimeout(() => syncCombatTurnEnergy(gs, deps), 100);
}

export function showBossPhaseShiftUi(gs, idx, deps = {}) {
  const doc = getDoc(deps);
  const win = getWin(deps);
  triggerBossPhaseShiftSprite(doc, idx);
  deps.screenShake?.shake?.(15, 1.0);
  playEventBossPhase(deps.audioEngine);
  deps.particleSystem?.burstEffect?.(
    win.innerWidth / 2 + (idx - (gs.combat.enemies.length / 2 - 0.5)) * 200,
    220,
  );
  setTimeout(() => {
    deps.renderCombatEnemies?.();
    deps.updateStatusDisplay?.();
  }, 50);
  deps.showEchoBurstOverlay?.();
}
