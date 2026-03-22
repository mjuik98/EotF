import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyCombatEntryOverlayElement,
  createCombatBossBanner,
  enableCombatActionButtons,
  getCombatStartBannerDelay,
  refreshCombatStartHud,
  resetCombatStartDom,
  scheduleBossBannerRemoval,
  scheduleEnemyEntryAnimations,
  scheduleHandDealAnimations,
  syncCombatDrawButton,
  syncCombatEchoButton,
} from '../game/ui/combat/combat_start_render_ui.js';

function createElement() {
  return {
    style: {
      display: '',
      opacity: '',
      pointerEvents: '',
      setProperty: vi.fn(),
      removeProperty: vi.fn(),
    },
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
    },
    children: [],
    innerHTML: '',
    textContent: '',
    title: '',
    disabled: false,
    dataset: {},
    append: vi.fn(function append(...nodes) {
      this.children.push(...nodes);
    }),
    appendChild: vi.fn(function appendChild(node) {
      this.children.push(node);
      return node;
    }),
    remove: vi.fn(),
  };
}

describe('combat_start_render_ui', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    delete globalThis.updateEchoSkillBtn;
  });

  it('resets the combat start DOM surface and applies overlay/banner helpers', () => {
    const log = createElement();
    const enemyZone = createElement();
    const nodeCardOverlay = createElement();
    const eventModal = createElement();
    const handZone = createElement();
    const mobileWarn = createElement();
    const overlay = createElement();
    const banner = createElement();
    const sub = createElement();
    const name = createElement();
    const line = createElement();
    const queue = [banner, sub, name, line];
    const doc = {
      body: createElement(),
      createElement: vi.fn(() => queue.shift()),
      getElementById: vi.fn((id) => ({
        combatLog: log,
        enemyZone,
        nodeCardOverlay,
        eventModal,
        combatHandCards: handZone,
        mobileWarn,
      }[id] || null)),
    };

    log.textContent = 'old';
    enemyZone.innerHTML = 'old';
    handZone.dataset.locked = 'true';
    handZone.style.pointerEvents = 'none';

    resetCombatStartDom(doc);
    expect(log.textContent).toBe('');
    expect(enemyZone.innerHTML).toBe('');
    expect(nodeCardOverlay.style.display).toBe('none');
    expect(eventModal.classList.remove).toHaveBeenCalledWith('active');
    expect(handZone.dataset.locked).toBe('false');
    expect(handZone.style.pointerEvents).toBe('');
    expect(mobileWarn.remove).toHaveBeenCalledTimes(1);

    applyCombatEntryOverlayElement(overlay, '#4488ff');
    expect(overlay.style.setProperty).toHaveBeenCalledWith('--entry-flash-color', '#4488ff');
    expect(overlay.classList.add).toHaveBeenCalledWith('active');

    const builtBanner = createCombatBossBanner(doc, 'Boss', true);
    doc.body.appendChild(builtBanner);
    scheduleBossBannerRemoval(builtBanner, 2200);
    expect(builtBanner.className).toBe('boss-encounter-banner');
    vi.advanceTimersByTime(2200);
    expect(builtBanner.remove).toHaveBeenCalledTimes(1);
  });

  it('schedules enemy and hand entry animations and syncs combat buttons', () => {
    const enemyCard = createElement();
    const handCard = createElement();
    const actionBtn = createElement();
    const drawBtn = createElement();
    const echoBtn = createElement();
    const doc = {
      querySelectorAll: vi.fn((selector) => {
        if (selector === '#enemyZone > *') return [enemyCard];
        if (selector === '#combatHandCards .card') return [handCard];
        if (selector === '.combat-actions .action-btn') return [actionBtn];
        return [];
      }),
    };

    scheduleEnemyEntryAnimations(doc);
    scheduleHandDealAnimations(doc);
    vi.advanceTimersByTime(420);
    expect(enemyCard.classList.add).toHaveBeenCalledWith('enemy-enter');
    vi.advanceTimersByTime(60);
    expect(handCard.classList.add).toHaveBeenCalledWith('card-deal-in');

    enableCombatActionButtons(doc);
    expect(actionBtn.disabled).toBe(false);
    expect(actionBtn.style.pointerEvents).toBe('');

    syncCombatDrawButton(drawBtn, {
      canDraw: false,
      inCombat: true,
      playerTurn: false,
      handFull: false,
      hasEnergy: true,
      maxHand: 8,
    });
    expect(drawBtn.disabled).toBe(true);
    expect(drawBtn.title).toBe('적 턴에는 카드를 뽑을 수 없습니다.');

    const updateEchoSkillBtn = vi.fn();
    syncCombatEchoButton(echoBtn, 40, { updateEchoSkillBtn }, { player: { echo: 40 } });
    expect(echoBtn.disabled).toBe(false);
    expect(updateEchoSkillBtn).toHaveBeenCalledTimes(1);

    syncCombatEchoButton(echoBtn, 10, {}, null);
    expect(echoBtn.disabled).toBe(true);
    expect(echoBtn.textContent).toContain('잔향 스킬');
  });

  it('computes banner delay and refreshes combat HUD through helper', () => {
    const doUpdateUI = vi.fn();
    const gs = { markDirty: vi.fn() };
    const deps = {
      resetCombatInfoPanel: vi.fn(),
      refreshCombatInfoPanel: vi.fn(),
      updateClassSpecialUI: vi.fn(),
    };

    expect(getCombatStartBannerDelay(true, false, 300, 2200, 150)).toBe(2350);
    expect(getCombatStartBannerDelay(false, false, 300, 2200, 150)).toBe(300);

    refreshCombatStartHud(gs, deps, { doUpdateUI });
    expect(deps.resetCombatInfoPanel).toHaveBeenCalledTimes(1);
    expect(deps.refreshCombatInfoPanel).toHaveBeenCalledTimes(1);
    expect(doUpdateUI).toHaveBeenCalledWith(deps);
    expect(gs.markDirty).toHaveBeenCalledWith('hud');
    expect(deps.updateClassSpecialUI).toHaveBeenCalledTimes(1);
  });
});
