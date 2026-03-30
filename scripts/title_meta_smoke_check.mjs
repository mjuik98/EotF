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
      await page.waitForSelector('#titleArchiveSummary', { state: 'attached', timeout: 15000 });
      await page.waitForFunction(() => {
        const summaryText = document.getElementById('titleArchiveSummary')?.textContent || '';
        return summaryText.includes('최근 5런') && summaryText.includes('최고 승천 A4');
      }, { timeout: 15000 });

      const titleState = await page.evaluate(() => ({
        archiveSummaryText: document.getElementById('titleArchiveSummary')?.innerText || '',
        archiveExpanded: document.getElementById('titleRunArchive')?.hidden === false,
        statsText: document.getElementById('titleStatsBlock')?.innerText || '',
        continueVisible: document.getElementById('titleContinueWrap')?.style?.display || '',
        saveActionsExpanded: document.getElementById('titleSaveActionPanel')?.hidden === false,
        runAccessLabel: document.querySelector('.title-menu-section--run .title-menu-kicker')?.textContent || '',
        runAccessSummary: document.querySelector('.title-menu-section--run .title-menu-summary')?.textContent || '',
        sessionExitLabel: document.querySelector('.title-menu-section--exit .title-menu-kicker')?.textContent || '',
        sessionExitSummary: document.querySelector('.title-menu-section--exit .title-menu-summary')?.textContent || '',
        sessionExitMeta: document.querySelector('#mainQuitBtn .title-menu-meta')?.textContent || '',
      }));
      await page.screenshot({ path: path.join(outDir, 'title-meta.png'), fullPage: true });

      await page.click('#titleArchiveToggleBtn');
      await page.waitForFunction(() => {
        const archive = document.getElementById('titleRunArchive');
        return !!archive && archive.hidden === false && archive.textContent.includes('전술 분석');
      }, { timeout: 15000 });

      const expandedArchiveText = await page.evaluate(() => {
        return document.getElementById('titleRunArchive')?.innerText || '';
      });
      await page.screenshot({ path: path.join(outDir, 'title-meta-expanded.png'), fullPage: true });

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
      payload.titleState.expandedArchiveText = expandedArchiveText;
      await fs.writeFile(path.join(outDir, 'result.json'), JSON.stringify(payload, null, 2));
      console.log(JSON.stringify(payload, null, 2));

      if (!titleState.archiveSummaryText.includes('승률 40%')) {
        throw new Error('title meta smoke expected the archive summary to render win rate badges');
      }
      if (titleState.archiveExpanded) {
        throw new Error('title meta smoke expected the archive detail panel to stay collapsed by default');
      }
      if (titleState.saveActionsExpanded) {
        throw new Error('title meta smoke expected the save management controls to stay collapsed by default');
      }
      if (titleState.runAccessLabel !== '저장된 런') {
        throw new Error(`title meta smoke expected the run access section label to be "저장된 런", got "${titleState.runAccessLabel}"`);
      }
      if (titleState.sessionExitLabel !== '세션 이탈') {
        throw new Error(`title meta smoke expected the session exit section label to be "세션 이탈", got "${titleState.sessionExitLabel}"`);
      }
      if (!titleState.sessionExitMeta.includes('브라우저 창 닫기')) {
        throw new Error('title meta smoke expected the session exit action to describe the browser close behavior');
      }
      if (!expandedArchiveText.includes('전술 분석')) {
        throw new Error('title meta smoke expected the archive detail panel to reveal analytics when expanded');
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
