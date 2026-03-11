function buildEndCombatDeps(deps = {}, win = {}) {
  return {
    ...deps,
    showRewardScreen: deps.showRewardScreen || win.showRewardScreen,
    showCombatSummary: deps.showCombatSummary || win.showCombatSummary,
    switchScreen: deps.switchScreen || win.switchScreen,
    returnToGame: deps.returnToGame || win.returnToGame,
    updateUI: deps.updateUI || win.updateUI,
    renderHand: deps.renderHand || win.renderHand,
    updateChainUI: deps.updateChainUI || win.updateChainUI,
    tooltipUI: deps.tooltipUI || win.TooltipUI,
    hudUpdateUI: deps.hudUpdateUI || win.HudUpdateUI,
  };
}

export function cleanupEnemyDeathTooltips(cleanupTooltips, doc, win) {
  if (typeof cleanupTooltips === 'function') {
    cleanupTooltips({ doc, win });
  }
}

export function scheduleEnemyRemoval(cardEl, schedule, onRemove) {
  if (!cardEl) return false;
  cardEl.classList.add('dying');
  schedule(function removeEnemyCard() {
    onRemove?.();
  }, 700);
  return true;
}

export function lockCombatEndInputs(doc) {
  if (!doc) return;
  doc.querySelectorAll('.combat-actions .action-btn, #combatHandCards .card').forEach(function lockInput(el) {
    el.style.pointerEvents = 'none';
    el.disabled = true;
  });
}

export function scheduleCombatEndFlow({
  deps = {},
  endCombat,
  schedule,
  win,
} = {}) {
  schedule(function runEndCombat() {
    const endCombatDeps = buildEndCombatDeps(deps, win);
    if (typeof deps.cleanupAllTooltips === 'function') deps.cleanupAllTooltips();
    if (typeof deps.renderCombatCards === 'function') deps.renderCombatCards();
    endCombat?.(endCombatDeps);
  }, 900);
}

export function runPlayerDeathSequence({
  combatOverlay,
  deathQuotes = [],
  doc,
  particleSystem,
  schedule,
  screenShake,
  showDeathScreen,
  win,
} = {}) {
  screenShake?.shake?.(20, 1.2);
  particleSystem?.deathEffect?.(win.innerWidth / 2, win.innerHeight / 2);
  combatOverlay?.classList?.remove?.('active');

  doc.body.style.transition = 'filter 1s';
  doc.body.style.filter = 'saturate(0.2) brightness(0.6)';

  schedule(function showDeathQuote() {
    const quote = deathQuotes[Math.floor(Math.random() * deathQuotes.length)] || '';
    const mono = doc.createElement('div');
    mono.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:1800;pointer-events:none;';
    const monoInner = doc.createElement('div');
    monoInner.style.cssText = "font-family:'Crimson Pro',serif;font-style:italic;font-size:clamp(18px,3vw,28px);color:rgba(238,240,255,0.9);text-align:center;max-width:500px;line-height:1.8;text-shadow:0 0 40px rgba(123,47,255,0.8);animation:fadeInUp 1s ease both;";
    monoInner.textContent = quote;
    mono.appendChild(monoInner);
    doc.body.appendChild(mono);

    schedule(function finishDeathSequence() {
      mono.remove();
      doc.body.style.filter = '';
      doc.body.style.transition = '';
      showDeathScreen?.();
    }, 2500);
  }, 800);
}

export function showDefeatOutcome({
  deps = {},
  endingScreenUI,
  finalizeRunOutcome,
  gs,
  selectFragment,
} = {}) {
  if (typeof finalizeRunOutcome === 'function') {
    finalizeRunOutcome('defeat', { echoFragments: 3 }, { gs });
  }
  endingScreenUI?.showOutcome?.('defeat', {
    ...deps,
    gs,
    selectFragment,
  });
}
