import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => {
  const ensureMeta = vi.fn();
  const getClassState = vi.fn(() => ({
    level: 2,
    totalXp: 20,
    currentLevelXp: 20,
    nextLevelXp: 100,
    progress: 0.2,
  }));
  const getRoadmap = vi.fn(() => []);
  const renderCharacterInfoPanel = vi.fn();
  const renderCharacterPhase = vi.fn();
  const renderCharacterButtons = vi.fn();
  const renderCharacterDots = vi.fn();
  const updateCharacterArrows = vi.fn();
  const buildCharacterRadar = vi.fn(() => '<svg></svg>');
  const renderCharacterCard = vi.fn();

  return {
    ensureMeta,
    getClassState,
    getRoadmap,
    renderCharacterInfoPanel,
    renderCharacterPhase,
    renderCharacterButtons,
    renderCharacterDots,
    updateCharacterArrows,
    buildCharacterRadar,
    renderCharacterCard,
  };
});

vi.mock('../data/cards.js', () => ({
  ASSETS: {},
  CARDS: {},
  UPGRADE_MAP: {},
}));

vi.mock('../game/features/title/domain/class_progression_system.js', () => ({
  ClassProgressionSystem: {
    MAX_LEVEL: 10,
    ensureMeta: hoisted.ensureMeta,
    getClassState: hoisted.getClassState,
    getRoadmap: hoisted.getRoadmap,
  },
}));

vi.mock('../game/features/combat/ports/public_presentation_capabilities.js', () => ({
  TooltipUI: {},
}));

vi.mock('../game/features/title/platform/browser/character_select_panels.js', () => ({
  renderCharacterInfoPanel: hoisted.renderCharacterInfoPanel,
  renderCharacterPhase: hoisted.renderCharacterPhase,
}));

vi.mock('../game/features/title/platform/browser/character_select_render.js', () => ({
  renderCharacterButtons: hoisted.renderCharacterButtons,
  renderCharacterDots: hoisted.renderCharacterDots,
  updateCharacterArrows: hoisted.updateCharacterArrows,
}));

vi.mock('../game/features/title/platform/browser/character_select_radar.js', () => ({
  buildCharacterRadar: hoisted.buildCharacterRadar,
}));

vi.mock('../game/features/title/platform/browser/character_select_card_ui.js', () => ({
  renderCharacterCard: hoisted.renderCharacterCard,
}));

import {
  buildCharacterSelectSectionLabel,
  createCharacterSelectMountRuntime,
  getCharacterClassProgress,
} from '../game/features/title/platform/browser/create_character_select_mount_runtime.js';

function createElement() {
  return {
    style: {},
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(() => false),
    },
  };
}

describe('character_select_mount_runtime', () => {
  beforeEach(() => {
    Object.values(hoisted).forEach((value) => {
      if (typeof value?.mockReset === 'function') value.mockReset();
    });
    hoisted.getClassState.mockReturnValue({
      level: 2,
      totalXp: 20,
      currentLevelXp: 20,
      nextLevelXp: 100,
      progress: 0.2,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('builds section labels and class progress fallbacks', () => {
    expect(buildCharacterSelectSectionLabel('로드맵', '#7CC8FF')).toContain('#7CC8FF44');
    expect(getCharacterClassProgress(null, 'paladin', ['paladin'])).toEqual(expect.objectContaining({
      classId: 'paladin',
      level: 1,
      totalXp: 0,
    }));
  });

  it('creates mount runtime render/update helpers around the selected character state', () => {
    const elements = {
      charCard: createElement(),
      infoPanel: createElement(),
      dotsRow: createElement(),
      buttonsRow: createElement(),
      bgGradient: createElement(),
      headerTitle: createElement(),
    };
    const chars = [
      { class: 'paladin', traitName: 'Grace', accent: '#7CC8FF', glow: '#7CC8FF', particle: 'aegis' },
      { class: 'berserker', traitName: 'Fury', accent: '#FF5555', glow: '#FF5555', particle: 'rage' },
    ];
    const deps = { gs: { meta: {} }, onStart: vi.fn(), onProgressConsumed: vi.fn() };
    const state = { idx: 0, phase: 'select', typingTimer: null };
    const flow = { jumpTo: vi.fn(), handleConfirm: vi.fn() };
    const particleRuntime = { start: vi.fn() };
    const sfx = { hover: vi.fn(), echo: vi.fn() };
    const runtime = createCharacterSelectMountRuntime({
      chars,
      deps,
      doc: {},
      flow,
      getById: (id) => elements[id] || null,
      openModal: vi.fn(),
      particleRuntime,
      sfx,
      state,
      stopTyping: vi.fn(),
      win: {},
    });

    runtime.updateAll();
    runtime.renderPhase();
    runtime.saveProgressMeta();

    expect(hoisted.ensureMeta).toHaveBeenCalledWith({}, ['paladin', 'berserker']);
    expect(hoisted.renderCharacterCard).toHaveBeenCalledTimes(1);
    expect(hoisted.renderCharacterInfoPanel).toHaveBeenCalledTimes(1);
    expect(hoisted.renderCharacterDots).toHaveBeenCalledWith(elements.dotsRow, chars, 0, flow.jumpTo);
    expect(hoisted.renderCharacterButtons).toHaveBeenCalledWith(elements.buttonsRow, chars[0], expect.any(Function), flow.handleConfirm);
    expect(hoisted.updateCharacterArrows).toHaveBeenCalledWith(expect.any(Function), '#7CC8FF');
    expect(particleRuntime.start).toHaveBeenCalledWith('aegis', '#7CC8FF');
    expect(elements.bgGradient.style.background).toContain(chars[0].glow);
    expect(elements.headerTitle.style.textShadow).toContain(chars[0].glow);
    expect(hoisted.renderCharacterCard).toHaveBeenCalledWith(expect.objectContaining({
      traitBadgeText: 'Grace',
      summaryText: expect.any(String),
    }));
    expect(hoisted.renderCharacterPhase).toHaveBeenCalledTimes(1);
    expect(deps.onProgressConsumed).toHaveBeenCalledTimes(1);
    expect(runtime.resolveClass('berserker')).toBe(chars[1]);
  });

  it('passes loadout summary and warning state through to the character card renderer', () => {
    hoisted.getClassState.mockReturnValue({
      level: 12,
      totalXp: 2200,
      currentLevelXp: 2200,
      nextLevelXp: null,
      progress: 1,
    });

    const elements = {
      charCard: createElement(),
      infoPanel: createElement(),
      dotsRow: createElement(),
      buttonsRow: createElement(),
      bgGradient: createElement(),
      headerTitle: createElement(),
    };
    const chars = [
      {
        class: 'swordsman',
        traitName: 'Resonance',
        accent: '#7CC8FF',
        glow: '#7CC8FF',
        particle: 'aegis',
        startDeck: ['strike', 'heavy_blow'],
        startRelicId: 'dull_blade',
        startRelic: { icon: '*', name: 'Dull Blade', desc: 'Starter relic.' },
      },
    ];
    const deps = {
      gs: {
        meta: {
          codex: {
            cards: new Set(),
            items: new Set(),
          },
          classProgress: {
            levels: { swordsman: 12 },
            xp: { swordsman: 2200 },
            pendingSummaries: [],
            loadoutPresets: {
              swordsman: {
                level11: { type: 'swap', removeIndex: 1, removeCardId: 'heavy_blow', addCardId: 'blade_dance' },
                level12: { bonusRelicId: 'guardian_seal' },
              },
            },
          },
        },
      },
      data: {
        cards: {
          strike: { id: 'strike', name: 'Strike' },
          heavy_blow: { id: 'heavy_blow', name: 'Heavy Blow' },
          blade_dance: { id: 'blade_dance', name: 'Blade Dance' },
        },
        items: {
          dull_blade: { id: 'dull_blade', name: 'Dull Blade' },
          guardian_seal: { id: 'guardian_seal', name: 'Guardian Seal' },
        },
        startDecks: {
          swordsman: ['strike', 'heavy_blow'],
        },
        upgradeMap: {
          strike: 'strike_plus',
          heavy_blow: 'heavy_blow_plus',
        },
      },
    };

    const runtime = createCharacterSelectMountRuntime({
      chars,
      deps,
      doc: {},
      flow: { jumpTo: vi.fn(), handleConfirm: vi.fn() },
      getById: (id) => elements[id] || null,
      openModal: vi.fn(),
      particleRuntime: { start: vi.fn() },
      sfx: { hover: vi.fn(), echo: vi.fn() },
      state: { idx: 0, phase: 'select', typingTimer: null },
      stopTyping: vi.fn(),
      win: {},
    });

    runtime.updateAll();

    expect(hoisted.renderCharacterCard).toHaveBeenCalledWith(expect.objectContaining({
      loadoutSummaryText: '',
      loadoutWarningText: '프리셋 확인 필요',
      xpText: '최고 레벨 · 2200 경험치',
      summaryText: expect.any(String),
    }));
    expect(hoisted.renderCharacterInfoPanel).toHaveBeenCalledWith(expect.objectContaining({
      loadoutCustomization: expect.objectContaining({
        hasInvalidPreset: true,
        invalidWarnings: [
          'Lv.11 시작 덱 프리셋을 적용할 수 없습니다. 저장된 설정을 확인하세요.',
          'Lv.12 시작 유물 프리셋을 적용할 수 없습니다. 저장된 설정을 확인하세요.',
        ],
      }),
    }));
  });

  it('passes achievement-unlocked loadout rewards to the info panel before codex discovery', () => {
    hoisted.getClassState.mockReturnValue({
      level: 12,
      totalXp: 2200,
      currentLevelXp: 2200,
      nextLevelXp: null,
      progress: 1,
    });

    const elements = {
      charCard: createElement(),
      infoPanel: createElement(),
      dotsRow: createElement(),
      buttonsRow: createElement(),
      bgGradient: createElement(),
      headerTitle: createElement(),
    };
    const chars = [
      {
        class: 'swordsman',
        traitName: 'Resonance',
        accent: '#7CC8FF',
        glow: '#7CC8FF',
        particle: 'aegis',
        startDeck: ['strike', 'heavy_blow'],
        startRelicId: 'dull_blade',
        startRelic: { icon: '*', name: 'Dull Blade', desc: 'Starter relic.' },
      },
    ];
    const deps = {
      gs: {
        meta: {
          codex: {
            cards: new Set(),
            items: new Set(),
          },
          contentUnlocks: {
            version: 1,
            curses: {},
            relics: {},
            relicsByClass: {
              swordsman: {
                guardian_seal: { unlocked: true },
              },
            },
            cards: {
              shared: {},
              swordsman: {
                blade_dance: { unlocked: true },
              },
            },
          },
          classProgress: {
            levels: { swordsman: 12 },
            xp: { swordsman: 2200 },
            pendingSummaries: [],
            loadoutPresets: {},
          },
        },
      },
      data: {
        cards: {
          strike: { id: 'strike', name: 'Strike' },
          heavy_blow: { id: 'heavy_blow', name: 'Heavy Blow' },
          blade_dance: { id: 'blade_dance', name: 'Blade Dance' },
        },
        items: {
          dull_blade: { id: 'dull_blade', name: 'Dull Blade' },
          guardian_seal: { id: 'guardian_seal', name: 'Guardian Seal' },
        },
        startDecks: {
          swordsman: ['strike', 'heavy_blow'],
        },
        upgradeMap: {
          strike: 'strike_plus',
          heavy_blow: 'heavy_blow_plus',
          blade_dance: 'blade_dance_plus',
        },
      },
    };

    const runtime = createCharacterSelectMountRuntime({
      chars,
      deps,
      doc: {},
      flow: { jumpTo: vi.fn(), handleConfirm: vi.fn() },
      getById: (id) => elements[id] || null,
      openModal: vi.fn(),
      particleRuntime: { start: vi.fn() },
      sfx: { hover: vi.fn(), echo: vi.fn() },
      state: { idx: 0, phase: 'select', typingTimer: null },
      stopTyping: vi.fn(),
      win: {},
    });

    runtime.updateAll();

    expect(hoisted.renderCharacterInfoPanel).toHaveBeenCalledWith(expect.objectContaining({
      loadoutCustomization: expect.objectContaining({
        eligibleSwapAddCards: [{ cardId: 'blade_dance', name: 'Blade Dance' }],
        eligibleBonusRelics: [{ id: 'guardian_seal', name: 'Guardian Seal' }],
        hasInvalidPreset: false,
      }),
    }));
  });
});
