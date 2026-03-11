import { canContinueCombatTurn, isCombatResolutionPending } from '../../app/shared/selectors/runtime_state_selectors.js';

export async function waitWhileCombatActive(gs, ms, options = {}) {
  const { sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay)), stepMs = 50 } = options;
  const steps = Math.ceil(ms / stepMs);
  for (let i = 0; i < steps; i += 1) {
    if (!canContinueCombatTurn(gs)) return false;
    await sleep(stepMs);
  }
  return canContinueCombatTurn(gs);
}

export function shouldAbortCombatTurn(gs) {
  return !canContinueCombatTurn(gs) || isCombatResolutionPending(gs);
}

export function dispatchCombatTurnUiAction(result, deps) {
  if (!result?.uiAction) return;
  switch (result.uiAction) {
    case 'updateStatusDisplay': deps.updateStatusDisplay?.(); break;
    case 'updateChainUI': deps.updateChainUI?.(result.value ?? 0); break;
    case 'renderCombatCards': deps.renderCombatCards?.(); break;
    case 'updateUI': deps.updateUI?.(); break;
    case 'shuffleAndRender':
      deps.shuffleArray?.(deps.gs?.player?.hand);
      deps.renderCombatCards?.();
      break;
    default:
      break;
  }
}

function resolveWin(winArg, deps = {}) {
  return winArg || deps.win || { innerWidth: 0 };
}

function resolveDoc(docArg, deps = {}) {
  return docArg || deps.doc || null;
}

export function playEnemyStatusTickEffects(events = [], deps = {}, winArg = null) {
  const win = resolveWin(winArg, deps);
  events.forEach((evt) => {
    const ex = win.innerWidth / 2 + (evt.index - 0.5) * 200;
    deps.showDmgPopup?.(evt.dmg, ex, 200, evt.color);
    if (evt.type === 'poison') {
      deps.particleSystem?.emit?.(ex, 200, { count: 5, color: '#00ff44', size: 2, speed: 2, life: 0.5 });
    } else if (evt.type === 'burning') {
      deps.particleSystem?.emit?.(ex, 180, { count: 6, color: '#ff6600', size: 3, speed: 3, life: 0.4 });
    } else if (evt.type === 'marked_explode') {
      deps.screenShake?.shake?.(10, 0.5);
      deps.particleSystem?.burstEffect?.(ex, 200);
      deps.audioEngine?.playChain?.(4);
    } else if (evt.type === 'doom_explode') {
      deps.showDmgPopup?.(evt.dmg, win.innerWidth / 2, 300, evt.color);
      deps.screenShake?.shake?.(10, 0.5);
    }
  });
}

export async function playEnemyAttackHitUi(index, hit, action, deps = {}, docArg = null, sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))) {
  const doc = resolveDoc(docArg, deps);
  const card = doc?.getElementById?.(`enemy_${index}`);
  if (card) {
    card.classList.add('hit');
    setTimeout(() => card.classList.remove('hit'), 400);
  }
  if (hit.hitIndex < (action.multi || 1) - 1) {
    await sleep(200);
  }
  if (hit.enemyDied) {
    deps.renderCombatEnemies?.();
    return true;
  }
  return false;
}
