import { completeTitleReturn } from './title_return_actions.js';

function resolveCompleteTitleReturn(deps = {}) {
  if (typeof deps.completeTitleReturn === 'function') {
    return () => deps.completeTitleReturn();
  }

  return () => completeTitleReturn(deps);
}

export function applyMetaFragmentSelection(effect, meta = {}) {
  if (!meta?.inscriptions) return false;

  switch (effect) {
    case 'echo_boost':
      meta.inscriptions.echo_boost = true;
      break;
    case 'resilience':
      meta.inscriptions.resilience = true;
      break;
    case 'fortune':
      meta.inscriptions.fortune = true;
      break;
    default:
      return false;
  }

  meta.echoFragments -= 1;
  return true;
}

export function selectMetaFragmentAction(
  effect,
  deps = {},
  {
    cleanup = null,
    delayMs = 500,
    setTimeoutFn = setTimeout,
  } = {},
) {
  const gs = deps?.gs;
  if (!gs?.meta) return false;

  cleanup?.();
  if (!applyMetaFragmentSelection(effect, gs.meta)) {
    return false;
  }

  setTimeoutFn(() => {
    resolveCompleteTitleReturn(deps)();
  }, delayMs);
  return true;
}

export function restartFromEndingAction(deps = {}, { cleanup = null } = {}) {
  cleanup?.();
  resolveCompleteTitleReturn(deps)();
}
