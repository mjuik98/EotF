import { createNodeHandoffRuntime } from '../application/create_node_handoff_runtime.js';

function hideNodeOverlay(doc) {
  const overlay = doc?.getElementById?.('nodeCardOverlay');
  if (!overlay) return;
  overlay.style.pointerEvents = 'none';
  overlay.style.display = 'none';
}

function runNodeAction(nodeType, deps) {
  const nodeHandoff = createNodeHandoffRuntime(deps);
  const nodeHandlers = {
    combat: () => nodeHandoff.startCombat('normal'),
    elite: () => nodeHandoff.startCombat('normal'),
    mini_boss: () => nodeHandoff.startCombat('mini_boss'),
    boss: () => nodeHandoff.startCombat('boss'),
    event: () => nodeHandoff.openEvent(),
    shop: () => nodeHandoff.openShop(),
    rest: () => nodeHandoff.openRestSite(),
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
