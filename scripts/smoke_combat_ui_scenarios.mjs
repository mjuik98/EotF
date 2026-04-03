import {
  enterCombatFromRun,
  enterRunFlow,
} from './browser_smoke_flow_helpers.mjs';

export async function enterCombatFromRealRun(page) {
  await enterRunFlow(page, { nodeReadySelector: '.node-card' });
  await enterCombatFromRun(page);

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

export async function seedCombatScenario(page) {
  return page.evaluate(async () => {
    const gs = window.GS || window.GameState;
    if (!gs?.player || !gs?.combat?.enemies?.length) {
      throw new Error('combat state did not initialize');
    }

    gs.player.hand = ['strike', 'resonance', 'heavy_blow', 'defend'];
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

export async function prepareResonanceScenario(page) {
  await page.evaluate(() => {
    const gs = window.GS || window.GameState;
    const enemy = gs?.combat?.enemies?.[0];
    if (!gs?.player || !enemy) {
      throw new Error('resonance smoke setup missing combat state');
    }

    gs.player.class = 'swordsman';
    gs.player.hand = ['strike', 'resonance', 'heavy_blow', 'defend'];
    gs.player.energy = 2;
    gs.player.echo = 45;
    gs.player.buffs = {
      ...(gs.player.buffs || {}),
      resonance: { stacks: 99, dmgBonus: 2 },
    };
    gs.combat.playerTurn = true;
    enemy.hp = Math.max(30, Number(enemy.maxHp || 0));
    enemy.maxHp = Math.max(30, Number(enemy.maxHp || 0));
    enemy.block = 0;
    enemy.shield = 0;

    if (typeof window.renderCombatCards === 'function') window.renderCombatCards();
    if (typeof window.renderCombatEnemies === 'function') window.renderCombatEnemies();
    if (typeof window.updateUI === 'function') {
      window.updateUI();
    } else if (typeof window.doUpdateUI === 'function') {
      window.doUpdateUI();
    }
  });
}

export async function prepareActualActions(page) {
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

export async function triggerStackedToastScenario(page) {
  await page.evaluate(() => {
    if (typeof window.showCombatSummary !== 'function') {
      throw new Error('showCombatSummary binding is unavailable');
    }
    if (typeof window.showItemToast !== 'function') {
      throw new Error('showItemToast binding is unavailable');
    }

    window.showCombatSummary(21, 8, 1);
    const smokeItem = {
      name: '연기 시험 유물',
      icon: '✦',
      desc: '중복 획득 토스트 병합 확인용',
      rarity: 'rare',
    };
    window.showItemToast(smokeItem, { forceQueue: true, typeLabel: '희귀 아이템 획득' });
    window.showItemToast(smokeItem, { forceQueue: true, typeLabel: '희귀 아이템 획득' });
  });

  await page.waitForTimeout(180);
  return page.evaluate(() => {
    const toasts = Array.from(document.querySelectorAll('.stack-toast'));
    const summaryToast = document.querySelector('.stack-toast--summary');
    const itemToast = document.querySelector('.stack-toast--item');
    return {
      toastCount: toasts.length,
      summaryVisible: !!summaryToast,
      itemVisible: !!itemToast,
      itemCountBadge: itemToast?.querySelector('.stack-toast-count')?.textContent?.trim() || null,
      itemTitle: itemToast?.querySelector('.toast-text')?.textContent?.trim() || null,
    };
  });
}
