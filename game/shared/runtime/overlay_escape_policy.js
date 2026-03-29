import { Logger } from '../../utils/logger.js';

function resolveLogger(deps = {}) {
  const logger = deps.logger || Logger;
  return typeof logger?.child === 'function'
    ? logger.child('OverlayEscapePolicy')
    : logger;
}

function swallowEscapeEvent(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  event?.stopImmediatePropagation?.();
}

function resolvePauseHandler(deps = {}) {
  if (typeof deps.togglePause === 'function') {
    return deps.togglePause;
  }
  if (typeof deps?.win?.HelpPauseUI?.togglePause === 'function') {
    return deps.win.HelpPauseUI.togglePause.bind(deps.win.HelpPauseUI);
  }
  return null;
}

export function routeOverlayEscapeToPause(event, {
  deps = {},
  overlayName = 'overlay',
} = {}) {
  if (event?.key !== 'Escape') return false;

  const logger = resolveLogger(deps);
  const pauseHandler = resolvePauseHandler(deps);
  if (!pauseHandler) {
    logger.warn?.(`[OverlayEscape] ${overlayName} missing pause handler.`);
    return false;
  }

  swallowEscapeEvent(event);
  logger.debug?.(`[OverlayEscape] ${overlayName} -> pause`);
  pauseHandler(deps);
  return true;
}
