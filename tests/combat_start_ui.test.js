import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CombatStartUI } from '../game/ui/combat/combat_start_ui.js';
import { CombatInitializer } from '../game/combat/combat_initializer.js';

function createMockElement() {
  return {
    style: { setProperty: vi.fn() },
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
    },
    children: [],
    textContent: '',
    innerHTML: '',
    dataset: {},
    append(...nodes) {
      this.children.push(...nodes);
    },
    appendChild(node) {
      this.children.push(node);
      return node;
    },
    remove: vi.fn(),
  };
}

function createMockDoc() {
  return {
    body: createMockElement(),
    createElement: vi.fn(() => createMockElement()),
    getElementById: vi.fn(() => null),
    querySelectorAll: vi.fn(() => []),
  };
}

function createDeps() {
  const gs = {
    currentRegion: 0,
    currentFloor: 1,
    combat: { enemies: [], turn: 1, active: false },
    player: { class: 'swordsman', echoChain: 0 },
    stats: {},
    worldMemory: {},
    meta: { storyPieces: [] },
    triggerItems: vi.fn(),
    addLog: vi.fn(),
    markDirty: vi.fn(),
  };

  return {
    gs,
    data: {
      enemies: {
        ancient_echo: { name: 'Ancient Echo', hp: 100 },
      },
    },
    doc: createMockDoc(),
    getRegionData: vi.fn(() => ({
      id: 0,
      name: 'Region One',
      rule: 'Test Rule',
      ruleDesc: 'Test Description',
      enemies: ['ancient_echo'],
      miniBoss: ['ancient_echo'],
      boss: ['ancient_echo'],
    })),
    getBaseRegionIndex: vi.fn(() => 0),
    getRegionCount: vi.fn(() => 5),
    showTurnBanner: vi.fn(),
    renderCombatEnemies: vi.fn(),
    renderCombatCards: vi.fn(),
    updateCombatLog: vi.fn(),
    updateNoiseWidget: vi.fn(),
  };
}

describe('CombatStartUI banner timing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    globalThis.combatOverlay = createMockElement();

    vi.spyOn(CombatInitializer, 'resetCombatState').mockImplementation(() => {});
    vi.spyOn(CombatInitializer, 'spawnEnemies').mockImplementation((gs) => {
      gs.combat.enemies = [{ name: 'Test Boss', hp: 120 }];
      return { spawnedKeys: ['ancient_echo'], isHiddenBoss: false };
    });
    vi.spyOn(CombatInitializer, 'applyRegionDebuffs').mockImplementation(() => {});
    vi.spyOn(CombatInitializer, 'initDeck').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    delete globalThis.combatOverlay;
  });

  it('delays player-turn banner until after boss-name banner for region bosses', () => {
    const deps = createDeps();

    CombatStartUI.startCombat('boss', deps);

    expect(deps.showTurnBanner).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2349);
    expect(deps.showTurnBanner).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(deps.showTurnBanner).toHaveBeenCalledWith('player');
  });

  it('delays player-turn banner until after boss-name banner for mini bosses', () => {
    const deps = createDeps();

    CombatStartUI.startCombat('mini_boss', deps);

    expect(deps.showTurnBanner).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2349);
    expect(deps.showTurnBanner).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(deps.showTurnBanner).toHaveBeenCalledWith('player');
  });

  it('keeps quick player-turn banner timing for normal combat', () => {
    const deps = createDeps();

    CombatStartUI.startCombat('normal', deps);

    expect(deps.showTurnBanner).not.toHaveBeenCalled();
    vi.advanceTimersByTime(299);
    expect(deps.showTurnBanner).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(deps.showTurnBanner).toHaveBeenCalledWith('player');
  });
});
