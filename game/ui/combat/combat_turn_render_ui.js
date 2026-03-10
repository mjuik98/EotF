export function setCombatTurnIndicator(doc, turn, label) {
  const turnIndicator = doc?.getElementById?.('turnIndicator');
  if (!turnIndicator) return null;
  turnIndicator.className = `turn-indicator turn-${turn}`;
  turnIndicator.textContent = label;
  return turnIndicator;
}

export function setCombatActionButtonsDisabled(doc, disabled) {
  const buttons = doc?.querySelectorAll?.('.combat-actions .action-btn') || [];
  buttons.forEach((btn) => {
    btn.disabled = !!disabled;
    if (!disabled) btn.style.pointerEvents = '';
  });
  return buttons;
}

export function triggerBossPhaseShiftSprite(doc, idx, setTimeoutFn = setTimeout) {
  const sprite = doc?.getElementById?.(`enemy_sprite_${idx}`);
  if (!sprite) return null;
  sprite.style.animation = 'none';
  setTimeoutFn(() => {
    sprite.style.animation = 'enemyHit 0.8s ease 3';
  }, 10);
  return sprite;
}
