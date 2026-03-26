import { createServer } from 'node:http';
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const workspaceRoot = process.cwd();
const distDir = path.join(workspaceRoot, 'dist');
const outDir = path.join(workspaceRoot, 'output', 'web-game', 'save-outbox-recovery-smoke');
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
  await page.evaluate((outboxEntries) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('echo_fallen_outbox', JSON.stringify(outboxEntries));
  }, buildQueuedRunOutboxEntry());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#mainContinueBtn', { state: 'visible', timeout: 10000 });
  await page.waitForTimeout(1000);

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
