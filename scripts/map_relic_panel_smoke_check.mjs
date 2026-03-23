import { createServer } from 'node:http';
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const workspaceRoot = process.cwd();
const distDir = path.join(workspaceRoot, 'dist');
const outDir = path.join(workspaceRoot, 'output', 'web-game', 'map-relic-panel-smoke');

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
  await page.click('#mainStartBtn');
  await page.waitForSelector('#btnCfm', { state: 'visible', timeout: 10000 });
  await page.click('#btnCfm');
  await page.waitForSelector('#btnRealStart', { state: 'visible', timeout: 10000 });
  await page.click('#btnRealStart');
  await clickIfVisible(page, '#introCinematicOverlay', 10000);
  await page.waitForSelector('#storyContinueBtn', { state: 'visible', timeout: 10000 });
  await page.click('#storyContinueBtn');
  await page.waitForSelector('#ncRelicPanel', { state: 'visible', timeout: 15000 });
  await page.waitForFunction(() => {
    const commonSlot = document.querySelector('.nc-relic-slot.rarity-common');
    const panel = document.getElementById('ncRelicPanel');
    if (!commonSlot || !panel) return false;
    const slotRect = commonSlot.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    return slotRect.width > 0 && slotRect.height > 0 && panelRect.width > 0 && panelRect.height > 0;
  }, { timeout: 15000 });
  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  });
  await page.waitForTimeout(250);

  const preHover = await page.evaluate(() => {
    const commonSlot = document.querySelector('.nc-relic-slot.rarity-common');
    const detailPanel = document.getElementById('mapRelicDetailPanel');
    const rect = commonSlot?.getBoundingClientRect?.() || null;
    return {
      commonSlotLabel: commonSlot?.querySelector('.nc-relic-name')?.textContent?.trim() || null,
      commonSlotWidth: rect?.width ?? null,
      detailOpenBeforeHover: detailPanel?.dataset?.open === 'true',
    };
  });

  await page.hover('.nc-relic-slot.rarity-common');
  await page.waitForTimeout(140);

  const hoverResult = await page.evaluate(() => {
    const detailPanel = document.getElementById('mapRelicDetailPanel');
    return {
      detailOpenOnHover: detailPanel?.dataset?.open === 'true',
      detailTitle: detailPanel?.querySelector('.crp-title')?.textContent?.trim() || null,
    };
  });

  const detailBounds = await page.locator('#mapRelicDetailPanel').boundingBox();
  if (!detailBounds) throw new Error('map relic detail panel did not render a bounding box');
  await page.mouse.move(detailBounds.x + 18, detailBounds.y + 18);
  await page.waitForTimeout(120);

  const detailStaysOpenOnPanelHover = await page.evaluate(() => {
    const detailPanel = document.getElementById('mapRelicDetailPanel');
    return detailPanel?.dataset?.open === 'true';
  });

  await page.mouse.move(24, 24);
  await page.waitForTimeout(180);

  const detailClosesAfterLeavingPanel = await page.evaluate(() => {
    const detailPanel = document.getElementById('mapRelicDetailPanel');
    return detailPanel?.dataset?.open === 'false';
  });

  await page.screenshot({ path: path.join(outDir, 'shot.png') });
  console.log(JSON.stringify({
    ...preHover,
    ...hoverResult,
    detailStaysOpenOnPanelHover,
    detailClosesAfterLeavingPanel,
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
