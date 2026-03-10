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
  const turnIndicator = doc.getElementById('turnIndicator');
  if (turnIndicator) {
    turnIndicator.className = 'turn-indicator turn-enemy';
    turnIndicator.textContent = '적의 턴';
  }
  deps.showTurnBanner?.('enemy');
  doc.querySelectorAll('.combat-actions .action-btn').forEach((btn) => {
    btn.disabled = true;
  });
}

export function syncCombatTurnEnergy(gs, deps = {}) {
  if (typeof deps.updateCombatEnergy === 'function') {
    deps.updateCombatEnergy(gs);
  } else if (typeof deps.hudUpdateUI?.updateCombatEnergy === 'function') {
    deps.hudUpdateUI.updateCombatEnergy(gs);
  } else if (globalThis.HudUpdateUI?.updateCombatEnergy) {
    globalThis.HudUpdateUI.updateCombatEnergy(gs);
  } else if (globalThis.GAME?.Modules?.['HudUpdateUI']?.updateCombatEnergy) {
    globalThis.GAME.Modules['HudUpdateUI'].updateCombatEnergy(gs);
  }
}

export function setPlayerTurnUiState(gs, deps = {}) {
  const doc = getDoc(deps);
  const turnIndicator = doc.getElementById('turnIndicator');
  if (turnIndicator) {
    turnIndicator.className = 'turn-indicator turn-player';
    turnIndicator.textContent = '플레이어 턴';
  }
  deps.showTurnBanner?.('player');
  doc.querySelectorAll('.combat-actions .action-btn').forEach((btn) => {
    btn.disabled = false;
    btn.style.pointerEvents = '';
  });

  deps.renderCombatCards?.();
  deps.renderCombatEnemies?.();
  deps.updateUI?.();

  setTimeout(() => syncCombatTurnEnergy(gs, deps), 100);
}

export function showBossPhaseShiftUi(gs, idx, deps = {}) {
  const doc = getDoc(deps);
  const win = getWin(deps);
  const sprite = doc.getElementById(`enemy_sprite_${idx}`);
  if (sprite) {
    sprite.style.animation = 'none';
    setTimeout(() => { sprite.style.animation = 'enemyHit 0.8s ease 3'; }, 10);
  }
  deps.screenShake?.shake?.(15, 1.0);
  deps.audioEngine?.playBossPhase?.();
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
