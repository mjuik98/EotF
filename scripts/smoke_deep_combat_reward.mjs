import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import {
  advanceRuntimeTime,
  clickIfVisible,
  enterCombatFromRun,
  enterRunFlow,
} from './browser_smoke_flow_helpers.mjs';

function parseArgs(argv) {
  const args = {
    url: null,
    outDir: path.join(process.cwd(), 'output', 'web-game', 'deep-combat-reward'),
    headless: true,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--url' && next) {
      args.url = next;
      i += 1;
    } else if (arg === '--out-dir' && next) {
      args.outDir = next;
      i += 1;
    } else if (arg === '--headless' && next) {
      args.headless = next !== '0' && next !== 'false';
      i += 1;
    }
  }

  if (!args.url) {
    throw new Error('--url is required');
  }
  return args;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function writeSnapshot(page, outDir, index) {
  const text = await page.evaluate(() => {
    if (typeof window.render_game_to_text === 'function') {
      return window.render_game_to_text();
    }
    return null;
  });

  await page.screenshot({
    path: path.join(outDir, `shot-${index}.png`),
    fullPage: true,
  });

  if (text) {
    fs.writeFileSync(path.join(outDir, `state-${index}.json`), text);
  }
}

async function writeNamedState(page, outDir, filename) {
  const text = await page.evaluate(() => {
    if (typeof window.render_game_to_text === 'function') {
      return window.render_game_to_text();
    }
    return null;
  });
  if (text) {
    fs.writeFileSync(path.join(outDir, filename), text);
  }
}

function assertCondition(condition, message, details = null) {
  if (!condition) {
    if (details !== null) {
      throw new Error(`${message}\n${JSON.stringify(details, null, 2)}`);
    }
    throw new Error(message);
  }
}

async function main() {
  const args = parseArgs(process.argv);
  ensureDir(args.outDir);

  const browser = await chromium.launch({ headless: args.headless });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const consoleErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[console:${msg.type()}] ${msg.text()}`);
    }
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(`[pageerror] ${err.message}`);
  });

  try {
    await page.goto(args.url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    await enterRunFlow(page, { nodeReadySelector: '.node-card' });
    await enterCombatFromRun(page);
    await writeSnapshot(page, args.outDir, 0);

    await page.evaluate(() => {
      const gs = window.GS || window.GameState;
      const enemy = gs?.combat?.enemies?.[0];
      if (!gs?.player || !enemy) {
        throw new Error('reward smoke setup missing combat state');
      }

      gs.player.energy = 2;
      gs.player.echo = 80;
      gs.combat.playerTurn = true;
      enemy.hp = 8;
      enemy.maxHp = Math.max(30, Number(enemy.maxHp || 0));
      enemy.block = 0;
      enemy.shield = 0;

      if (typeof window.renderCombatEnemies === 'function') window.renderCombatEnemies();
      if (typeof window.updateUI === 'function') {
        window.updateUI();
      } else if (typeof window.doUpdateUI === 'function') {
        window.doUpdateUI();
      }
    });

    await page.click('#useEchoSkillBtn');

    try {
      await page.waitForFunction(() => {
        const rewardScreen = document.getElementById('rewardScreen');
        const text = typeof window.render_game_to_text === 'function'
          ? window.render_game_to_text()
          : '';
        const overlay = document.querySelector('#combatOverlay.active');
        const gs = window.GS || window.GameState;
        return (rewardScreen?.classList?.contains('active') || text.includes('"reward"'))
          && !overlay
          && !gs?.combat?.active;
      }, { timeout: 10000 });
    } catch (error) {
      await writeNamedState(page, args.outDir, 'state-endcombat-timeout.json');
      throw error;
    }
    await advanceRuntimeTime(page, 1200);
    await writeSnapshot(page, args.outDir, 1);

    await page.click('#rewardSkipInitBtn');
    await page.click('#rewardSkipConfirmBtn');
    try {
      await page.waitForFunction(() => {
        const rewardScreen = document.getElementById('rewardScreen');
        return !rewardScreen?.classList?.contains('active');
      }, { timeout: 8000 });
    } catch (error) {
      await writeNamedState(page, args.outDir, 'state-reward-return-timeout.json');
      throw error;
    }
    await page.waitForSelector('.node-card', { state: 'visible', timeout: 10000 });
    await advanceRuntimeTime(page, 800);
    await writeSnapshot(page, args.outDir, 2);

    assertCondition(
      consoleErrors.length === 0,
      'Reward smoke captured console/page errors',
      consoleErrors,
    );
  } finally {
    fs.writeFileSync(
      path.join(args.outDir, 'console-errors.json'),
      JSON.stringify(consoleErrors, null, 2),
      'utf8',
    );
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
