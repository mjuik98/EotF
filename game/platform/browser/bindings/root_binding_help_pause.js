function getHelpPauseBindingTarget(doc, deps = {}) {
  return doc?.defaultView || deps.win || doc || null;
}

function resolveHelpPauseUI(doc, deps = {}) {
  const win = doc?.defaultView || deps.win || null;
  if (typeof win?.HelpPauseUI?.togglePause === 'function') {
    return win.HelpPauseUI;
  }
  return deps.helpPauseUI || null;
}

function getLiveRunDeps(doc, deps = {}) {
  const win = doc?.defaultView || deps.win || null;
  if (typeof win?.GAME?.getRunDeps === 'function') {
    return win.GAME.getRunDeps() || {};
  }
  return deps.getRunDeps?.() || {};
}

function resolveEscapeHotkeyGs(deps = {}, liveRunDeps = {}) {
  const bootGs = deps.gs || deps.State || deps.state || null;
  if (bootGs?.currentScreen === 'title') return bootGs;
  return liveRunDeps.gs || liveRunDeps.State || liveRunDeps.state || bootGs;
}

function swallowEscapeEvent(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  event?.stopImmediatePropagation?.();
}

function isLiveRunScreen(doc, deps = {}) {
  const gs = deps.gs || deps.State || deps.state || null;
  if (
    gs?.currentScreen === 'game'
    || gs?.currentScreen === 'combat'
    || gs?.currentScreen === 'reward'
    || gs?.combat?.active === true
  ) {
    return true;
  }

  if (doc && typeof doc.getElementById === 'function' && deps.isVisibleModal(doc.getElementById('nodeCardOverlay') || null, doc)) {
    return true;
  }
  return Boolean(doc?.getElementById?.('combatOverlay')?.classList?.contains?.('active'));
}

function handleLiveEscapeHotkey(event, { closeTopEscapeSurface, doc, deps = {}, ui = null } = {}) {
  if (!doc || !ui) return false;
  const currentGs = deps.gs || deps.State || deps.state || null;
  const isTitleScreen = currentGs?.currentScreen === 'title';

  if (closeTopEscapeSurface(event, {
    deps,
    doc,
    scope: 'run',
    swallowEscape: swallowEscapeEvent,
    ui,
  })) return true;

  if (isLiveRunScreen(doc, deps) && !ui.isHelpOpen?.()) {
    swallowEscapeEvent(event);
    ui.togglePause?.(deps);
    return true;
  }

  return isTitleScreen;
}

export function initRootHelpPauseUI(deps, doc, options = {}) {
  const target = getHelpPauseBindingTarget(doc, deps);
  const helpPauseUI = resolveHelpPauseUI(doc, deps);
  if (!helpPauseUI || !doc || !target?.addEventListener) return;

  const {
    closeTopEscapeSurface,
    isEscapeKey,
    isVisibleModal,
  } = options;
  const helpPauseDeps = deps.getHelpPauseDeps();
  const liveHelpPauseDeps = {
    ...helpPauseDeps,
    doc,
    win: doc.defaultView || deps.win || null,
    getDeps: deps.getHelpPauseDeps,
  };
  helpPauseUI.showMobileWarning?.(liveHelpPauseDeps);
  if (target.__rootHelpPauseHotkeysBound) return;
  target.__rootHelpPauseHotkeysBound = true;
  target.addEventListener('keydown', (event) => {
    const liveHelpPauseUI = resolveHelpPauseUI(doc, deps) || helpPauseUI;
    const liveRunDeps = getLiveRunDeps(doc, deps);
    const resolvedHelpPauseDeps = {
      ...(deps.getHelpPauseDeps?.() || {}),
      ...liveRunDeps,
      doc,
      win: doc.defaultView || deps.win || null,
      gs: resolveEscapeHotkeyGs(deps, liveRunDeps),
      isVisibleModal,
    };
    if (isEscapeKey(event)) {
      const escapeHandled = handleLiveEscapeHotkey(event, {
        closeTopEscapeSurface,
        deps: resolvedHelpPauseDeps,
        doc,
        ui: doc?.defaultView?.HelpPauseUI || liveHelpPauseUI,
      });
      if (escapeHandled) return;
    }
    liveHelpPauseUI.handleGlobalHotkey?.(event, {
      deps: resolvedHelpPauseDeps,
      doc,
      ui: liveHelpPauseUI,
    });
  }, true);
}
