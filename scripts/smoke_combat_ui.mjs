import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import {
  advanceRuntimeTime,
  clickIfVisible,
} from './browser_smoke_flow_helpers.mjs';
import {
  enterCombatFromRealRun,
  prepareActualActions,
  prepareResonanceScenario,
  seedCombatScenario,
  triggerStackedToastScenario,
} from './smoke_combat_ui_scenarios.mjs';
import {
  assertCondition,
  ensureDir,
  visualSnapshots,
  writeSnapshot,
} from './smoke_combat_ui_support.mjs';

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
    assertCondition(result.firstCardTypeText === null, `expected hand card type label to be absent, got ${result.firstCardTypeText}`);
    assertCondition(result.firstCardRarityText === '일반', `expected localized hand card rarity tag, got ${result.firstCardRarityText}`);
    assertCondition(result.firstCostClass?.includes('card-cost-hand'), `first hand card cost was not rendered with hand cost variant: ${result.firstCostClass}`);
    assertCondition(result.disabledCostClass?.includes('card-cost-insufficient-energy'), `disabled hand card cost did not surface insufficient energy state: ${result.disabledCostClass}`);
    assertCondition(/^에너지 \d+ 부족$/.test(result.disabledOverlayText || ''), `disabled overlay text mismatch: ${result.disabledOverlayText}`);
    assertCondition(result.firstCardClass?.includes('card'), `hand card class missing card styling hook: ${result.firstCardClass}`);
    assertCondition(result.firstCardBorderRadius === '10px', `hand card styling not applied as expected: ${result.firstCardBorderRadius}`);
    assertCondition(result.drawText && result.drawText.includes('카드 드로우'), `draw button was not localized: ${result.drawText}`);
    assertCondition(result.drawTitle === '카드 1장을 드로우합니다 (에너지 1).', `draw button tooltip mismatch: ${result.drawTitle}`);
    assertCondition(result.echoText && result.echoText.includes('잔향 스킬'), `echo button was not localized: ${result.echoText}`);
    assertCondition(result.combatRelicRailVisible, 'combat relic rail was not visible after combat start');
    assertCondition(result.combatRelicRailCountText === '1', `combat relic rail count mismatch: ${result.combatRelicRailCountText}`);
    assertCondition(result.combatRelicPanelOpen === false, `combat relic panel should be closed by default: ${result.combatRelicPanelOpen}`);
    assertCondition(result.combatRelicPanelVisible === false, `combat relic panel should remain hidden when closed: ${result.combatRelicPanelVisible}`);
    assertCondition(['compact', 'tight', 'stacked'].includes(result.recentFeedLayout), `recent feed layout state missing: ${result.recentFeedLayout}`);
    assertCondition(result.recentFeedEntryCount >= 1, `recent feed should render seeded entries, got ${result.recentFeedEntryCount}`);

    const stackedToastResult = await triggerStackedToastScenario(page);
    await writeSnapshot(page, args.outDir, 'combat-ui-stacked-toasts');

    assertCondition(stackedToastResult.toastCount >= 2, `expected at least 2 stacked toasts, got ${stackedToastResult.toastCount}`);
    assertCondition(stackedToastResult.summaryVisible, 'combat summary stacked toast did not render');
    assertCondition(stackedToastResult.itemVisible, 'item acquire stacked toast did not render');
    assertCondition(stackedToastResult.itemCountBadge === 'x2', `duplicate item toast merge badge mismatch: ${stackedToastResult.itemCountBadge}`);
    assertCondition(stackedToastResult.itemTitle === '연기 시험 유물', `stacked toast item title mismatch: ${stackedToastResult.itemTitle}`);

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

    await page.hover('#combatHandCards .card:nth-child(2)');
    await page.waitForTimeout(180);
    await page.hover('#handCardCloneLayer .card-hover-mechanic-trigger');
    await page.waitForTimeout(120);
    await page.focus('#handCardCloneLayer .card-hover-mechanic-trigger');
    await page.waitForTimeout(80);
    await writeSnapshot(page, args.outDir, 'combat-ui-hover-card');

    const hoverResult = await page.evaluate(() => {
      const clone = document.querySelector('#handCardCloneLayer .card-clone-visible');
      const cloneCost = clone?.querySelector('.card-cost');
      const keywordPanel = clone?.querySelector('.card-clone-keyword-panel');
      const mechanicTrigger = clone?.querySelector('.card-hover-mechanic-trigger');
      const tooltip = document.getElementById('cardTooltip');
      return {
        hoverCloneVisible: !!clone,
        hoverCloneCostClass: cloneCost?.className || null,
        hoverMechanicText: mechanicTrigger?.textContent?.trim() || null,
        hoverKeywordPanelOpen: clone?.dataset?.keywordPanelOpen === 'true',
        hoverKeywordPlacement: clone?.dataset?.keywordPlacement || null,
        hoverKeywordTitle: keywordPanel?.querySelector('.card-clone-keyword-body-title')?.textContent?.trim() || null,
        hoverKeywordText: keywordPanel?.querySelector('.card-clone-keyword-body-content')?.textContent?.trim() || null,
        tooltipText: tooltip?.innerText?.trim() || null,
        tooltipVisible: !!tooltip?.classList?.contains?.('visible'),
      };
    });

    assertCondition(hoverResult.hoverCloneVisible, 'hovering the first hand card did not show the card clone');
    assertCondition(hoverResult.hoverCloneCostClass?.includes('card-cost-hover'), `hover clone cost missing hover variant class: ${hoverResult.hoverCloneCostClass}`);
    assertCondition(hoverResult.hoverMechanicText === '잔향', `hover mechanic trigger text mismatch: ${hoverResult.hoverMechanicText}`);
    assertCondition(hoverResult.hoverKeywordPanelOpen, 'hover mechanic trigger did not open the docked keyword panel');
    assertCondition(['right', 'left', 'bottom'].includes(hoverResult.hoverKeywordPlacement), `hover keyword panel placement missing: ${hoverResult.hoverKeywordPlacement}`);
    assertCondition(hoverResult.hoverKeywordTitle === '잔향', `hover keyword title mismatch: ${hoverResult.hoverKeywordTitle}`);
    assertCondition(hoverResult.hoverKeywordText?.includes('특수 능력을 발동하는 에너지 자원'), `hover keyword panel did not render expected copy: ${hoverResult.hoverKeywordText}`);
    assertCondition(!hoverResult.tooltipVisible, 'playable hand card hover should not open the standalone card tooltip');

    await prepareResonanceScenario(page);
    await page.waitForSelector('#ncFloatingHpStatusBadges .hud-status-badge[data-buff-key="resonance"]', { state: 'visible', timeout: 8000 });
    await page.click('#combatHandCards .card[data-card-id="strike"]');
    await page.waitForFunction(() => {
      const gs = window.GS || window.GameState;
      const resonanceBadge = document.querySelector('#ncFloatingHpStatusBadges .hud-status-badge[data-buff-key="resonance"]');
      return Number(gs?.player?.buffs?.resonance?.dmgBonus || 0) >= 3
        && !!resonanceBadge
        && /공명/.test(resonanceBadge.textContent || '');
    }, { timeout: 10000 });
    await page.waitForTimeout(250);
    const resonanceSnapshotText = await writeSnapshot(page, args.outDir, 'combat-ui-resonance-after-attack');

    const resonanceAfterAttackResult = await page.evaluate(() => {
      const gs = window.GS || window.GameState;
      const resonanceBadge = document.querySelector('#ncFloatingHpStatusBadges .hud-status-badge[data-buff-key="resonance"]');
      return {
        resonanceBadgeVisible: !!resonanceBadge,
        resonanceBadgeText: resonanceBadge?.textContent?.trim() || null,
        resonanceDamageBonus: Number(gs?.player?.buffs?.resonance?.dmgBonus || 0),
      };
    });

    assertCondition(resonanceAfterAttackResult.resonanceBadgeVisible, 'resonance badge disappeared after playing an attack card');
    assertCondition(resonanceAfterAttackResult.resonanceBadgeText?.includes('공명'), `resonance badge text mismatch after attack card: ${resonanceAfterAttackResult.resonanceBadgeText}`);
    assertCondition(resonanceAfterAttackResult.resonanceDamageBonus >= 3, `resonance damage bonus did not increase after attack card: ${resonanceAfterAttackResult.resonanceDamageBonus}`);
    assertCondition(resonanceSnapshotText?.includes('"buffKeys":["resonance"]'), `resonance snapshot text lost player buff state: ${resonanceSnapshotText}`);

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
    assertCondition(['compact', 'tight', 'stacked'].includes(actionFeedResult.recentFeedLayout), `unexpected recent feed layout after card play: ${actionFeedResult.recentFeedLayout}`);
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
    await advanceRuntimeTime(page, 800);
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
        stackedToastResult,
        ...relicTooltipResult,
        ...hoverResult,
        resonanceAfterAttackResult,
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
