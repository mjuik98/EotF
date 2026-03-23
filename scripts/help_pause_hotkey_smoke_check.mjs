import { createServer } from 'node:http';
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const workspaceRoot = process.cwd();
const distDir = path.join(workspaceRoot, 'dist');
const outDir = path.join(workspaceRoot, 'output', 'web-game', 'help-pause-hotkey-smoke');

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
  await page.keyboard.press('Escape');
  await page.waitForSelector('#pauseMenu', { state: 'visible', timeout: 10000 });
  await page.getByRole('button', { name: buttonName }).click();
  await page.waitForSelector(surfaceSelector, { state: 'visible', timeout: 10000 });
}

async function waitForSurfaceClosed(page, surfaceSelector) {
  await page.waitForFunction((selector) => {
    const surface = document.querySelector(selector);
    if (!surface) return true;
    const style = getComputedStyle(surface);
    if (surface.id === 'helpMenu') {
      return style.display === 'none' || !document.body.contains(surface);
    }
    return style.display === 'none'
      || style.visibility === 'hidden'
      || Number.parseFloat(style.opacity || '1') <= 0
      || !document.body.contains(surface);
  }, surfaceSelector, { timeout: 10000 });
}

async function closeActiveSurface(page, surfaceSelector) {
  await page.keyboard.press('Escape');
  await waitForSurfaceClosed(page, surfaceSelector);
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
  await page.keyboard.press('Escape');
  await waitForSurfaceClosed(page, surfaceSelector);
  const afterFirstEscape = await captureCombatHotkeySnapshot(page, surfaceSelector);

  await page.keyboard.press('Escape');
  await page.waitForSelector('#pauseMenu', { state: 'visible', timeout: 10000 });
  const afterSecondEscape = await captureCombatHotkeySnapshot(page, surfaceSelector);

  return {
    firstEscapeClosedSurface: !afterFirstEscape.surfaceVisible,
    firstEscapeKeptPauseClosed: !afterFirstEscape.pauseVisible,
    combatOverlayStayedActive: afterFirstEscape.combatOverlayActive,
    secondEscapeOpenedPause: afterSecondEscape.pauseVisible,
  };
}

await fs.mkdir(outDir, { recursive: true });
const server = process.env.SMOKE_URL ? null : createDistServer(distDir);
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
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(`pageerror:${error.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console:${msg.text()}`);
  });

  await page.goto(appUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await enterRunFlow(page);
  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  });

  await openPauseSubpanel(page, '도감', '#codexModal');
  const codexResult = await assertBlockedShortcuts(page, '#codexModal');
  await closeActiveSurface(page, '#codexModal');

  await openPauseSubpanel(page, '환경 설정', '#settingsModal');
  const settingsResult = await assertBlockedShortcuts(page, '#settingsModal');
  await closeActiveSurface(page, '#settingsModal');

  await openPauseSubpanel(page, '컨트롤 안내 (?)', '#helpMenu');
  const helpResult = await assertBlockedShortcuts(page, '#helpMenu');
  await closeActiveSurface(page, '#helpMenu');

  await enterCombatFromRun(page);
  await seedCombatHotkeyScenario(page);

  await openPauseSubpanel(page, '도감', '#codexModal');
  const combatCodexResult = await assertBlockedCombatHotkeys(page, '#codexModal');
  const combatEscapeResult = await assertEscapePriority(page, '#codexModal');

  await page.screenshot({ path: path.join(outDir, 'shot.png') });
  console.log(JSON.stringify({
    codexBlocksShortcuts: codexResult.surfaceStillOpen && !codexResult.deckOpened && !codexResult.fullMapOpened,
    settingsBlocksShortcuts: settingsResult.surfaceStillOpen && !settingsResult.deckOpened && !settingsResult.fullMapOpened,
    helpBlocksShortcuts: helpResult.surfaceStillOpen && !helpResult.deckOpened && !helpResult.fullMapOpened,
    combatCodexBlocksHotkeys: combatCodexResult.surfaceStillOpen
      && combatCodexResult.combatOverlayActive
      && combatCodexResult.stateUnchanged,
    escapeClosesSurfaceBeforePause: combatEscapeResult.firstEscapeClosedSurface
      && combatEscapeResult.firstEscapeKeptPauseClosed
      && combatEscapeResult.combatOverlayStayedActive
      && combatEscapeResult.secondEscapeOpenedPause,
    errors,
  }, null, 2));
} finally {
  if (browser) await browser.close();
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}
