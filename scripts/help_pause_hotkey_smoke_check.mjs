import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  closeStaticAssetServer,
  resolveSmokeAppUrl,
} from './browser_smoke_support.mjs';
import {
  closeSurfaceWithEscapeFallback,
  ensurePauseMenuVisible,
} from './help_pause_smoke_helpers.mjs';

const workspaceRoot = process.cwd();
const distDir = process.env.SMOKE_DIST_DIR || path.join(workspaceRoot, 'dist');
const outDir = process.env.SMOKE_OUT_DIR || path.join(workspaceRoot, 'output', 'web-game', 'help-pause-hotkey-smoke');

async function appendTrace(message) {
  await fs.appendFile(path.join(outDir, 'trace.log'), `${new Date().toISOString()} ${message}\n`);
}

async function clickIfVisible(page, selector, timeout = 4000) {
  const handle = await page.waitForSelector(selector, { timeout, state: 'visible' }).catch(() => null);
  if (!handle) return false;
  await handle.click();
  return true;
}

async function enterRunFlow(page) {
  await page.click('#mainStartBtn');
  await page.waitForSelector('#btnCfm', { state: 'visible', timeout: 10000 });
  await page.click('#btnCfm');
  await page.waitForSelector('#btnRealStart', { state: 'visible', timeout: 10000 });
  await page.click('#btnRealStart');
  await clickIfVisible(page, '#introCinematicOverlay', 10000);
  await page.waitForSelector('#storyContinueBtn', { state: 'visible', timeout: 10000 });
  await page.click('#storyContinueBtn');
  await page.waitForSelector('#nodeCardOverlay', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(250);
}

async function enterCombatFromRun(page) {
  await page.click('.node-card');
  await page.waitForSelector('#combatOverlay.active', { state: 'attached', timeout: 15000 });
  await page.waitForTimeout(1200);
}

async function openPauseSubpanel(page, buttonName, surfaceSelector) {
  await ensurePauseMenuVisible(page, 10000, { preferEscape: true });
  await page.locator('#pauseMenu').getByRole('button', { name: buttonName, exact: true }).click();
  const opened = await page.waitForSelector(surfaceSelector, { state: 'visible', timeout: 1500 })
    .then(() => true)
    .catch(() => false);
  if (opened) return;

  await page.evaluate((selector) => {
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
      openCodex: runtimeDeps.openCodex || win.openCodex,
      openSettings: runtimeDeps.openSettings || win.openSettings,
    };

    if (selector === '#codexModal') {
      deps.openCodex?.();
      return;
    }
    if (selector === '#settingsModal') {
      deps.openSettings?.();
      return;
    }
    if (selector === '#helpMenu') {
      win.toggleHelp?.();
      win.HelpPauseUI?.toggleHelp?.(deps);
    }
  }, surfaceSelector);
  await page.waitForSelector(surfaceSelector, { state: 'visible', timeout: 10000 });
}

async function closeActiveSurface(page, surfaceSelector) {
  await closeSurfaceWithEscapeFallback(page, surfaceSelector);
}

async function captureOverlayFrameState(page, surfaceSelector, {
  entrySelector = '',
  titleSelector = '.gm-modal-title',
  subtitleSelector = '.gm-modal-subtitle',
} = {}) {
  return page.evaluate(({ selector, entrySel, titleSel, subtitleSel }) => {
    const overlay = document.querySelector(selector);
    const panel = overlay?.querySelector('.gm-modal-panel') || null;
    const actions = overlay?.querySelectorAll('.action-btn') || [];
    const entries = entrySel ? overlay?.querySelectorAll(entrySel) || [] : [];
    return {
      overlayClassName: document.getElementById(overlay?.id || '')?.className || '',
      panelClassName: panel?.className || '',
      titleText: overlay?.querySelector(titleSel)?.textContent?.trim() || null,
      subtitleText: overlay?.querySelector(subtitleSel)?.textContent?.trim() || null,
      actionCount: actions.length,
      entryCount: entries.length,
      usesSharedFrame: Boolean(
        overlay
        && overlay.classList.contains('hp-overlay')
        && panel
        && panel.classList.contains('gm-modal-panel')
      ),
    };
  }, {
    selector: surfaceSelector,
    entrySel: entrySelector,
    titleSel: titleSelector,
    subtitleSel: subtitleSelector,
  });
}

async function assertBlockedShortcuts(page, surfaceSelector) {
  await page.keyboard.press('Tab');
  await page.waitForTimeout(120);
  await page.keyboard.press('KeyM');
  await page.waitForTimeout(120);

  return page.evaluate((selector) => {
    const isVisible = (element) => {
      if (!element) return false;
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      if (element.id === 'helpMenu') return true;
      return Number.parseFloat(style.opacity || '1') > 0 || style.pointerEvents !== 'none';
    };

    const activeSurface = document.querySelector(selector);
    const deckView = document.getElementById('deckViewModal');
    const fullMap = document.getElementById('fullMapOverlay');
    return {
      surfaceStillOpen: isVisible(activeSurface),
      deckOpened: isVisible(deckView),
      fullMapOpened: isVisible(fullMap),
    };
  }, surfaceSelector);
}

async function seedCombatHotkeyScenario(page) {
  return page.evaluate(() => {
    const gs = window.GS || window.GameState;
    const enemy = gs?.combat?.enemies?.[0];
    if (!gs?.player || !enemy) {
      throw new Error('combat hotkey smoke setup missing combat state');
    }

    gs.player.hand = ['strike', 'resonance', 'defend'];
    gs.player.drawPile = ['heavy_blow', 'double_slash'];
    gs.player.discardPile = [];
    gs.player.graveyard = [];
    gs.player.energy = 2;
    gs.player.echo = 80;
    gs.combat.turn = 1;
    gs.combat.playerTurn = true;
    enemy.hp = Math.max(24, Number(enemy.maxHp || 24));
    enemy.maxHp = Math.max(24, Number(enemy.maxHp || 24));
    enemy.block = 0;
    enemy.shield = 0;

    if (typeof window.renderCombatCards === 'function') window.renderCombatCards();
    if (typeof window.renderCombatEnemies === 'function') window.renderCombatEnemies();
    if (typeof window.updateUI === 'function') {
      window.updateUI();
    } else if (typeof window.doUpdateUI === 'function') {
      window.doUpdateUI();
    }

    return true;
  });
}

async function captureCombatHotkeySnapshot(page, surfaceSelector) {
  return page.evaluate((selector) => {
    const gs = window.GS || window.GameState;
    const isVisible = (element) => {
      if (!element) return false;
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      if (element.id === 'helpMenu') return true;
      return Number.parseFloat(style.opacity || '1') > 0 || style.pointerEvents !== 'none';
    };

    return {
      combatOverlayActive: !!document.querySelector('#combatOverlay.active'),
      surfaceVisible: isVisible(document.querySelector(selector)),
      pauseVisible: isVisible(document.getElementById('pauseMenu')),
      hand: Array.isArray(gs?.player?.hand) ? [...gs.player.hand] : [],
      drawPileCount: Array.isArray(gs?.player?.drawPile) ? gs.player.drawPile.length : 0,
      discardPileCount: Array.isArray(gs?.player?.discardPile) ? gs.player.discardPile.length : 0,
      graveyardCount: Array.isArray(gs?.player?.graveyard) ? gs.player.graveyard.length : 0,
      energy: Number(gs?.player?.energy || 0),
      echo: Number(gs?.player?.echo || 0),
      playerTurn: Boolean(gs?.combat?.playerTurn),
      enemyHp: Array.isArray(gs?.combat?.enemies) ? gs.combat.enemies.map((enemy) => Number(enemy?.hp || 0)) : [],
    };
  }, surfaceSelector);
}

async function assertBlockedCombatHotkeys(page, surfaceSelector) {
  const before = await captureCombatHotkeySnapshot(page, surfaceSelector);

  await page.keyboard.press('Tab');
  await page.waitForTimeout(120);
  await page.keyboard.press('KeyQ');
  await page.waitForTimeout(120);
  await page.keyboard.press('KeyE');
  await page.waitForTimeout(120);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(120);
  await page.keyboard.press('1');
  await page.waitForTimeout(160);

  const after = await captureCombatHotkeySnapshot(page, surfaceSelector);
  return {
    surfaceStillOpen: after.surfaceVisible,
    combatOverlayActive: after.combatOverlayActive,
    stateUnchanged: JSON.stringify(after) === JSON.stringify(before),
  };
}

async function assertEscapePriority(page, surfaceSelector) {
  await closeSurfaceWithEscapeFallback(page, surfaceSelector, 10000, { preferEscape: true });
  const afterFirstEscape = await captureCombatHotkeySnapshot(page, surfaceSelector);

  await ensurePauseMenuVisible(page);
  const afterSecondEscape = await captureCombatHotkeySnapshot(page, surfaceSelector);

  return {
    firstEscapeClosedSurface: !afterFirstEscape.surfaceVisible,
    firstEscapeKeptPauseClosed: !afterFirstEscape.pauseVisible,
    combatOverlayStayedActive: afterFirstEscape.combatOverlayActive,
    secondEscapeOpenedPause: afterSecondEscape.pauseVisible,
  };
}

async function openVisibleCodexDetailPopup(page) {
  const opened = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#codexModal .cx-card:not(.is-unknown)'));
    const target = cards.find((entry) => {
      const style = getComputedStyle(entry);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
    target?.click?.();
    return Boolean(target);
  });
  if (!opened) throw new Error('codex detail smoke setup could not find a visible discovered codex card');
  await page.waitForSelector('#cxDetailPopup.open', { state: 'visible', timeout: 10000 });
}

async function assertNestedCodexEscapePriority(page) {
  const readNestedState = () => page.evaluate(() => {
    const isVisible = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return false;
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      return Number.parseFloat(style.opacity || '1') > 0 || style.pointerEvents !== 'none';
    };

    return {
      detailOpen: isVisible('#cxDetailPopup'),
      codexOpen: isVisible('#codexModal'),
      pauseOpen: isVisible('#pauseMenu'),
    };
  });

  await openVisibleCodexDetailPopup(page);
  const beforeEscape = await readNestedState();
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.getElementById('cxDetailPopup')?.classList?.contains?.('open'), null, { timeout: 10000 });
  const afterFirstEscape = await readNestedState();

  await page.keyboard.press('Escape');
  await page.waitForFunction((pauseWasOpen) => {
    const isVisible = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return false;
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      return Number.parseFloat(style.opacity || '1') > 0 || style.pointerEvents !== 'none';
    };

    return !isVisible('#codexModal') && isVisible('#pauseMenu') === pauseWasOpen;
  }, beforeEscape.pauseOpen, { timeout: 10000 });
  const afterSecondEscape = await readNestedState();

  return {
    firstEscapeClosedDetailOnly: !afterFirstEscape.detailOpen
      && afterFirstEscape.codexOpen
      && afterFirstEscape.pauseOpen === beforeEscape.pauseOpen,
    secondEscapeClosedCodexOnly: !afterSecondEscape.codexOpen
      && afterSecondEscape.pauseOpen === beforeEscape.pauseOpen,
  };
}

await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(path.join(outDir, 'trace.log'), '');
const { appUrl, server } = await resolveSmokeAppUrl({
  smokeUrl: process.env.SMOKE_URL || '',
  distDir,
});
let browser = null;
let failure = null;

try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(`pageerror:${error.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console:${msg.text()}`);
  });

  await page.goto(appUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await appendTrace('loaded app');
  await enterRunFlow(page);
  await appendTrace('entered run flow');
  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  });
  await appendTrace('fonts ready');

  await ensurePauseMenuVisible(page);
  await appendTrace('pause visible');
  const pauseFrame = await captureOverlayFrameState(page, '#pauseMenu', {
    entrySelector: '.hp-menu-actions .action-btn',
  });
  await page.screenshot({ path: path.join(outDir, 'pause-menu.png') });
  await appendTrace('captured pause');
  await closeActiveSurface(page, '#pauseMenu');
  await appendTrace('closed pause');

  await openPauseSubpanel(page, '도감', '#codexModal');
  await appendTrace('opened codex');
  const codexResult = await assertBlockedShortcuts(page, '#codexModal');
  await closeActiveSurface(page, '#codexModal');
  await appendTrace('closed codex');

  await openPauseSubpanel(page, '환경 설정', '#settingsModal');
  await appendTrace('opened settings');
  const settingsResult = await assertBlockedShortcuts(page, '#settingsModal');
  await closeActiveSurface(page, '#settingsModal');
  await appendTrace('closed settings');

  await openPauseSubpanel(page, '컨트롤 안내 (?)', '#helpMenu');
  await appendTrace('opened help');
  const helpFrame = await captureOverlayFrameState(page, '#helpMenu', {
    entrySelector: '.hp-help-grid .hp-kbd-cell',
  });
  await page.screenshot({ path: path.join(outDir, 'help-menu.png') });
  await appendTrace('captured help');
  const helpResult = await assertBlockedShortcuts(page, '#helpMenu');
  await closeActiveSurface(page, '#helpMenu');
  await appendTrace('closed help');

  await enterCombatFromRun(page);
  await appendTrace('entered combat');
  await seedCombatHotkeyScenario(page);
  await appendTrace('seeded combat');

  await openPauseSubpanel(page, '도감', '#codexModal');
  await appendTrace('opened combat codex');
  const combatCodexResult = await assertBlockedCombatHotkeys(page, '#codexModal');
  await appendTrace('asserted combat codex');
  await closeActiveSurface(page, '#codexModal');
  await appendTrace('closed combat codex after blocked hotkeys');
  await openPauseSubpanel(page, '도감', '#codexModal');
  await appendTrace('reopened combat codex for nested escape');
  const combatNestedCodexEscapeResult = await assertNestedCodexEscapePriority(page);
  await appendTrace('asserted nested codex escape priority');
  await openPauseSubpanel(page, '도감', '#codexModal');
  await appendTrace('reopened combat codex');
  const combatEscapeResult = await assertEscapePriority(page, '#codexModal');
  await appendTrace('asserted escape priority');

  await page.screenshot({ path: path.join(outDir, 'shot.png') });
  await appendTrace('captured final shot');
  const result = {
    codexBlocksShortcuts: codexResult.surfaceStillOpen && !codexResult.deckOpened && !codexResult.fullMapOpened,
    settingsBlocksShortcuts: settingsResult.surfaceStillOpen && !settingsResult.deckOpened && !settingsResult.fullMapOpened,
    helpBlocksShortcuts: helpResult.surfaceStillOpen && !helpResult.deckOpened && !helpResult.fullMapOpened,
    pauseUsesSharedFrame: pauseFrame.usesSharedFrame && pauseFrame.overlayClassName.includes('hp-overlay-pause'),
    helpUsesSharedFrame: helpFrame.usesSharedFrame && helpFrame.overlayClassName.includes('hp-overlay-help'),
    pauseActionCount: pauseFrame.actionCount,
    helpEntryCount: helpFrame.entryCount,
    combatCodexBlocksHotkeys: combatCodexResult.surfaceStillOpen
      && combatCodexResult.combatOverlayActive
      && combatCodexResult.stateUnchanged,
    nestedCodexEscapeOrder: combatNestedCodexEscapeResult.firstEscapeClosedDetailOnly
      && combatNestedCodexEscapeResult.secondEscapeClosedCodexOnly,
    escapeClosesSurfaceBeforePause: combatEscapeResult.firstEscapeClosedSurface
      && combatEscapeResult.firstEscapeKeptPauseClosed
      && combatEscapeResult.combatOverlayStayedActive
      && combatEscapeResult.secondEscapeOpenedPause,
    errors,
  };
  await fs.writeFile(path.join(outDir, 'result.json'), JSON.stringify(result, null, 2));
  await appendTrace('wrote result');
  console.log(JSON.stringify(result, null, 2));
  const failedChecks = Object.entries(result)
    .filter(([key]) => !['pauseActionCount', 'helpEntryCount', 'errors'].includes(key))
    .filter(([, value]) => value !== true)
    .map(([key]) => key);
  if (failedChecks.length > 0 || errors.length > 0) {
    throw new Error(`help-pause hotkey smoke failed: ${JSON.stringify({ failedChecks, errors })}`);
  }
  process.exit(0);
} catch (error) {
  await appendTrace(`failure: ${error?.stack || error?.message || error}`);
  failure = error;
} finally {
  if (browser) await browser.close();
  await closeStaticAssetServer(server);
}

if (failure) throw failure;
