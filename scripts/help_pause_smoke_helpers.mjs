async function isVisible(page, selector) {
  return page.evaluate((targetSelector) => {
    const element = document.querySelector(targetSelector);
    if (!element) return false;
    const style = getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    if (targetSelector === '#helpMenu') return true;
    return Number.parseFloat(style.opacity || '1') > 0 || style.pointerEvents !== 'none';
  }, selector);
}

async function openPauseMenuViaRuntime(page) {
  return page.evaluate(() => {
    const win = window;
    const doc = document;
    const runtimeDeps = typeof win.GAME?.getRunDeps === 'function'
      ? (win.GAME.getRunDeps() || {})
      : {};
    const deps = {
      ...runtimeDeps,
      gs: runtimeDeps.gs || win.GS || null,
      doc,
      win,
      showDeckView: runtimeDeps.showDeckView || win.showDeckView,
      closeDeckView: runtimeDeps.closeDeckView || win.closeDeckView,
      openCodex: runtimeDeps.openCodex || win.openCodex,
      closeCodex: runtimeDeps.closeCodex || win.closeCodex,
      openSettings: runtimeDeps.openSettings || win.openSettings,
      closeSettings: runtimeDeps.closeSettings || win.closeSettings,
      closeRunSettings: runtimeDeps.closeRunSettings || win.closeRunSettings,
      returnToTitleFromPause: runtimeDeps.returnToTitleFromPause || win.returnToTitleFromPause,
    };
    if (typeof win.HelpPauseUI?.togglePause !== 'function') return false;
    win.HelpPauseUI.togglePause(deps);
    return true;
  });
}

export async function ensurePauseMenuVisible(
  page,
  timeout = 10000,
  { preferEscape = false } = {},
) {
  const waitVisible = async () => page.waitForSelector('#pauseMenu', {
    state: 'visible',
    timeout,
  }).then(() => true).catch(() => false);

  if (!preferEscape) {
    const openedViaRuntime = await openPauseMenuViaRuntime(page);
    if (openedViaRuntime && await waitVisible()) return;
  }

  await page.keyboard.press('Escape');
  if (await waitVisible()) return;

  if (preferEscape) {
    const openedViaRuntime = await openPauseMenuViaRuntime(page);
    if (openedViaRuntime && await waitVisible()) return;
  }

  const debugState = await page.evaluate(() => ({
    currentScreen: window.GS?.currentScreen || null,
    combatActive: Boolean(window.GS?.combat?.active),
    pauseMenuExists: Boolean(document.getElementById('pauseMenu')),
    liveHelpPauseToggle: typeof window.HelpPauseUI?.togglePause,
    liveRunDeps: typeof window.GAME?.getRunDeps,
  }));

  throw new Error(`pause menu did not open: ${JSON.stringify(debugState)}`);
}

async function closeSurfaceViaRuntime(page, surfaceSelector) {
  return page.evaluate((selector) => {
    const win = window;
    const doc = document;
    const runtimeDeps = typeof win.GAME?.getRunDeps === 'function'
      ? (win.GAME.getRunDeps() || {})
      : {};
    const deps = {
      ...runtimeDeps,
      gs: runtimeDeps.gs || win.GS || null,
      doc,
      win,
      showDeckView: runtimeDeps.showDeckView || win.showDeckView,
      closeDeckView: runtimeDeps.closeDeckView || win.closeDeckView,
      openCodex: runtimeDeps.openCodex || win.openCodex,
      closeCodex: runtimeDeps.closeCodex || win.closeCodex,
      openSettings: runtimeDeps.openSettings || win.openSettings,
      closeSettings: runtimeDeps.closeSettings || win.closeSettings,
      closeRunSettings: runtimeDeps.closeRunSettings || win.closeRunSettings,
      returnToTitleFromPause: runtimeDeps.returnToTitleFromPause || win.returnToTitleFromPause,
    };
    if (selector === '#helpMenu') {
      win.HelpPauseUI?.toggleHelp?.(deps);
      return true;
    }
    if (selector === '#pauseMenu') {
      win.HelpPauseUI?.togglePause?.(deps);
      return true;
    }
    if (selector === '#codexModal') {
      deps.closeCodex?.();
      return true;
    }
    if (selector === '#settingsModal') {
      deps.closeSettings?.();
      return true;
    }
    if (selector === '#deckViewModal') {
      deps.closeDeckView?.();
      return true;
    }
    if (selector === '#runSettingsModal') {
      deps.closeRunSettings?.();
      return true;
    }
    return false;
  }, surfaceSelector);
}

export async function closeSurfaceWithEscapeFallback(
  page,
  surfaceSelector,
  timeout = 10000,
  { preferEscape = false } = {},
) {
  const waitClosed = async () => page.waitForFunction((selector) => {
    const surface = document.querySelector(selector);
    if (!surface) return true;
    const style = getComputedStyle(surface);
    if (selector === '#helpMenu') {
      return style.display === 'none' || !document.body.contains(surface);
    }
    return style.display === 'none'
      || style.visibility === 'hidden'
      || Number.parseFloat(style.opacity || '1') <= 0
      || !document.body.contains(surface);
  }, surfaceSelector, { timeout }).then(() => true).catch(() => false);

  if (!preferEscape) {
    const closedViaRuntime = await closeSurfaceViaRuntime(page, surfaceSelector);
    if (closedViaRuntime && await waitClosed()) return;
  }

  await page.keyboard.press('Escape');
  if (await waitClosed()) return;

  if (preferEscape) {
    const closedViaRuntime = await closeSurfaceViaRuntime(page, surfaceSelector);
    if (closedViaRuntime && await waitClosed()) return;
  }

  const stillVisible = await isVisible(page, surfaceSelector);
  throw new Error(`surface did not close: ${JSON.stringify({ surfaceSelector, stillVisible })}`);
}
