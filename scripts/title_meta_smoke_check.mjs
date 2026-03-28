import fs from 'node:fs/promises';
import path from 'node:path';
import {
  closeStaticAssetServer,
  resetSmokeBrowserStorage,
  resolveSmokeAppUrl,
  runSmokeBrowserSession,
  waitForSmokeFonts,
} from './browser_smoke_support.mjs';

const workspaceRoot = process.cwd();
const distDir = process.env.SMOKE_DIST_DIR || path.join(workspaceRoot, 'dist');
const outDir = path.join(workspaceRoot, 'output', 'web-game', 'title-meta-smoke');

const SEEDED_META = {
  version: 2,
  runCount: 8,
  totalKills: 142,
  bestChain: 17,
  maxAscension: 5,
  unlocks: {
    ascension: true,
    endless: true,
  },
  contentUnlocks: {
    curses: {
      blood_moon: { unlocked: true },
      silence: { unlocked: true },
      tax: { unlocked: true },
    },
  },
  runConfig: {
    ascension: 0,
    endless: false,
    curse: 'none',
    disabledInscriptions: [],
  },
  recentRuns: [
    { runNumber: 11, outcome: 'victory', classId: 'guardian', ascension: 4, floor: 12, kills: 17, maxChain: 17, clearTimeMs: 1012000 },
    { runNumber: 10, outcome: 'defeat', classId: 'mage', ascension: 3, floor: 9, kills: 12, clearTimeMs: 741000 },
    { runNumber: 9, outcome: 'victory', classId: 'rogue', ascension: 2, floor: 12, kills: 15, clearTimeMs: 895000 },
    { runNumber: 8, outcome: 'defeat', classId: 'swordsman', ascension: 1, floor: 6, kills: 8, clearTimeMs: 491000 },
    { runNumber: 7, outcome: 'abandon', classId: 'hunter', ascension: 0, floor: 4, kills: 5, clearTimeMs: 253000 },
  ],
};

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
      await page.evaluate((meta) => {
        localStorage.setItem('echo_fallen_meta', JSON.stringify(meta));
      }, SEEDED_META);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await waitForSmokeFonts(page);
    },
    run: async ({ page, errors }) => {
      await page.waitForSelector('#titleRunArchive', { state: 'attached', timeout: 15000 });
      await page.waitForFunction(() => {
        const archiveText = document.getElementById('titleRunArchive')?.textContent || '';
        return archiveText.includes('귀환 기록실') && archiveText.includes('최근 5런') && archiveText.includes('최고 승천 A4');
      }, { timeout: 15000 });

      const titleState = await page.evaluate(() => ({
        archiveText: document.getElementById('titleRunArchive')?.innerText || '',
        statsText: document.getElementById('titleStatsBlock')?.innerText || '',
        continueVisible: document.getElementById('titleContinueWrap')?.style?.display || '',
      }));
      await page.screenshot({ path: path.join(outDir, 'title-meta.png'), fullPage: true });

      await page.click('#mainRunRulesBtn');
      await page.waitForSelector('#runSettingsModal', { state: 'visible', timeout: 15000 });
      await page.waitForFunction(() => {
        return !!document.getElementById('rmPresetZone')
          && !!document.querySelector('#rmSummaryBarZone .rm-summary-bar');
      }, { timeout: 15000 });

      const runSettingsState = await page.evaluate(() => ({
        hasChallengeZone: !!document.getElementById('rmChallengeZone'),
        presetText: document.getElementById('rmPresetZone')?.innerText || '',
        summaryText: document.getElementById('rmSummaryBarZone')?.innerText || '',
        ascensionText: document.querySelector('.rm-asc-val')?.textContent || '',
        endlessText: document.querySelector('.rm-toggle-label')?.textContent || '',
      }));
      await page.screenshot({ path: path.join(outDir, 'run-settings.png'), fullPage: true });

      const payload = { titleState, runSettingsState, errors };
      await fs.writeFile(path.join(outDir, 'result.json'), JSON.stringify(payload, null, 2));
      console.log(JSON.stringify(payload, null, 2));

      if (!titleState.archiveText.includes('승률 40%')) {
        throw new Error('title meta smoke expected the archive summary to render win rate badges');
      }
      if (runSettingsState.hasChallengeZone) {
        throw new Error('title meta smoke expected the run settings panel to omit the daily challenge block');
      }
      if (!runSettingsState.presetText.includes('프리셋')) {
        throw new Error('title meta smoke expected the run settings panel to render preset controls');
      }
      if (!runSettingsState.summaryText.includes('현재 구성')) {
        throw new Error('title meta smoke expected the run settings summary to render');
      }
      if (errors.length > 0) {
        throw new Error(`title meta smoke saw browser errors: ${errors.join(' | ')}`);
      }
    },
  });
} finally {
  await closeStaticAssetServer(server);
}
