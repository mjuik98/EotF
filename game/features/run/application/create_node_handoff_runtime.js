function callMaybe(fn, ...args) {
  if (typeof fn !== 'function') return undefined;
  return fn(...args);
}

function callWithFallback(primary, fallback, ...args) {
  if (typeof primary === 'function') return primary(...args);
  return callMaybe(fallback, ...args);
}

export function createNodeHandoffRuntime(deps = {}) {
  const nodeHandoff = deps.nodeHandoff || {};

  return {
    startCombat(mode = 'normal') {
      return callWithFallback(nodeHandoff.startCombat, deps.startCombat, mode);
    },

    openEvent() {
      return callWithFallback(nodeHandoff.openEvent, deps.triggerRandomEvent);
    },

    openShop() {
      return callWithFallback(nodeHandoff.openShop, deps.showShop);
    },

    openRestSite() {
      return callWithFallback(nodeHandoff.openRestSite, deps.showRestSite);
    },

    openReward(mode = false) {
      return callWithFallback(nodeHandoff.openReward, deps.openReward || deps.showRewardScreen, mode);
    },
  };
}
