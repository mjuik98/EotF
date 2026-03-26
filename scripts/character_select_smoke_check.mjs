import { createServer } from 'node:http';
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const workspaceRoot = process.cwd();
const distDir = path.join(workspaceRoot, 'dist');
const outDir = path.join(workspaceRoot, 'output', 'web-game', 'character-select-level-xp-smoke');
const snapshotDir = path.join(outDir, `.dist-snapshot-${process.pid}`);

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

function createDistServer(rootDir) {
  return createServer(async (req, res) => {
    try {
      const rawPath = req.url === '/' ? '/index.html' : (req.url || '/index.html');
      const pathname = decodeURIComponent(rawPath.split('?')[0]);
      const filePath = path.resolve(rootDir, `.${pathname}`);
      if (!filePath.startsWith(rootDir)) {
        res.writeHead(403).end('Forbidden');
        return;
      }

      const data = await fs.readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end(data);
    } catch (error) {
      res.writeHead(error?.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(error?.code === 'ENOENT' ? 'Not found' : String(error?.message || error));
    }
  });
}

async function captureGameplayDebugState(page, capturedErrors = []) {
  return page.evaluate((errors) => ({
    activeScreens: Array.from(document.querySelectorAll('.screen.active')).map((el) => el.id),
    introOverlayVisible: Boolean(document.getElementById('introCinematicOverlay')),
    preludeOverlayVisible: Boolean(document.getElementById('titleRunPreludeOverlay')),
    characterSelectDisplay: document.getElementById('charSelectSubScreen')?.style?.display || null,
    titleDisplay: document.getElementById('mainTitleSubScreen')?.style?.display || null,
    gameCanvasRect: (() => {
      const rect = document.getElementById('gameCanvas')?.getBoundingClientRect?.();
      return rect ? { width: rect.width, height: rect.height } : null;
    })(),
    runtimeSnapshot: (() => {
      try {
        const raw = globalThis.render_game_to_text?.();
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })(),
    errors,
  }), capturedErrors);
}

async function advanceRuntimeTime(page, ms) {
  await page.evaluate(async (duration) => {
    if (typeof globalThis.advanceTime === 'function') {
      await globalThis.advanceTime(duration);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, duration));
  }, ms);
}

async function advanceRunStartOverlays(page) {
  const introOverlay = page.locator('#introCinematicOverlay');
  await introOverlay.waitFor({ state: 'visible', timeout: 2000 })
    .then(() => introOverlay.click({ timeout: 5000 }))
    .catch(() => {});

  const storyContinueButton = page.locator('#storyContinueBtn');
  let storyFragmentSkipped = false;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const gameScreenActive = await page.evaluate(
      () => Boolean(document.getElementById('gameScreen')?.classList.contains('active')),
    );
    if (gameScreenActive) {
      return { storyFragmentSkipped };
    }

    const canContinueStory = await storyContinueButton.isVisible().catch(() => false);
    if (canContinueStory) {
      storyFragmentSkipped = true;
      await storyContinueButton.click({ timeout: 5000 });
    }

    await page.waitForTimeout(500);
  }

  return { storyFragmentSkipped };
}

async function findCombatHoverCardWithMechanicTrigger(page) {
  const handCards = page.locator('#combatHandCards .card');
  const handCardCount = await handCards.count();
  for (let index = 0; index < handCardCount; index += 1) {
    await handCards.nth(index).hover();
    await page.waitForSelector('#handCardCloneLayer .card-clone-visible', {
      state: 'visible',
      timeout: 8000,
    });
    await page.waitForTimeout(180);
    const hasMechanicTrigger = await page.evaluate(
      () => Boolean(document.querySelector('#handCardCloneLayer .card-clone-visible .card-hover-mechanic-trigger')),
    );
    if (hasMechanicTrigger) {
      return index + 1;
    }
  }

  throw new Error(`No combat hand card exposed a hover mechanic trigger across ${handCardCount} hovered cards.`);
}

await fs.mkdir(outDir, { recursive: true });
if (!process.env.SMOKE_URL) {
  await fs.rm(snapshotDir, { recursive: true, force: true });
  await fs.cp(distDir, snapshotDir, { recursive: true });
}
const server = process.env.SMOKE_URL ? null : createDistServer(snapshotDir);
let browser = null;

try {
  let appUrl = process.env.SMOKE_URL || null;
  if (server) {
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const { port } = server.address();
    appUrl = `http://127.0.0.1:${port}`;
  }

  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(`pageerror:${error.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console:${msg.text()}`);
  });
  await page.goto(appUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.click('#mainStartBtn');
  await page.waitForSelector('#btnCfm', { state: 'visible', timeout: 10000 });
  await page.waitForSelector('#charStage', { timeout: 10000 });
  await page.waitForFunction(() => {
    const required = ['header', 'mainRow', 'buttonsRow'];
    return required.every((id) => {
      const element = document.getElementById(id);
      if (!element || !element.classList.contains('mounted')) return false;
      const styles = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return Number(styles.opacity) >= 0.95 && rect.width > 0 && rect.height > 0;
    });
  }, { timeout: 10000 });
  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  });
  await page.waitForTimeout(250);
  const payload = await page.evaluate((capturedErrors) => {
    const level = document.querySelector('#cardLevelBadge .csm-card-level');
    const cardName = document.querySelector('#cardName');
    const confirmButton = document.querySelector('#buttonsRow #btnCfm');
    const activeInfoPane = document.querySelector('#infoPanel .char-info-pane.is-active');
    const levelRect = level?.getBoundingClientRect?.() || null;
    const nameRect = cardName?.getBoundingClientRect?.() || null;
    return {
      dotCount: document.querySelectorAll('#dotsRow .dot').length,
      infoTabCount: document.querySelectorAll('#infoPanel .char-info-tab').length,
      infoBlockCount: document.querySelectorAll('#infoPanel .char-info-block').length,
      hasActiveInfoPane: Boolean(activeInfoPane),
      inspectorExists: Boolean(document.getElementById('charInspector')),
      confirmText: confirmButton?.textContent?.trim() || null,
      confirmButtonVisible: Boolean(confirmButton?.getBoundingClientRect?.().width),
      levelText: level?.textContent?.trim() || null,
      levelAboveName: Boolean(levelRect && nameRect && levelRect.bottom <= nameRect.top + 2),
      levelBottom: levelRect?.bottom ?? null,
      nameTop: nameRect?.top ?? null,
      introMountedCount: document.querySelectorAll('.intro.mounted').length,
      errors: capturedErrors,
    };
  }, errors);
  if (!(payload.errors.length === 0)) {
    throw new Error(`character-select smoke saw browser errors: ${payload.errors.join(' | ')}`);
  }
  await page.click('#btnCfm');
  await page.waitForSelector('#btnRealStart', { state: 'visible', timeout: 10000 });
  await page.click('#btnRealStart');
  const startOverlayPayload = await advanceRunStartOverlays(page);
  try {
    await page.waitForSelector('#gameScreen.active', { state: 'attached', timeout: 30000 });
  } catch (error) {
    const debugState = await captureGameplayDebugState(page, errors);
    throw new Error(`${error.message}\nDebug state: ${JSON.stringify(debugState)}`);
  }
  await page.waitForSelector('#gameCanvas', { state: 'attached', timeout: 10000 });
  await page.waitForFunction(() => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return false;
    const rect = canvas.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }, { timeout: 10000 });
  const gameplayPayload = await page.evaluate((overlayPayload) => {
    const runtimeSnapshot = (() => {
      try {
        const raw = globalThis.render_game_to_text?.();
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })();
    const canvas = document.getElementById('gameCanvas');
    const rect = canvas?.getBoundingClientRect?.() || null;
    return {
      ...overlayPayload,
      gameplayScreenActive: Boolean(document.getElementById('gameScreen')?.classList.contains('active')),
      characterSelectHidden: document.getElementById('charSelectSubScreen')?.style?.display === 'none',
      gameCanvasReady: Boolean(rect && rect.width > 0 && rect.height > 0),
      gameCanvasWidth: rect?.width ?? null,
      gameCanvasHeight: rect?.height ?? null,
      hudOverlayExists: Boolean(document.getElementById('hudOverlay')),
      nodeCardCount: document.querySelectorAll('.node-card').length,
      runtimeMapNodeCardCount: runtimeSnapshot?.map?.surface?.nodeCardCount ?? null,
      runtimeReachableNodeCount: runtimeSnapshot?.map?.accessibleNodeCount ?? null,
    };
  }, startOverlayPayload);
  await page.waitForSelector('.node-card', { state: 'visible', timeout: 15000 });
  await page.click('.node-card');
  try {
    await page.waitForSelector('#combatOverlay.active', { state: 'attached', timeout: 15000 });
  } catch (error) {
    const debugState = await captureGameplayDebugState(page, errors);
    throw new Error(`${error.message}\nCombat debug state: ${JSON.stringify(debugState)}`);
  }
  await advanceRuntimeTime(page, 1200);
  await page.waitForFunction(() => {
    const cardCount = document.querySelectorAll('#combatHandCards .card').length;
    const energyLabel = document.getElementById('combatEnergyText')?.textContent?.trim() || '';
    return cardCount > 0 && energyLabel.length > 0;
  }, { timeout: 10000 });
  const hoverCardIndex = await findCombatHoverCardWithMechanicTrigger(page);
  await page.hover('#handCardCloneLayer .card-hover-mechanic-trigger');
  await page.waitForTimeout(120);
  await page.focus('#handCardCloneLayer .card-hover-mechanic-trigger');
  await page.waitForFunction(() => {
    const clone = document.querySelector('#handCardCloneLayer .card-clone-visible');
    return clone?.dataset?.keywordPanelOpen === 'true';
  }, { timeout: 5000 });
  const preEndTurnHoverPayload = await page.evaluate(() => {
    const runtimeSnapshot = (() => {
      try {
        const raw = globalThis.render_game_to_text?.();
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })();
    const hoverClone = document.querySelector('#handCardCloneLayer .card-clone-visible');
    return {
      combatHoverKeywordPanelOpenBeforeEndTurn: hoverClone?.dataset?.keywordPanelOpen === 'true',
      runtimeCombatHoverKeywordPanelOpenBeforeEndTurn: runtimeSnapshot?.combat?.surface?.hoverKeywordPanelOpen ?? null,
    };
  });
  await page.click('.action-btn-end');
  await page.waitForFunction(() => {
    try {
      const raw = globalThis.render_game_to_text?.();
      const runtimeSnapshot = raw ? JSON.parse(raw) : null;
      return runtimeSnapshot?.combat?.playerTurn === false
        && (document.getElementById('turnIndicator')?.textContent?.trim() || null) === '적의 턴';
    } catch {
      return false;
    }
  }, { timeout: 5000 });
  const combatPayload = await page.evaluate(({ hoverCardIndex: selectedHoverCardIndex, preEndTurnHoverPayload: capturedPreEndTurnHoverPayload }) => {
    const runtimeSnapshot = (() => {
      try {
        const raw = globalThis.render_game_to_text?.();
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })();
    const endTurnButton = document.querySelector('.action-btn-end');
    const hoverClone = document.querySelector('#handCardCloneLayer .card-clone-visible');
    const hoverCloneCost = hoverClone?.querySelector('.card-cost');
    const keywordPanel = hoverClone?.querySelector('.card-clone-keyword-panel');
    const keywordTrigger = hoverClone?.querySelector('.card-hover-mechanic-trigger');
    return {
      combatOverlayActive: Boolean(document.getElementById('combatOverlay')?.classList.contains('active')),
      combatHandCardCount: document.querySelectorAll('#combatHandCards .card').length,
      combatEnergyText: document.getElementById('combatEnergyText')?.textContent?.trim() || null,
      turnIndicatorText: document.getElementById('turnIndicator')?.textContent?.trim() || null,
      endTurnDisabled: !!endTurnButton?.disabled,
      combatHoverCardIndex: selectedHoverCardIndex,
      combatHoverCloneVisible: !!hoverClone,
      combatHoverCloneCostClass: hoverCloneCost?.className || null,
      ...capturedPreEndTurnHoverPayload,
      combatHoverKeywordPanelOpen: hoverClone?.dataset?.keywordPanelOpen === 'true',
      combatHoverKeywordPlacement: hoverClone?.dataset?.keywordPlacement || null,
      combatHoverMechanicText: keywordTrigger?.textContent?.trim() || null,
      combatHoverKeywordTitle: keywordPanel?.querySelector('.card-clone-keyword-body-title')?.textContent?.trim() || null,
      combatTurnIndicatorAfterEndTurn: document.getElementById('turnIndicator')?.textContent?.trim() || null,
      combatEndTurnDisabledAfterEndTurn: !!endTurnButton?.disabled,
      runtimeScreen: runtimeSnapshot?.screen ?? null,
      runtimeCombatActive: !!runtimeSnapshot?.combat?.active,
      runtimeCombatPlayerTurnAfterEndTurn: runtimeSnapshot?.combat?.playerTurn ?? null,
      runtimeCombatHandCount: runtimeSnapshot?.combat?.resources?.handCount ?? null,
      runtimeCombatEnergy: runtimeSnapshot?.combat?.resources?.energy ?? null,
      runtimeCombatTurnLabel: runtimeSnapshot?.combat?.ui?.turnLabel ?? null,
      runtimeCombatEndTurnDisabled: runtimeSnapshot?.combat?.ui?.endTurnDisabled ?? null,
      runtimeCombatHoverCloneVisible: runtimeSnapshot?.combat?.surface?.hoverCloneVisible ?? null,
      runtimeCombatHoverKeywordPanelOpen: runtimeSnapshot?.combat?.surface?.hoverKeywordPanelOpen ?? null,
      runtimeCombatHoverKeywordTitle: runtimeSnapshot?.combat?.surface?.hoverKeywordTitle ?? null,
    };
  }, { hoverCardIndex, preEndTurnHoverPayload });
  await page.screenshot({ path: path.join(outDir, 'shot.png') });
  console.log(JSON.stringify({ ...payload, ...gameplayPayload, ...combatPayload }, null, 2));
} finally {
  if (browser) await browser.close();
  if (!process.env.SMOKE_URL) {
    await fs.rm(snapshotDir, { recursive: true, force: true });
  }
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}
