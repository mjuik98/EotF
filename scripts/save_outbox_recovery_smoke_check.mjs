import fs from 'node:fs/promises';
import path from 'node:path';
import {
  closeStaticAssetServer,
  resetSmokeBrowserStorage,
  resolveSmokeAppUrl,
  runSmokeBrowserSession,
} from './browser_smoke_support.mjs';

const workspaceRoot = process.cwd();
const distDir = path.join(workspaceRoot, 'dist');
const outDir = path.join(workspaceRoot, 'output', 'web-game', 'save-outbox-recovery-smoke');

function buildQueuedRunOutboxEntry() {
  const now = Date.now();
  return [{
    key: 'echo_fallen_save',
    data: {
      version: 2,
      player: {
        class: 'swordsman',
        hp: 80,
        maxHp: 100,
        deck: ['strike', 'guard', 'echo_cut'],
        gold: 42,
        buffs: {},
        hand: [],
        upgradedCards: [],
        _cascadeCards: [],
        items: [],
      },
      currentRegion: 0,
      currentFloor: 0,
      regionFloors: { 0: 0 },
      regionRoute: { 0: [] },
      mapNodes: null,
      visitedNodes: [],
      currentNode: null,
      stats: { kills: 0 },
      worldMemory: {},
      ts: now,
    },
    attempts: 0,
    createdAt: now,
    updatedAt: now,
    nextAttemptAt: now,
  }];
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
      await page.evaluate((outboxEntries) => {
        localStorage.setItem('echo_fallen_outbox', JSON.stringify(outboxEntries));
      }, buildQueuedRunOutboxEntry());
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#mainContinueBtn', { state: 'visible', timeout: 10000 });
      await page.waitForTimeout(1000);
    },
    run: async ({ page, errors }) => {
      const titleState = await page.evaluate((capturedErrors) => ({
        currentScreen: window.GS?.currentScreen || null,
        rawSave: localStorage.getItem('echo_fallen_save'),
        rawOutbox: localStorage.getItem('echo_fallen_outbox'),
        continueVisible: document.getElementById('titleContinueWrap')?.style?.display === 'block',
        continueDisabled: document.getElementById('mainContinueBtn')?.disabled ?? null,
        continueMeta: document.getElementById('titleContinueMeta')?.textContent || '',
        errors: capturedErrors,
      }), errors);
      await page.screenshot({ path: path.join(outDir, 'outbox-title.png') });

      await page.click('#mainContinueBtn');
      await page.waitForTimeout(1500);

      const loadedState = await page.evaluate((capturedErrors) => ({
        currentScreen: window.GS?.currentScreen || null,
        currentRegion: window.GS?.currentRegion ?? null,
        currentFloor: window.GS?.currentFloor ?? null,
        playerClass: window.GS?.player?.class || null,
        playerHp: window.GS?.player?.hp ?? null,
        rawSave: localStorage.getItem('echo_fallen_save'),
        rawOutbox: localStorage.getItem('echo_fallen_outbox'),
        errors: capturedErrors,
      }), errors);
      await page.screenshot({ path: path.join(outDir, 'outbox-loaded.png') });

      const payload = { titleState, loadedState, errors };
      await fs.writeFile(path.join(outDir, 'outbox-result.json'), JSON.stringify(payload, null, 2));
      console.log(JSON.stringify(payload, null, 2));

      if (!titleState.rawSave) {
        throw new Error('save-outbox smoke expected queued outbox recovery to persist echo_fallen_save on boot');
      }
      if (titleState.rawOutbox) {
        throw new Error('save-outbox smoke expected queued outbox to flush away after recovery');
      }
      if (!titleState.continueVisible || titleState.continueDisabled) {
        throw new Error('save-outbox smoke expected continue entry to be visible and enabled after outbox recovery');
      }
      if (loadedState.currentScreen !== 'game') {
        throw new Error(`save-outbox smoke expected continue to restore gameplay, got "${loadedState.currentScreen}"`);
      }
      if (loadedState.currentRegion !== 0 || loadedState.currentFloor !== 0) {
        throw new Error('save-outbox smoke expected recovered save to restore the queued region/floor');
      }
      if (loadedState.playerClass !== 'swordsman' || loadedState.playerHp !== 80) {
        throw new Error('save-outbox smoke expected recovered save to restore the queued player state');
      }
      if (errors.length > 0) {
        throw new Error(`save-outbox smoke saw browser errors: ${errors.join(' | ')}`);
      }
    },
  });
} finally {
  await closeStaticAssetServer(server);
}
