export function createCombatEndUiPort({
  cleanupAllTooltips,
  doc,
  hudUpdateUI,
  renderCombatCards,
  renderHand,
  showCombatSummary,
  tooltipUI,
  updateChainUI,
  updateUI,
  win,
} = {}) {
  return {
    resetAfterCombat(options = {}) {
      if (options.hideTooltips) {
        tooltipUI?.hideTooltip?.({ doc });
        cleanupAllTooltips?.({ doc, win });
        doc?.getElementById?.('cardTooltip')?.classList?.remove?.('visible');
      }

      if (options.clearHand) {
        const combatHandCards = doc?.getElementById?.('combatHandCards');
        if (combatHandCards) combatHandCards.textContent = '';
      }

      if (options.resetCombatUi) {
        if (typeof hudUpdateUI?.resetCombatUI === 'function') {
          hudUpdateUI.resetCombatUI();
        } else {
          doc?.getElementById?.('combatOverlay')?.classList?.remove?.('active');
          doc?.getElementById?.('noiseGaugeOverlay')?.remove?.();
          const enemyZone = doc?.getElementById?.('enemyZone');
          if (enemyZone) enemyZone.textContent = '';
        }
      }

      if (options.resetChain) updateChainUI?.(0);

      renderHand?.();
      renderCombatCards?.();
      updateUI?.();
    },

    hideNodeOverlay() {
      if (typeof hudUpdateUI?.hideNodeOverlay === 'function') {
        hudUpdateUI.hideNodeOverlay();
        return;
      }

      const nodeOverlay = doc?.getElementById?.('nodeCardOverlay');
      if (nodeOverlay) nodeOverlay.style.display = 'none';
    },

    showSummary(summary = {}) {
      showCombatSummary?.(summary.dealt || 0, summary.taken || 0, summary.kills || 0);
    },
  };
}

export function createCombatEndRewardFlowPort({
  openReward,
  returnFromReward,
  returnToGame,
  showRewardScreen,
} = {}) {
  return {
    openReward(mode = false) {
      if (typeof openReward === 'function') {
        openReward(mode);
        return;
      }
      showRewardScreen?.(mode);
    },

    returnFromReward() {
      if (typeof returnFromReward === 'function') {
        returnFromReward();
        return;
      }
      returnToGame?.(true);
    },
  };
}

export function createCombatEndAudioPort({ playItemGet } = {}) {
  return {
    playItemGet() {
      playItemGet?.();
    },
  };
}

export function createCombatEndClockPort({
  setTimeoutFn = setTimeout,
} = {}) {
  return {
    delay(ms) {
      return new Promise((resolve) => setTimeoutFn(resolve, ms));
    },
  };
}
