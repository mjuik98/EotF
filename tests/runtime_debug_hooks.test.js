import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createRuntimeDebugSnapshot,
  registerRuntimeDebugHooks,
} from '../game/core/bootstrap/register_runtime_debug_hooks.js';

function createDoc() {
  const elements = new Map();
  const defaultView = {
    innerWidth: 1440,
    innerHeight: 900,
    getComputedStyle: (element) => ({
      display: element?.style?.display || 'block',
    }),
    setTimeout,
    requestAnimationFrame: (callback) => {
      callback(16);
      return 1;
    },
  };

  const ensureElement = (id, display = 'none', active = false) => {
    const element = {
      id,
      style: { display },
      classList: {
        contains: (name) => active && name === 'active',
      },
    };
    elements.set(id, element);
    return element;
  };

  ensureElement('charSelectSubScreen', 'block');
  ensureElement('runSettingsModal', 'none');
  ensureElement('codexModal', 'none');
  ensureElement('combatOverlay', 'block', true);
  ensureElement('rewardScreen', 'none');
  ensureElement('eventModal', 'none');
  ensureElement('deckViewModal', 'none');
  ensureElement('settingsModal', 'none');
  ensureElement('mainTitleSubScreen', 'none');
  elements.set('combatEnergyText', {
    id: 'combatEnergyText',
    textContent: '2 / 3',
    style: { display: 'block' },
  });
  elements.set('turnIndicator', {
    id: 'turnIndicator',
    textContent: '적의 턴',
    style: { display: 'block' },
  });
  elements.set('combatHandCards', {
    id: 'combatHandCards',
    style: { display: 'block' },
  });
  elements.set('handCardCloneLayer', {
    id: 'handCardCloneLayer',
    style: { display: 'block' },
  });
  elements.set('gameCanvas', { id: 'gameCanvas', width: 1440, height: 900 });
  const combatCards = [{ className: 'card' }, { className: 'card' }];
  const hoverClone = {
    className: 'card-clone-visible',
    dataset: {
      keywordPanelOpen: 'false',
      keywordPlacement: 'right',
    },
    querySelector: () => null,
  };
  const endTurnButton = {
    className: 'action-btn-end',
    disabled: true,
    style: { display: 'block' },
  };

  return {
    defaultView,
    getElementById: (id) => elements.get(id) || null,
    querySelectorAll: (selector) => {
      if (selector === '#combatHandCards .card') return combatCards;
      return [];
    },
    querySelector: (selector) => {
      if (selector === '#handCardCloneLayer .card-clone-visible') return hoverClone;
      if (selector === '.action-btn-end') return endTurnButton;
      return null;
    },
  };
}

function attachStoryOverlay(doc, title, text) {
  const button = {
    id: 'storyContinueBtn',
    textContent: '계속',
    style: { display: 'block' },
    parentElement: null,
  };
  const overlay = {
    style: { display: 'block' },
    children: [
      { textContent: title },
      { textContent: text },
      { textContent: '' },
      button,
    ],
  };
  button.parentElement = overlay;
  return { overlay, button };
}

function createModules() {
  const coreGS = {
    currentScreen: 'combat',
    currentRegion: 2,
    currentFloor: 4,
    currentNode: { id: '4-1' },
    _selectedTarget: 1,
    player: {
      class: 'guardian',
      hp: 52,
      maxHp: 80,
      shield: 11,
      energy: 2,
      maxEnergy: 3,
      echo: 45,
      maxEcho: 100,
      gold: 28,
      hand: ['strike', 'defend'],
      deck: ['strike', 'defend', 'echo'],
      graveyard: ['flash'],
      items: ['relic-a'],
      buffs: { fortify: 2 },
    },
    combat: {
      active: true,
      playerTurn: false,
      turn: 7,
      log: [{ msg: 'x' }, { msg: 'y' }],
      enemies: [
        { id: 'wolf', hp: 12, maxHp: 20, nextAction: 'attack', status: { burn: 1 } },
        { id: 'shade', hp: 0, maxHp: 18, intent: 'weaken', statuses: { weak: 1 } },
      ],
    },
    mapNodes: [
      { id: '4-1', floor: 4, accessible: true, visited: true, type: 'combat' },
      { id: '5-1', floor: 5, accessible: true, visited: false, type: 'event' },
      { id: '5-2', floor: 5, accessible: false, visited: false, type: 'elite' },
    ],
  };
  const classSelectUI = {
    getSelectedClass: vi.fn(() => 'guardian'),
  };
  const characterSelectUI = {
    getSelectionSnapshot: vi.fn(() => ({
      index: 0,
      phase: 'select',
      classId: 'guardian',
      title: 'Guardian',
      name: 'Guardian',
      accent: '#7CC8FF',
    })),
  };

  return {
    GS: {
      currentScreen: 'title',
      combat: { active: false },
    },
    ClassSelectUI: {
      getSelectedClass: vi.fn(() => 'stale-class'),
    },
    CharacterSelectUI: {
      getSelectionSnapshot: vi.fn(() => ({
        index: 9,
        phase: 'stale',
        classId: 'stale',
      })),
    },
    featureScopes: {
      core: {
        GS: coreGS,
      },
      title: {
        ClassSelectUI: classSelectUI,
        CharacterSelectUI: characterSelectUI,
      },
    },
    exposeGlobals: vi.fn(),
    _gameStarted: true,
  };
}

describe('runtime debug hooks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('builds a concise runtime snapshot from state and visible panels', () => {
    const doc = createDoc();
    const modules = createModules();

    const snapshot = createRuntimeDebugSnapshot({
      modules,
      doc,
      win: doc.defaultView,
    });

    expect(snapshot).toMatchObject({
      screen: 'combat',
      ui: {
        panels: expect.arrayContaining(['characterSelect', 'combatOverlay']),
        surface: {
          activePanelIds: expect.arrayContaining(['characterSelect', 'combatOverlay']),
          activePanelCount: 2,
        },
        overlays: {
          activePanelIds: expect.arrayContaining(['characterSelect', 'combatOverlay']),
          activePanelCount: 2,
        },
      },
      panels: expect.arrayContaining(['characterSelect', 'combatOverlay']),
      title: {
        selectedClass: 'guardian',
        characterSelect: expect.objectContaining({
          classId: 'guardian',
          phase: 'select',
        }),
        surface: {
          selectedClass: 'guardian',
          characterSelectClassId: 'guardian',
          characterSelectPhase: 'select',
          introCinematicActive: false,
          storyFragmentActive: false,
        },
        ui: {
          selectedClass: 'guardian',
          characterSelectClassId: 'guardian',
          characterSelectPhase: 'select',
          introCinematicActive: false,
          storyFragmentActive: false,
        },
      },
      overlays: {
        storyFragment: null,
        runStart: {
          active: false,
          activeOverlayIds: [],
        },
        surface: {
          activeOverlayIds: [],
          activeOverlayCount: 0,
        },
      },
      player: {
        class: 'guardian',
        hp: 52,
        drawPileCount: 0,
        handCount: 2,
        handPreview: ['strike', 'defend'],
        deckCount: 3,
        graveyardPreview: ['flash'],
      },
      combat: {
        active: true,
        turn: 7,
        aliveEnemyCount: 1,
        targetableEnemyIndexes: [0],
        selectedTarget: 1,
        selectedEnemyId: 'shade',
        logSize: 2,
        layout: {
          viewport: { width: 1440, height: 900, source: 'gameCanvas' },
          playerAnchor: { x: 720, y: 702 },
        },
        resources: {
          handCount: 2,
          drawPileCount: 0,
          graveyardCount: 1,
          energy: 2,
          maxEnergy: 3,
        },
        ui: {
          handCardCount: 2,
          energyLabel: '2 / 3',
          turnLabel: '적의 턴',
          endTurnDisabled: true,
        },
        surface: {
          handCardCount: 2,
          energyLabel: '2 / 3',
          turnLabel: '적의 턴',
          endTurnDisabled: true,
          hoverCloneVisible: true,
          hoverKeywordPanelOpen: false,
          hoverKeywordPlacement: 'right',
        },
      },
      map: {
        coordinateSystem: 'map floor increases downward, node position increases rightward',
        currentRegion: 2,
        currentFloor: 4,
        currentNode: '4-1',
        currentNodeType: null,
        canChoosePath: false,
        reachableNodeIds: ['5-1'],
        accessibleNodeCount: 1,
        resources: {
          currentRegion: 2,
          currentFloor: 4,
          accessibleNodeCount: 1,
        },
        ui: {
          nodeCardCount: 0,
          relicPanelVisible: false,
          currentNodeId: '4-1',
          reachableNodeIds: ['5-1'],
        },
        surface: {
          nodeCardCount: 0,
          relicPanelVisible: false,
          currentNodeId: '4-1',
          reachableNodeIds: ['5-1'],
        },
      },
      runtime: {
        gameStarted: true,
        selectedTarget: 1,
      },
    });
    expect(snapshot.combat.enemies).toHaveLength(2);
    expect(snapshot.combat.enemies[0]).toMatchObject({
      index: 0,
      targetable: true,
      anchor: { x: 620, y: 315 },
    });
    expect(snapshot.map.nextNodes).toEqual([
      { id: '5-1', type: 'event', floor: 5, pos: 0, total: 2, visited: false, xRatio: 0.333 },
    ]);
  });

  it('registers hooks globally and advances after timeout plus frame', async () => {
    const doc = createDoc();
    const modules = createModules();
    const fns = {
      updateUI: vi.fn(),
      renderCombatEnemies: vi.fn(),
      renderCombatCards: vi.fn(),
      updateCombatLog: vi.fn(),
      updateEchoSkillBtn: vi.fn(),
      renderMinimap: vi.fn(),
    };

    const hooks = registerRuntimeDebugHooks({
      modules,
      fns,
      doc,
      win: doc.defaultView,
    });

    expect(modules.exposeGlobals).toHaveBeenCalledWith({
      render_game_to_text: hooks.render_game_to_text,
      advanceTime: hooks.advanceTime,
    });

    const text = hooks.render_game_to_text();
    expect(JSON.parse(text)).toMatchObject({
      screen: 'combat',
      title: {
        selectedClass: 'guardian',
        characterSelect: expect.objectContaining({
          classId: 'guardian',
        }),
      },
    });

    const pending = hooks.advanceTime(40);
    await vi.advanceTimersByTimeAsync(40);
    await expect(pending).resolves.toBe(40);

    expect(fns.updateUI).toHaveBeenCalledTimes(1);
    expect(fns.renderCombatEnemies).toHaveBeenCalledTimes(1);
    expect(fns.renderCombatCards).toHaveBeenCalledTimes(1);
    expect(fns.updateCombatLog).toHaveBeenCalledTimes(1);
    expect(fns.updateEchoSkillBtn).toHaveBeenCalledTimes(1);
    expect(fns.renderMinimap).not.toHaveBeenCalled();
  });

  it('captures story fragment overlays in the runtime snapshot', () => {
    const doc = createDoc();
    const modules = createModules();
    const baseGetElementById = doc.getElementById;
    const { overlay, button } = attachStoryOverlay(doc, '조각 1 - 첫 번째 진향', '눈을 뜬다. 검의 무게는 기억하는데...');
    doc.getElementById = (id) => {
      if (id === 'storyContinueBtn') return button;
      return baseGetElementById(id);
    };

    const snapshot = createRuntimeDebugSnapshot({
      modules,
      doc,
      win: doc.defaultView,
    });

    expect(button.parentElement).toBe(overlay);
    expect(snapshot.panels).toContain('storyFragment');
    expect(snapshot.overlays.storyFragment).toMatchObject({
      active: true,
      title: '조각 1 - 첫 번째 진향',
      text: '눈을 뜬다. 검의 무게는 기억하는데...',
      continueLabel: '계속',
    });
    expect(snapshot.title.surface.storyFragmentActive).toBe(true);
    expect(snapshot.runtime.overlayMode).toBe('storyFragment');
  });
});
