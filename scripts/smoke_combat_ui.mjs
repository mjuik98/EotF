import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

function parseArgs(argv) {
  const args = {
    url: null,
    outDir: path.join(process.cwd(), 'output', 'web-game', 'combat-ui-smoke'),
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

async function writeSnapshot(page, outDir, name) {
  const text = await page.evaluate(() => {
    if (typeof window.render_game_to_text === 'function') {
      return window.render_game_to_text();
    }
    return null;
  });

  await page.screenshot({
    path: path.join(outDir, `${name}.png`),
    fullPage: true,
  });

  if (text) {
    fs.writeFileSync(path.join(outDir, `${name}.json`), text);
  }
}

function assertCondition(condition, message) {
  if (!condition) throw new Error(message);
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
    await page.waitForTimeout(800);

    const result = await page.evaluate(async () => {
      if (typeof window.startCombat !== 'function') {
        throw new Error('window.startCombat is not available');
      }

      await window.startCombat('normal');
      await new Promise((resolve) => setTimeout(resolve, 600));

      const gs = window.GS || window.GameState;
      if (!gs?.player || !gs?.combat?.enemies?.length) {
        throw new Error('combat state did not initialize');
      }

      gs.player.hand = ['strike', 'defend', 'echo_wave'];
      gs.player.energy = 2;
      gs.player.echo = 45;
      gs.combat.turn = 1;
      gs.combat.playerTurn = true;
      gs.combat.enemies[0].ai = () => ({ type: 'attack', intent: 'Attack 18', dmg: 18 });

      if (typeof window.renderCombatCards === 'function') window.renderCombatCards();
      if (typeof window.renderCombatEnemies === 'function') window.renderCombatEnemies();
      if (typeof window.doUpdateUI === 'function') window.doUpdateUI();

      const drawBtn = document.getElementById('combatDrawCardBtn');
      const echoBtn = document.getElementById('useEchoSkillBtn');
      const handCards = Array.from(document.querySelectorAll('#combatHandCards .card'));
      const firstHandCard = handCards[0] || null;
      const enemyIntent = document.querySelector('.enemy-intent');
      const cardTypeText = firstHandCard?.querySelector('.card-type')?.textContent?.trim() || null;
      const cardStyle = firstHandCard ? getComputedStyle(firstHandCard) : null;

      return {
        overlayActive: !!document.querySelector('#combatOverlay.active'),
        enemyIntentText: enemyIntent?.textContent?.trim() || null,
        handCount: handCards.length,
        firstCardTypeText: cardTypeText,
        firstCardClass: firstHandCard?.className || null,
        firstCardBorderRadius: cardStyle?.borderRadius || null,
        drawText: drawBtn?.textContent?.trim() || null,
        drawTitle: drawBtn?.title || null,
        echoText: echoBtn?.textContent?.trim() || null,
      };
    });

    await writeSnapshot(page, args.outDir, 'combat-ui');

    assertCondition(result.overlayActive, 'combat overlay did not activate');
    assertCondition(result.enemyIntentText && !result.enemyIntentText.includes('Attack'), `enemy intent was not localized: ${result.enemyIntentText}`);
    assertCondition(result.enemyIntentText?.includes('공격'), `enemy intent text missing localized attack label: ${result.enemyIntentText}`);
    assertCondition(result.handCount >= 3, `expected at least 3 hand cards, got ${result.handCount}`);
    assertCondition(result.firstCardTypeText === '공격', `expected localized hand card type label, got ${result.firstCardTypeText}`);
    assertCondition(result.firstCardClass?.includes('card'), `hand card class missing card styling hook: ${result.firstCardClass}`);
    assertCondition(result.firstCardBorderRadius === '10px', `hand card styling not applied as expected: ${result.firstCardBorderRadius}`);
    assertCondition(result.drawText && result.drawText.includes('카드 드로우'), `draw button was not localized: ${result.drawText}`);
    assertCondition(result.drawTitle === '카드 1장을 드로우합니다 (에너지 1).', `draw button tooltip mismatch: ${result.drawTitle}`);
    assertCondition(result.echoText && result.echoText.includes('잔향 스킬'), `echo button was not localized: ${result.echoText}`);
    assertCondition(consoleErrors.length === 0, `console errors detected: ${consoleErrors.join('\n')}`);

    fs.writeFileSync(
      path.join(args.outDir, 'combat-ui-result.json'),
      JSON.stringify({ ...result, consoleErrors }, null, 2),
      'utf8',
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
