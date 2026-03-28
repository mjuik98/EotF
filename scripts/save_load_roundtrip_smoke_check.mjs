import fs from 'node:fs/promises';
import path from 'node:path';
import {
  closeStaticAssetServer,
  resetSmokeBrowserStorage,
  resolveSmokeAppUrl,
  runSmokeBrowserSession,
  waitForSmokeFonts,
} from './browser_smoke_support.mjs';
import { ensurePauseMenuVisible } from './help_pause_smoke_helpers.mjs';

const workspaceRoot = process.cwd();
const distDir = process.env.SMOKE_DIST_DIR || path.join(workspaceRoot, 'dist');
const outDir = path.join(workspaceRoot, 'output', 'web-game', 'save-load-roundtrip-smoke');

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

async function waitForContinueReady(page, timeout = 10000) {
  const isReady = async () => page.waitForFunction(() => {
    const continueWrap = document.getElementById('titleContinueWrap');
    const continueButton = document.getElementById('mainContinueBtn');
    if (!continueWrap || !continueButton) return false;
    const wrapStyle = getComputedStyle(continueWrap);
    return wrapStyle.display !== 'none' && !continueButton.disabled;
  }, { timeout }).then(() => true).catch(() => false);

  if (await isReady()) return;

  await page.evaluate(() => {
    const win = window;
    const doc = document;
    const runtimeDeps = typeof win.GAME?.getRunDeps === 'function'
      ? (win.GAME.getRunDeps() || {})
      : {};
    win.GameBootUI?.refreshTitleSaveState?.({
      ...runtimeDeps,
      gs: runtimeDeps.gs || win.GS || null,
      doc,
      win,
    });
  }).catch(() => null);

  await page.waitForFunction(() => {
    const continueWrap = document.getElementById('titleContinueWrap');
    const continueButton = document.getElementById('mainContinueBtn');
    if (!continueWrap || !continueButton) return false;
    const wrapStyle = getComputedStyle(continueWrap);
    return wrapStyle.display !== 'none' && !continueButton.disabled;
  }, { timeout });
}

await fs.mkdir(outDir, { recursive: true });
const { appUrl, server } = await resolveSmokeAppUrl({
  smokeUrl: process.env.SMOKE_URL || '',
  distDir,
});

try {
  await runSmokeBrowserSession({
    appUrl,
    preparePage: async ({ page }) => {
      await resetSmokeBrowserStorage(page);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await enterRunFlow(page);
      await waitForSmokeFonts(page);
    },
    run: async ({ page, errors }) => {
      const beforeReturn = await page.evaluate(() => ({
        currentScreen: window.GS?.currentScreen || null,
        currentRegion: window.GS?.currentRegion ?? null,
        currentFloor: window.GS?.currentFloor ?? null,
        playerClass: window.GS?.player?.class || null,
        playerHp: window.GS?.player?.hp ?? null,
      }));

      await ensurePauseMenuVisible(page);
      await page.getByRole('button', { name: '처음으로' }).click();
      await page.waitForSelector('#returnTitleConfirm', { state: 'visible', timeout: 10000 });
      await page.locator('#returnTitleConfirm button', { hasText: '처음으로' }).click();
      await waitForContinueReady(page);

      const afterSave = await page.evaluate(() => ({
        currentScreen: window.GS?.currentScreen || null,
        rawSave: localStorage.getItem('echo_fallen_save'),
        continueVisible: document.getElementById('titleContinueWrap')?.style?.display === 'block',
        continueDisabled: document.getElementById('mainContinueBtn')?.disabled ?? null,
      }));
      await page.screenshot({ path: path.join(outDir, 'title.png') });

      await page.click('#mainContinueBtn');
      await page.waitForTimeout(1500);

      const afterLoad = await page.evaluate((capturedErrors) => ({
        currentScreen: window.GS?.currentScreen || null,
        currentRegion: window.GS?.currentRegion ?? null,
        currentFloor: window.GS?.currentFloor ?? null,
        playerClass: window.GS?.player?.class || null,
        playerHp: window.GS?.player?.hp ?? null,
        rawSave: localStorage.getItem('echo_fallen_save'),
        errors: capturedErrors,
      }), errors);
      await page.screenshot({ path: path.join(outDir, 'loaded.png') });

      const payload = { beforeReturn, afterSave, afterLoad, errors };
      await fs.writeFile(path.join(outDir, 'result.json'), JSON.stringify(payload, null, 2));
      console.log(JSON.stringify(payload, null, 2));

      if (!afterSave.rawSave) {
        throw new Error('save-load smoke expected echo_fallen_save to be written before returning to title');
      }
      if (!afterSave.continueVisible || afterSave.continueDisabled) {
        throw new Error('save-load smoke expected continue entry to be visible and enabled on the title screen');
      }
      if (afterLoad.currentScreen !== 'game') {
        throw new Error(`save-load smoke expected continue to restore gameplay, got "${afterLoad.currentScreen}"`);
      }
      if (afterLoad.currentRegion !== beforeReturn.currentRegion || afterLoad.currentFloor !== beforeReturn.currentFloor) {
        throw new Error('save-load smoke expected region/floor to roundtrip through continue');
      }
      if (afterLoad.playerClass !== beforeReturn.playerClass || afterLoad.playerHp !== beforeReturn.playerHp) {
        throw new Error('save-load smoke expected player class/hp to roundtrip through continue');
      }
      if (errors.length > 0) {
        throw new Error(`save-load smoke saw browser errors: ${errors.join(' | ')}`);
      }
    },
  });
} finally {
  await closeStaticAssetServer(server);
}
