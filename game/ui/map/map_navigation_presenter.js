function hideNodeOverlay(doc) {
  const overlay = doc?.getElementById?.('nodeCardOverlay');
  if (!overlay) return;
  overlay.style.pointerEvents = 'none';
  overlay.style.display = 'none';
}

function runNodeAction(nodeType, deps) {
  const nodeHandlers = {
    combat: () => deps.startCombat?.('normal'),
    elite: () => deps.startCombat?.('normal'),
    mini_boss: () => deps.startCombat?.('mini_boss'),
    boss: () => deps.startCombat?.('boss'),
    event: () => deps.triggerRandomEvent?.(),
    shop: () => deps.showShop?.(),
    rest: () => deps.showRestSite?.(),
  };

  nodeHandlers[nodeType]?.();
}

export function presentNodeTransition(result, deps = {}, options = {}) {
  if (!result?.ok) return result;

  const schedule = options.schedule || ((callback, delay) => setTimeout(callback, delay));
  const hideOverlay = options.hideOverlay || hideNodeOverlay;
  const playFootstep = options.playFootstep || (() => {});
  const unlockNodeMovement = options.unlockNodeMovement || (() => {});

  hideOverlay(deps.doc);
  playFootstep(deps.audioEngine);
  deps.renderMinimap?.();
  deps.updateUI?.();

  schedule(() => {
    try {
      if (!result.isCombatNode) deps.updateNextNodes?.();
      runNodeAction(result.node?.type, deps);
    } finally {
      unlockNodeMovement();
    }
  }, 300);

  return result;
}
