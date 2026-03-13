import { createRewardReturnActions } from '../../../shared/runtime/reward_return_actions.js';

function buildDeathRewardFlowActions(deps = {}, win = {}) {
  return createRewardReturnActions({
    rewardActions: deps.rewardActions,
    returnFromReward: deps.returnFromReward || win.returnFromReward,
    returnToGame: deps.returnToGame || win.returnToGame,
  });
}

export function buildCombatEndFlowPayload(deps = {}, win = {}) {
  const rewardReturnActions = buildDeathRewardFlowActions(deps, win);
  return {
    ...deps,
    showRewardScreen: deps.showRewardScreen || win.showRewardScreen,
    showCombatSummary: deps.showCombatSummary || win.showCombatSummary,
    switchScreen: deps.switchScreen || win.switchScreen,
    returnToGame: rewardReturnActions.returnToGame,
    returnFromReward: rewardReturnActions.returnFromReward,
    rewardActions: {
      ...deps.rewardActions,
      ...rewardReturnActions.rewardActions,
    },
    updateUI: deps.updateUI || win.updateUI,
    renderHand: deps.renderHand || win.renderHand,
    updateChainUI: deps.updateChainUI || win.updateChainUI,
    tooltipUI: deps.tooltipUI || win.TooltipUI,
    hudUpdateUI: deps.hudUpdateUI || win.HudUpdateUI,
  };
}

export function buildDeathEndingActions(deps = {}, win = {}) {
  const restart = deps.endingActions?.restart
    || deps.restartEndingFlow
    || deps.restartFromEnding
    || win.restartEndingFlow
    || win.restartFromEnding;
  const selectFragment = deps.endingActions?.selectFragment
    || deps.selectEndingFragment
    || deps.selectFragment
    || win.selectEndingFragment
    || win.selectFragment;
  const openCodex = deps.endingActions?.openCodex
    || deps.openEndingCodex
    || deps.openCodex
    || win.openEndingCodex
    || win.openCodex;

  return {
    restart: typeof restart === 'function' ? (...args) => restart(...args) : undefined,
    selectFragment: typeof selectFragment === 'function' ? (effect) => selectFragment(effect) : undefined,
    openCodex: typeof openCodex === 'function' ? (...args) => openCodex(...args) : undefined,
  };
}

export { buildDeathRewardFlowActions };

export function cleanupEnemyDeathTooltips(cleanupTooltips, doc, win) {
  if (typeof cleanupTooltips === 'function') {
    cleanupTooltips({ doc, win });
  }
}

export function scheduleEnemyRemoval(cardEl, schedule, onRemove) {
  if (!cardEl) return false;
  cardEl.classList.add('dying');
  schedule(() => {
    onRemove?.();
  }, 700);
  return true;
}

export function lockCombatEndInputs(doc) {
  if (!doc) return;
  doc.querySelectorAll('.combat-actions .action-btn, #combatHandCards .card').forEach((el) => {
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
  schedule(() => {
    const endCombatDeps = buildCombatEndFlowPayload(deps, win);
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

  schedule(() => {
    const quote = deathQuotes[Math.floor(Math.random() * deathQuotes.length)] || '';
    const mono = doc.createElement('div');
    mono.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:1800;pointer-events:none;';
    const monoInner = doc.createElement('div');
    monoInner.style.cssText = "font-family:'Crimson Pro',serif;font-style:italic;font-size:clamp(18px,3vw,28px);color:rgba(238,240,255,0.9);text-align:center;max-width:500px;line-height:1.8;text-shadow:0 0 40px rgba(123,47,255,0.8);animation:fadeInUp 1s ease both;";
    monoInner.textContent = quote;
    mono.appendChild(monoInner);
    doc.body.appendChild(mono);

    schedule(() => {
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
  win,
} = {}) {
  if (typeof finalizeRunOutcome === 'function') {
    finalizeRunOutcome('defeat', { echoFragments: 3 }, { gs });
  }
  endingScreenUI?.showOutcome?.('defeat', {
    ...deps,
    gs,
    endingActions: buildDeathEndingActions({ ...deps, selectFragment }, win),
    selectFragment,
  });
}
