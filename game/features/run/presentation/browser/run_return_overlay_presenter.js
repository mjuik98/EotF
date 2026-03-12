export const OVERLAY_DISMISS_MS = 320;

function nextFrame(cb) {
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(cb);
    return;
  }
  setTimeout(cb, 16);
}

export function getRunReturnDoc(deps) {
  return deps?.doc || document;
}

export function clearRunReturnCombatSurface(doc) {
  doc.getElementById('combatOverlay')?.classList.remove('active');
  const combatHand = doc.getElementById('combatHandCards');
  if (combatHand) combatHand.textContent = '';
  const enemyZone = doc.getElementById('enemyZone');
  if (enemyZone) enemyZone.textContent = '';
}

export function dismissRunReturnNodeOverlay(nodeOverlay, fromReward) {
  if (nodeOverlay && fromReward) {
    if (nodeOverlay.dataset.dismissing !== '1') {
      nodeOverlay.dataset.dismissing = '1';
      nodeOverlay.style.opacity = '1';
      nodeOverlay.style.filter = 'blur(0)';
      nodeOverlay.style.transform = 'translateY(0) scale(1)';
      nodeOverlay.style.transition = 'opacity 0.32s ease, filter 0.32s ease, transform 0.32s ease';
      nodeOverlay.style.pointerEvents = 'none';
      nextFrame(() => {
        nodeOverlay.style.opacity = '0';
        nodeOverlay.style.filter = 'blur(12px)';
        nodeOverlay.style.transform = 'translateY(10px) scale(0.985)';
      });
      setTimeout(() => {
        nodeOverlay.removeAttribute('data-dismissing');
        nodeOverlay.style.display = 'none';
        nodeOverlay.style.pointerEvents = 'none';
        nodeOverlay.style.opacity = '';
        nodeOverlay.style.filter = '';
        nodeOverlay.style.transform = '';
        nodeOverlay.style.transition = '';
      }, OVERLAY_DISMISS_MS);
    }
    return;
  }

  if (nodeOverlay) {
    nodeOverlay.style.display = 'none';
    nodeOverlay.style.pointerEvents = 'none';
  }
}

export function prepareRewardExitPresentation(doc, fromReward) {
  const rewardScreen = doc.getElementById('rewardScreen');
  let rewardExitDelay = 0;
  let clearRewardExitStyles = () => {};

  if (fromReward && rewardScreen?.classList.contains('active')) {
    rewardExitDelay = OVERLAY_DISMISS_MS;
    doc.getElementById('gameScreen')?.classList.add('active');
    rewardScreen.style.opacity = '1';
    rewardScreen.style.filter = 'blur(0)';
    rewardScreen.style.transform = 'translateY(0) scale(1)';
    rewardScreen.style.transition = 'opacity 0.32s ease, filter 0.32s ease, transform 0.32s ease';
    rewardScreen.style.pointerEvents = 'none';
    nextFrame(() => {
      rewardScreen.style.opacity = '0';
      rewardScreen.style.filter = 'blur(12px)';
      rewardScreen.style.transform = 'translateY(10px) scale(0.985)';
    });
    clearRewardExitStyles = () => {
      rewardScreen.style.pointerEvents = '';
      rewardScreen.style.opacity = '';
      rewardScreen.style.filter = '';
      rewardScreen.style.transform = '';
      rewardScreen.style.transition = '';
    };
  } else {
    rewardScreen?.classList.remove('active');
  }

  return {
    rewardExitDelay,
    rewardScreen,
    clearRewardExitStyles,
  };
}

export function showGameplayScreenFromReturn(deps = {}) {
  if (typeof deps.showGameplayScreen === 'function') {
    deps.showGameplayScreen();
    return;
  }
  deps.switchScreen?.('game');
}

export function scheduleRunReturnRefresh(deps, delay, cb) {
  setTimeout(() => {
    deps.updateUI?.();
    deps.updateNextNodes?.();
    cb?.();
  }, delay);
}
