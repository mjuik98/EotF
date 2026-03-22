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

async function clickIfVisible(page, selector, timeout = 4000) {
  const handle = await page.waitForSelector(selector, { timeout, state: 'visible' }).catch(() => null);
  if (!handle) return false;
  await handle.click();
  return true;
}

async function advanceTime(page, ms) {
  await page.evaluate(async (duration) => {
    if (typeof window.advanceTime === 'function') {
      await window.advanceTime(duration);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, duration));
  }, ms);
}

async function enterCombatFromRealRun(page) {
  await page.click('#mainStartBtn');
  await page.waitForSelector('#btnCfm', { state: 'visible', timeout: 10000 });
  await page.click('#btnCfm');
  await page.waitForSelector('#btnRealStart', { state: 'visible', timeout: 10000 });
  await page.click('#btnRealStart');

  await clickIfVisible(page, '#introCinematicOverlay', 10000);
  await page.waitForSelector('#storyContinueBtn', { state: 'visible', timeout: 10000 });
  await page.click('#storyContinueBtn');

  await page.waitForSelector('.node-card', { state: 'visible', timeout: 15000 });
  await page.click('.node-card');
  await page.waitForSelector('#combatOverlay.active', { state: 'attached', timeout: 15000 });
  await advanceTime(page, 1200);

  return page.evaluate(() => {
    const overlay = document.querySelector('#combatOverlay.active');
    const nodeCards = document.querySelectorAll('.node-card');
    return {
      combatOverlayActive: !!overlay,
      nodeCardCount: nodeCards.length,
      rewardScreenActive: !!document.getElementById('rewardScreen')?.classList?.contains?.('active'),
    };
  });
}

async function seedCombatScenario(page) {
  return page.evaluate(async () => {
    const gs = window.GS || window.GameState;
    if (!gs?.player || !gs?.combat?.enemies?.length) {
      throw new Error('combat state did not initialize');
    }

    gs.player.hand = ['strike', 'defend', 'echo_wave'];
    gs.player.items = ['serpent_fang_dagger'];
    gs.player.energy = 1;
    gs.player.echo = 45;
    gs.combat.turn = 1;
    gs.combat.playerTurn = true;
    gs.combat.log = [
      { id: 'sys', msg: '⚔️ 전투 시작!', type: 'system' },
      { id: 'buff', msg: '🃏 [방호]: 방어막 +6', type: 'buff' },
      { id: 'echo-prep', msg: '✨ 공명 준비 완료', type: 'echo' },
    ];
    gs.combat.enemies[0].ai = () => ({ type: 'attack', intent: 'Attack 18', dmg: 18 });

    if (typeof window.renderCombatCards === 'function') window.renderCombatCards();
    if (typeof window.renderCombatEnemies === 'function') window.renderCombatEnemies();
    if (typeof window.updateUI === 'function') {
      window.updateUI();
    } else if (typeof window.doUpdateUI === 'function') {
      window.doUpdateUI();
    }
    if (window.CombatHudUI?.updateCombatLog) {
      window.CombatHudUI.updateCombatLog({ gs });
    }

    const drawBtn = document.getElementById('combatDrawCardBtn');
    const echoBtn = document.getElementById('useEchoSkillBtn');
    const combatRelicRail = document.getElementById('combatRelicRail');
    const combatRelicRailCount = document.getElementById('combatRelicRailCount');
    const combatRelicPanel = document.getElementById('combatRelicPanel');
    const recentCombatFeed = document.getElementById('recentCombatFeed');
    const handCards = Array.from(document.querySelectorAll('#combatHandCards .card'));
    const firstHandCard = handCards[0] || null;
    const disabledHandCard = handCards[2] || null;
    const enemyIntent = document.querySelector('.enemy-intent');
    const cardTypeText = firstHandCard?.querySelector('.card-type')?.textContent?.trim() || null;
    const rarityTagText = firstHandCard?.querySelector('.card-rarity-tag')?.textContent?.trim() || null;
    const firstCostClass = firstHandCard?.querySelector('.card-cost')?.className || null;
    const disabledCostClass = disabledHandCard?.querySelector('.card-cost')?.className || null;
    const disabledOverlayText = disabledHandCard?.querySelector('.card-no-energy-label')?.textContent?.trim() || null;
    const cardStyle = firstHandCard ? getComputedStyle(firstHandCard) : null;
    const combatRelicRailRect = combatRelicRail?.getBoundingClientRect?.() || null;
    const combatRelicRailVisible = !!combatRelicRail
      && getComputedStyle(combatRelicRail).display !== 'none'
      && getComputedStyle(combatRelicRail).visibility !== 'hidden'
      && (combatRelicRailRect?.width || 0) > 0
      && (combatRelicRailRect?.height || 0) > 0;

    return {
      overlayActive: !!document.querySelector('#combatOverlay.active'),
      enemyIntentText: enemyIntent?.textContent?.trim() || null,
      handCount: handCards.length,
      firstCardTypeText: cardTypeText,
      firstCardRarityText: rarityTagText,
      firstCostClass,
      disabledCostClass,
      disabledOverlayText,
      firstCardClass: firstHandCard?.className || null,
      firstCardBorderRadius: cardStyle?.borderRadius || null,
      drawText: drawBtn?.textContent?.trim() || null,
      drawTitle: drawBtn?.title || null,
      echoText: echoBtn?.textContent?.trim() || null,
      combatRelicRailVisible,
      combatRelicRailCountText: combatRelicRailCount?.textContent?.trim() || null,
      combatRelicPanelOpen: combatRelicPanel?.dataset?.open === 'true',
      combatRelicPanelVisible: !!combatRelicPanel
        && getComputedStyle(combatRelicPanel).display !== 'none'
        && getComputedStyle(combatRelicPanel).visibility !== 'hidden'
        && (combatRelicPanel.getBoundingClientRect?.().width || 0) > 0,
      recentFeedLayout: recentCombatFeed?.dataset?.layout || null,
      recentFeedEntryCount: recentCombatFeed?.children?.length || 0,
    };
  });
}

async function prepareActualActions(page) {
  await page.evaluate(() => {
    const gs = window.GS || window.GameState;
    const enemy = gs?.combat?.enemies?.[0];
    if (!gs?.player || !enemy) {
      throw new Error('echo kill smoke setup missing combat state');
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
}

async function main() {
  const args = parseArgs(process.argv);
  ensureDir(args.outDir);

  const browser = await chromium.launch({ headless: args.headless });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const consoleErrors = [];
  const visualSnapshots = [
    'combat-ui-real-entry',
    'combat-ui-hover-card',
    'combat-ui-log-right-rail',
    'combat-ui-echo-finish',
    'combat-ui-return-map',
  ];

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

    const realFlowResult = await enterCombatFromRealRun(page);
    await writeSnapshot(page, args.outDir, 'combat-ui-real-entry');

    assertCondition(realFlowResult.combatOverlayActive, 'real run flow did not reach combat overlay');
    assertCondition(realFlowResult.nodeCardCount >= 1, `expected visible node cards before combat entry, got ${realFlowResult.nodeCardCount}`);
    assertCondition(realFlowResult.rewardScreenActive === false, 'reward screen should not be active on combat entry');

    const result = await seedCombatScenario(page);

    assertCondition(result.overlayActive, 'combat overlay did not activate');
    assertCondition(result.enemyIntentText && !result.enemyIntentText.includes('Attack'), `enemy intent was not localized: ${result.enemyIntentText}`);
    assertCondition(result.enemyIntentText?.includes('공격'), `enemy intent text missing localized attack label: ${result.enemyIntentText}`);
    assertCondition(result.handCount >= 3, `expected at least 3 hand cards, got ${result.handCount}`);
    assertCondition(result.firstCardTypeText === '공격', `expected localized hand card type label, got ${result.firstCardTypeText}`);
    assertCondition(result.firstCardRarityText === '일반', `expected localized hand card rarity tag, got ${result.firstCardRarityText}`);
    assertCondition(result.firstCostClass?.includes('card-cost-hand'), `first hand card cost was not rendered with hand cost variant: ${result.firstCostClass}`);
    assertCondition(result.disabledCostClass?.includes('card-cost-insufficient-energy'), `disabled hand card cost did not surface insufficient energy state: ${result.disabledCostClass}`);
    assertCondition(result.disabledOverlayText === '에너지 1 부족', `disabled overlay text mismatch: ${result.disabledOverlayText}`);
    assertCondition(result.firstCardClass?.includes('card'), `hand card class missing card styling hook: ${result.firstCardClass}`);
    assertCondition(result.firstCardBorderRadius === '10px', `hand card styling not applied as expected: ${result.firstCardBorderRadius}`);
    assertCondition(result.drawText && result.drawText.includes('카드 드로우'), `draw button was not localized: ${result.drawText}`);
    assertCondition(result.drawTitle === '카드 1장을 드로우합니다 (에너지 1).', `draw button tooltip mismatch: ${result.drawTitle}`);
    assertCondition(result.echoText && result.echoText.includes('잔향 스킬'), `echo button was not localized: ${result.echoText}`);
    assertCondition(result.combatRelicRailVisible, 'combat relic rail was not visible after combat start');
    assertCondition(result.combatRelicRailCountText === '1', `combat relic rail count mismatch: ${result.combatRelicRailCountText}`);
    assertCondition(result.combatRelicPanelOpen === false, `combat relic panel should be closed by default: ${result.combatRelicPanelOpen}`);
    assertCondition(result.combatRelicPanelVisible === false, `combat relic panel should remain hidden when closed: ${result.combatRelicPanelVisible}`);
    assertCondition(['rail', 'tight', 'stacked'].includes(result.recentFeedLayout), `recent feed layout state missing: ${result.recentFeedLayout}`);
    assertCondition(result.recentFeedEntryCount >= 1, `recent feed should render seeded entries, got ${result.recentFeedEntryCount}`);

    await page.hover('#combatRelicRailSlots button');
    await page.waitForTimeout(100);

    const relicTooltipResult = await page.evaluate(() => {
      const slot = document.querySelector('#combatRelicRailSlots button');
      const combatRelicPanel = document.getElementById('combatRelicPanel');
      const panelText = document.getElementById('combatRelicPanelList')?.innerText?.trim() || null;
      return {
        slotTitle: slot?.title || null,
        slotAriaLabel: slot?.getAttribute?.('aria-label') || null,
        panelOpen: combatRelicPanel?.dataset?.open === 'true',
        panelText,
      };
    });

    assertCondition(!relicTooltipResult.slotTitle, `combat relic slot title should be removed when layout detail is present: ${relicTooltipResult.slotTitle}`);
    assertCondition(relicTooltipResult.slotAriaLabel?.includes('독사의 단검'), `combat relic slot aria-label missing item name: ${relicTooltipResult.slotAriaLabel}`);
    assertCondition(!relicTooltipResult.slotAriaLabel?.includes('[세트:'), `combat relic slot aria-label should omit raw set tags: ${relicTooltipResult.slotAriaLabel}`);
    assertCondition(relicTooltipResult.panelOpen, 'combat relic hover did not open the detail panel');
    assertCondition(relicTooltipResult.panelText?.includes('독사의 단검'), `combat relic panel missing item name: ${relicTooltipResult.panelText}`);

    await page.hover('#combatHandCards .card');
    await page.waitForTimeout(180);
    await writeSnapshot(page, args.outDir, 'combat-ui-hover-card');

    const hoverResult = await page.evaluate(() => {
      const clone = document.querySelector('#handCardCloneLayer .card-clone-visible');
      const cloneCost = clone?.querySelector('.card-cost');
      return {
        hoverCloneVisible: !!clone,
        hoverCloneCostClass: cloneCost?.className || null,
      };
    });

    assertCondition(hoverResult.hoverCloneVisible, 'hovering the first hand card did not show the card clone');
    assertCondition(hoverResult.hoverCloneCostClass?.includes('card-cost-hover'), `hover clone cost missing hover variant class: ${hoverResult.hoverCloneCostClass}`);

    await page.setViewportSize({ width: 430, height: 932 });
    await page.waitForFunction(() => {
      const combatRelicRail = document.getElementById('combatRelicRail');
      if (!combatRelicRail) return false;

      const rect = combatRelicRail.getBoundingClientRect();
      return getComputedStyle(combatRelicRail).display !== 'none'
        && getComputedStyle(combatRelicRail).visibility !== 'hidden'
        && rect.width > 0
        && rect.height > 0;
    });

    const mobileResult = await page.evaluate(() => {
      const combatRelicRail = document.getElementById('combatRelicRail');
      if (!combatRelicRail) {
        return {
          mobileRelicRailVisible: false,
          mobileRelicRailWithinViewport: false,
        };
      }

      const rect = combatRelicRail.getBoundingClientRect();
      const mobileRelicRailVisible = getComputedStyle(combatRelicRail).display !== 'none'
        && getComputedStyle(combatRelicRail).visibility !== 'hidden'
        && rect.width > 0
        && rect.height > 0;
      const mobileRelicRailWithinViewport = rect.left >= 0
        && rect.top >= 0
        && rect.right <= window.innerWidth
        && rect.bottom <= window.innerHeight;

      return {
        mobileRelicRailVisible,
        mobileRelicRailWithinViewport,
      };
    });

    assertCondition(mobileResult.mobileRelicRailVisible, 'combat relic rail was not visible in mobile viewport');
    assertCondition(mobileResult.mobileRelicRailWithinViewport, 'combat relic rail overflowed the mobile viewport');

    await page.setViewportSize({ width: 1440, height: 960 });
    await prepareActualActions(page);
    await page.waitForSelector('#combatHandCards .card[data-card-id="defend"]', { state: 'visible', timeout: 8000 });
    await page.click('#combatHandCards .card[data-card-id="defend"]');
    await page.waitForFunction(() => {
      const feed = document.getElementById('recentCombatFeed');
      const energyText = document.getElementById('combatEnergyText')?.textContent?.trim() || '';
      return (feed?.children?.length || 0) >= 1 && /^1\s*\//.test(energyText);
    }, { timeout: 10000 });
    await page.waitForTimeout(350);
    await writeSnapshot(page, args.outDir, 'combat-ui-log-right-rail');

    const actionFeedResult = await page.evaluate(() => {
      const feed = document.getElementById('recentCombatFeed');
      const energyText = document.getElementById('combatEnergyText')?.textContent?.trim() || null;
      return {
        recentFeedLayout: feed?.dataset?.layout || null,
        recentFeedEntryCount: feed?.children?.length || 0,
        energyAfterCard: energyText,
      };
    });

    assertCondition(actionFeedResult.recentFeedEntryCount >= 1, 'recent combat feed did not update after playing a real card');
    assertCondition(['rail', 'tight', 'stacked'].includes(actionFeedResult.recentFeedLayout), `unexpected recent feed layout after card play: ${actionFeedResult.recentFeedLayout}`);
    assertCondition(/^1\s*\//.test(actionFeedResult.energyAfterCard || ''), `expected defend play to spend one energy, got ${actionFeedResult.energyAfterCard}`);

    await page.click('#useEchoSkillBtn');
    await page.waitForFunction(() => {
      const rewardScreen = document.getElementById('rewardScreen');
      const overlay = document.querySelector('#combatOverlay.active');
      const gs = window.GS || window.GameState;
      return rewardScreen?.classList?.contains('active')
        && !overlay
        && !gs?.combat?.active;
    }, { timeout: 12000 });
    await page.waitForTimeout(1200);
    await writeSnapshot(page, args.outDir, 'combat-ui-echo-finish');

    const echoKillResult = await page.evaluate(() => {
      const rewardScreen = document.getElementById('rewardScreen');
      const rewardCards = document.getElementById('rewardCards');
      const overlay = document.querySelector('#combatOverlay.active');
      const gs = window.GS || window.GameState;
      return {
        rewardScreenActive: !!rewardScreen?.classList?.contains('active'),
        rewardCardsVisible: !!rewardCards?.children?.length,
        combatOverlayClosed: !overlay,
        combatInactive: !gs?.combat?.active,
        enemyCountAfterEcho: Array.isArray(gs?.combat?.enemies) ? gs.combat.enemies.length : -1,
      };
    });

    assertCondition(echoKillResult.rewardScreenActive, 'echo kill did not hand off into the reward screen');
    assertCondition(echoKillResult.rewardCardsVisible, 'reward screen opened without reward options after echo kill');
    assertCondition(echoKillResult.combatOverlayClosed, 'combat overlay remained open after echo kill');
    assertCondition(echoKillResult.combatInactive, 'combat state remained active after echo kill');
    assertCondition(echoKillResult.enemyCountAfterEcho === 0, `echo kill should clear all enemies, got ${echoKillResult.enemyCountAfterEcho}`);

    await page.click('#rewardSkipInitBtn');
    await page.click('#rewardSkipConfirmBtn');
    await page.waitForFunction(() => {
      const rewardScreen = document.getElementById('rewardScreen');
      return !rewardScreen?.classList?.contains('active') && !!document.querySelector('.node-card');
    }, { timeout: 10000 });
    await advanceTime(page, 800);
    await writeSnapshot(page, args.outDir, 'combat-ui-return-map');

    const returnFlowResult = await page.evaluate(() => {
      const rewardScreen = document.getElementById('rewardScreen');
      const overlay = document.querySelector('#combatOverlay.active');
      const nodeCardsVisible = Array.from(document.querySelectorAll('.node-card')).some((node) => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      });
      return {
        rewardScreenClosed: !rewardScreen?.classList?.contains('active'),
        combatOverlayClosed: !overlay,
        nodeCardsVisible,
      };
    });

    assertCondition(returnFlowResult.rewardScreenClosed, 'reward screen did not close after skipping reward');
    assertCondition(returnFlowResult.combatOverlayClosed, 'combat overlay reopened during reward return');
    assertCondition(returnFlowResult.nodeCardsVisible, 'run map did not return after reward skip');
    assertCondition(consoleErrors.length === 0, `console errors detected: ${consoleErrors.join('\n')}`);

    fs.writeFileSync(
      path.join(args.outDir, 'combat-ui-result.json'),
      JSON.stringify({
        realFlowResult,
        ...result,
        ...relicTooltipResult,
        ...hoverResult,
        mobileResult,
        actionFeedResult,
        echoKillResult,
        returnFlowResult,
        visualSnapshots,
        consoleErrors,
      }, null, 2),
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
