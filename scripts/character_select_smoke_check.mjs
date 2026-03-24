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
    const levelRect = level?.getBoundingClientRect?.() || null;
    const nameRect = cardName?.getBoundingClientRect?.() || null;
    return {
      confirmText: document.querySelector('#buttonsRow button')?.textContent?.trim() || null,
      levelText: level?.textContent?.trim() || null,
      xpReadoutExists: Boolean(document.getElementById('cardXpBarWrap')),
      levelAboveName: Boolean(levelRect && nameRect && levelRect.bottom <= nameRect.top + 2),
      levelBottom: levelRect?.bottom ?? null,
      nameTop: nameRect?.top ?? null,
      introMountedCount: document.querySelectorAll('.intro.mounted').length,
      errors: capturedErrors,
    };
  }, errors);
  await page.screenshot({ path: path.join(outDir, 'shot.png') });
  console.log(JSON.stringify(payload, null, 2));
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
