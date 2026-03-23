import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyCombatEntryOverlay,
  finalizeCombatStartUi,
  resetCombatStartSurface,
  scheduleCombatEntryAnimations,
  scheduleCombatStartBanner,
  showCombatBossBanner,
  syncCombatStartButtons,
} from '../game/features/combat/public.js';

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

describe('combat_start_runtime_ui', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resets combat start surface and refreshes initial combat renderers', () => {
    const log = createElement();
    const enemyZone = createElement();
    const nodeCardOverlay = createElement();
    const eventModal = createElement();
    const handZone = createElement();
    const doc = {
      getElementById: vi.fn((id) => ({
        combatLog: log,
        enemyZone,
        nodeCardOverlay: nodeCardOverlay,
        eventModal,
        combatHandCards: handZone,
      }[id] || null)),
    };
    const deps = {
      doc,
      updateChainUI: vi.fn(),
      renderCombatEnemies: vi.fn(),
      renderCombatCards: vi.fn(),
      updateCombatLog: vi.fn(),
      updateNoiseWidget: vi.fn(),
    };
    const gs = { player: { echoChain: 7 } };

    log.textContent = 'old';
    enemyZone.innerHTML = 'old';
    handZone.dataset.locked = 'true';
    handZone.style.pointerEvents = 'none';

    resetCombatStartSurface(gs, deps);

    expect(log.textContent).toBe('');
    expect(enemyZone.innerHTML).toBe('');
    expect(nodeCardOverlay.style.display).toBe('none');
    expect(eventModal.classList.remove).toHaveBeenCalledWith('active');
    expect(handZone.dataset.locked).toBe('false');
    expect(handZone.style.pointerEvents).toBe('');
    expect(deps.updateChainUI).toHaveBeenCalledWith(7);
    expect(deps.renderCombatEnemies).toHaveBeenCalledTimes(1);
    expect(deps.renderCombatCards).toHaveBeenCalledTimes(1);
    expect(deps.updateCombatLog).toHaveBeenCalledTimes(1);
    expect(deps.updateNoiseWidget).toHaveBeenCalledTimes(1);
  });

  it('applies entry overlay flash color and shows boss banner cleanup', () => {
    const overlay = createElement();
    const line = createElement();
    const sub = createElement();
    const name = createElement();
    const banner = createElement();
    const queue = [banner, sub, name, line];
    const doc = {
      body: createElement(),
      createElement: vi.fn(() => queue.shift()),
      getElementById: vi.fn((id) => ({
        combatOverlay: overlay,
      }[id] || null)),
    };
    const gs = { currentRegion: 1, combat: { enemies: [{ name: 'Test Boss' }] } };

    applyCombatEntryOverlay(gs, {
      doc,
      getBaseRegionIndex: vi.fn(() => 1),
    });
    expect(overlay.style.setProperty).toHaveBeenCalledWith('--entry-flash-color', '#4488ff');
    expect(overlay.classList.add).toHaveBeenCalledWith('active');

    const shake = vi.fn();
    showCombatBossBanner(gs, true, { doc, screenShake: { shake } });
    expect(shake).toHaveBeenCalledWith(20, 1.2);
    expect(banner.className).toBe('boss-encounter-banner');
    expect(doc.body.appendChild).toHaveBeenCalledWith(banner);
    vi.advanceTimersByTime(2200);
    expect(banner.remove).toHaveBeenCalledTimes(1);
  });

  it('schedules enemy and hand entry animations', () => {
    const enemyCard = createElement();
    const handCard = createElement();
    const doc = {
      querySelectorAll: vi.fn((selector) => {
        if (selector === '#enemyZone > *') return [enemyCard];
        if (selector === '#combatHandCards .card') return [handCard];
        return [];
      }),
    };

    scheduleCombatEntryAnimations({ doc });
    vi.advanceTimersByTime(420);
    expect(enemyCard.style.setProperty).toHaveBeenCalledWith('--enter-delay', '0ms');
    expect(enemyCard.classList.add).toHaveBeenCalledWith('enemy-enter');
    vi.advanceTimersByTime(480 - 420);
    expect(handCard.style.setProperty).toHaveBeenCalledWith('--deal-delay', '0ms');
    expect(handCard.classList.add).toHaveBeenCalledWith('card-deal-in');
  });

  it('syncs action, draw, and echo buttons and schedules the player turn banner', () => {
    const actionBtn = createElement();
    const drawBtn = createElement();
    const echoBtn = createElement();
    const doc = {
      getElementById: vi.fn((id) => ({
        combatDrawCardBtn: drawBtn,
        useEchoSkillBtn: echoBtn,
      }[id] || null)),
      querySelectorAll: vi.fn(() => [actionBtn]),
    };
    const hudUpdateUI = { enableActionButtons: vi.fn() };
    const updateEchoSkillBtn = vi.fn();
    const showTurnBanner = vi.fn();
    const gs = {
      combat: { active: true, playerTurn: true },
      player: { energy: 1, hand: [], echo: 40 },
    };

    syncCombatStartButtons(gs, { doc, updateEchoSkillBtn, hudUpdateUI });
    expect(hudUpdateUI.enableActionButtons).toHaveBeenCalledTimes(1);
    expect(actionBtn.disabled).toBe(false);
    expect(actionBtn.style.pointerEvents).toBe('');
    expect(drawBtn.disabled).toBe(false);
    expect(drawBtn.title).toBe('카드 1장을 드로우합니다 (에너지 1).');
    expect(updateEchoSkillBtn).toHaveBeenCalledWith(expect.objectContaining({ gs }));

    scheduleCombatStartBanner(true, false, { showTurnBanner });
    vi.advanceTimersByTime(2349);
    expect(showTurnBanner).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(showTurnBanner).toHaveBeenCalledWith('player');
  });

  it('finalizes combat start UI through HUD refresh fallback and class special update', () => {
    const doUpdateUI = vi.fn();
    const resetCombatInfoPanel = vi.fn();
    const refreshCombatInfoPanel = vi.fn();
    const updateClassSpecialUI = vi.fn();
    const markDirty = vi.fn();
    const gs = { markDirty };

    finalizeCombatStartUi(gs, {
      resetCombatInfoPanel,
      refreshCombatInfoPanel,
      updateClassSpecialUI,
      hudUpdateUI: { doUpdateUI },
    });

    expect(resetCombatInfoPanel).toHaveBeenCalledTimes(1);
    expect(refreshCombatInfoPanel).toHaveBeenCalledTimes(1);
    expect(doUpdateUI).toHaveBeenCalledTimes(1);
    expect(markDirty).toHaveBeenCalledWith('hud');
    expect(updateClassSpecialUI).toHaveBeenCalledTimes(1);
  });
});
