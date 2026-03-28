import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

export function createStaticAssetServer(rootDir) {
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

export async function startStaticAssetServer(rootDir) {
  const server = createStaticAssetServer(rootDir);
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address();
  return {
    server,
    appUrl: `http://127.0.0.1:${port}`,
  };
}

export async function closeStaticAssetServer(server) {
  if (!server) return;
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

export async function resolveSmokeAppUrl({
  smokeUrl = process.env.SMOKE_URL || '',
  distDir,
} = {}) {
  if (smokeUrl) {
    return {
      appUrl: smokeUrl,
      server: null,
    };
  }

  return startStaticAssetServer(distDir);
}

export async function resetSmokeBrowserStorage(page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

export async function waitForSmokeFonts(page) {
  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  });
}

export async function runSmokeBrowserSession({
  appUrl,
  viewport = { width: 1440, height: 960 },
  gotoOptions = { waitUntil: 'domcontentloaded', timeout: 30000 },
  preparePage,
  run,
} = {}) {
  let browser = null;
  const errors = [];

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport });
    page.on('pageerror', (error) => errors.push(`pageerror:${error.message}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`console:${msg.text()}`);
    });

    await page.goto(appUrl, gotoOptions);
    if (typeof preparePage === 'function') {
      await preparePage({ page, errors });
    }

    if (typeof run !== 'function') {
      return { errors };
    }

    return await run({ browser, page, errors });
  } finally {
    if (browser) await browser.close();
  }
}

export async function runSmokeScriptWithServer({
  smokeUrl = process.env.SMOKE_URL || '',
  distDir,
  outDir,
  scriptPath,
  scriptArgs = [],
  label = 'smoke',
} = {}) {
  const { appUrl, server } = await resolveSmokeAppUrl({ smokeUrl, distDir });
  const resolvedArgs = typeof scriptArgs === 'function'
    ? scriptArgs({ appUrl, outDir })
    : scriptArgs;

  try {
    return await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [scriptPath, ...(resolvedArgs || [])], {
        stdio: 'inherit',
        env: {
          ...process.env,
          SMOKE_URL: appUrl,
          SMOKE_OUT_DIR: outDir,
        },
      });
      child.on('error', reject);
      child.on('exit', (code, signal) => {
        if (signal) {
          reject(new Error(`${label} exited via signal ${signal}`));
          return;
        }
        resolve(code ?? 0);
      });
    });
  } finally {
    await closeStaticAssetServer(server);
  }
}
