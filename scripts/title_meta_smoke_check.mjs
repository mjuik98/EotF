import { createServer } from 'node:http';
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const workspaceRoot = process.cwd();
const distDir = path.join(workspaceRoot, 'dist');
const outDir = path.join(workspaceRoot, 'output', 'web-game', 'title-meta-smoke');
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

await fs.mkdir(outDir, { recursive: true });
if (!process.env.SMOKE_URL) {
  await fs.rm(snapshotDir, { recursive: true, force: true });
  await fs.cp(distDir, snapshotDir, { recursive: true });
}

const server = process.env.SMOKE_URL ? null : createDistServer(process.env.SMOKE_URL ? distDir : snapshotDir);
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
  await page.evaluate((meta) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('echo_fallen_meta', JSON.stringify(meta));
  }, SEEDED_META);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  });

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
  await page.waitForSelector('#rmChallengeZone', { state: 'visible', timeout: 15000 });
  await page.waitForFunction(() => {
    return !!document.querySelector('#rmChallengeZone .rm-challenge-panel');
  }, { timeout: 15000 });

  const beforeApply = await page.evaluate(() => ({
    challengeText: document.getElementById('rmChallengeZone')?.innerText || '',
    ascensionText: document.querySelector('.rm-asc-val')?.textContent || '',
    endlessText: document.querySelector('.rm-toggle-label')?.textContent || '',
    rewardText: document.querySelector('.rm-summary-reward')?.textContent || '',
  }));

  await page.click('[data-action="apply-daily-challenge"]');
  await page.waitForFunction(() => {
    const label = document.querySelector('.rm-toggle-label')?.textContent || '';
    const asc = document.querySelector('.rm-asc-val')?.textContent || '';
    return asc !== 'A0' || label.includes('켜짐');
  }, { timeout: 15000 });

  const afterApply = await page.evaluate(() => ({
    challengeText: document.getElementById('rmChallengeZone')?.innerText || '',
    ascensionText: document.querySelector('.rm-asc-val')?.textContent || '',
    endlessText: document.querySelector('.rm-toggle-label')?.textContent || '',
    rewardText: document.querySelector('.rm-summary-reward')?.textContent || '',
    savedMeta: JSON.parse(localStorage.getItem('echo_fallen_meta') || 'null'),
  }));
  await page.screenshot({ path: path.join(outDir, 'run-settings-daily-challenge.png'), fullPage: true });

  const payload = { titleState, beforeApply, afterApply, errors };
  await fs.writeFile(path.join(outDir, 'result.json'), JSON.stringify(payload, null, 2));
  console.log(JSON.stringify(payload, null, 2));

  if (!titleState.archiveText.includes('승률 40%')) {
    throw new Error('title meta smoke expected the archive summary to render win rate badges');
  }
  if (!beforeApply.challengeText.includes('일일 도전')) {
    throw new Error('title meta smoke expected the run settings panel to render the daily challenge');
  }
  if ((afterApply.savedMeta?.runConfig?.ascension || 0) <= 0) {
    throw new Error('title meta smoke expected the daily challenge to persist a non-zero ascension');
  }
  if (!afterApply.challengeText.includes('기록용 추천 구성')) {
    throw new Error('title meta smoke expected the daily challenge panel to keep its reward label after apply');
  }
  if (errors.length > 0) {
    throw new Error(`title meta smoke saw browser errors: ${errors.join(' | ')}`);
  }
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
