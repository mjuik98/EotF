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
  const createCharacterSelectSfx = vi.fn(() => ({
    nav: vi.fn(),
    select: vi.fn(),
    hover: vi.fn(),
    echo: vi.fn(),
  }));
  const cleanupBindings = vi.fn();
  const setupCharacterSelectBindings = vi.fn(() => cleanupBindings);
  const renderCharacterInfoPanel = vi.fn();
  const renderCharacterPhase = vi.fn();
  const renderCharacterButtons = vi.fn();
  const renderCharacterDots = vi.fn();
  const updateCharacterArrows = vi.fn();
  const buildCharacterRadar = vi.fn(() => '<svg></svg>');
  const renderCharacterCard = vi.fn();
  const cleanupCardFx = vi.fn();
  const setupCharacterCardFx = vi.fn(() => cleanupCardFx);
  const flow = {
    go: vi.fn(),
    jumpTo: vi.fn(),
    handleConfirm: vi.fn(),
  };
  const createCharacterSelectFlow = vi.fn(() => flow);
  const openCharacterSkillModal = vi.fn();
  const closeCharacterSkillModal = vi.fn();
  const particleRuntime = {
    start: vi.fn(),
    stop: vi.fn(),
  };
  const createCharacterParticleRuntime = vi.fn(() => particleRuntime);
  const summaryReplay = {
    consumePendingSummaries: vi.fn(),
  };
  const createCharacterSummaryReplay = vi.fn(() => summaryReplay);
  const levelUpDestroy = vi.fn();
  const runEndDestroy = vi.fn();
  const LevelUpPopupUI = vi.fn().mockImplementation(function MockLevelUpPopupUI() {
    this.destroy = levelUpDestroy;
  });
  const RunEndScreenUI = vi.fn().mockImplementation(function MockRunEndScreenUI() {
    this.destroy = runEndDestroy;
  });

  return {
    ensureMeta,
    getClassState,
    getRoadmap,
    createCharacterSelectSfx,
    cleanupBindings,
    setupCharacterSelectBindings,
    renderCharacterInfoPanel,
    renderCharacterPhase,
    renderCharacterButtons,
    renderCharacterDots,
    updateCharacterArrows,
    buildCharacterRadar,
    renderCharacterCard,
    cleanupCardFx,
    setupCharacterCardFx,
    flow,
    createCharacterSelectFlow,
    openCharacterSkillModal,
    closeCharacterSkillModal,
    particleRuntime,
    createCharacterParticleRuntime,
    summaryReplay,
    createCharacterSummaryReplay,
    levelUpDestroy,
    runEndDestroy,
    LevelUpPopupUI,
    RunEndScreenUI,
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

vi.mock('../game/features/title/platform/browser/character_select_audio.js', () => ({
  createCharacterSelectSfx: hoisted.createCharacterSelectSfx,
}));

vi.mock('../game/features/title/platform/browser/character_select_bindings.js', () => ({
  setupCharacterSelectBindings: hoisted.setupCharacterSelectBindings,
}));

vi.mock('../game/features/title/domain/character_select_catalog_content.js', () => ({
  CHARACTER_SELECT_CHARS: [
    {
      class: 'paladin',
      accent: '#7CC8FF',
      glow: '#7CC8FF',
      particle: 'aegis',
      title: 'Paladin',
      name: 'Guardian',
      difficulty: 'Normal',
      traitName: 'Grace',
      tags: ['holy'],
      color: '#123456',
      emoji: 'P',
    },
    {
      class: 'berserker',
      accent: '#FF5555',
      glow: '#FF5555',
      particle: 'rage',
      title: 'Berserker',
      name: 'Rage',
      difficulty: 'Hard',
      traitName: 'Fury',
      tags: ['rage'],
      color: '#330000',
      emoji: 'B',
    },
  ],
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

vi.mock('../game/features/title/platform/browser/character_select_fx.js', () => ({
  setupCharacterCardFx: hoisted.setupCharacterCardFx,
}));

vi.mock('../game/features/title/platform/browser/character_select_flow.js', () => ({
  createCharacterSelectFlow: hoisted.createCharacterSelectFlow,
}));

vi.mock('../game/features/title/platform/browser/character_select_modal.js', () => ({
  openCharacterSkillModal: hoisted.openCharacterSkillModal,
  closeCharacterSkillModal: hoisted.closeCharacterSkillModal,
}));

vi.mock('../game/features/title/platform/browser/character_select_particles.js', () => ({
  createCharacterParticleRuntime: hoisted.createCharacterParticleRuntime,
}));

vi.mock('../game/features/title/platform/browser/character_select_summary_replay.js', () => ({
  createCharacterSummaryReplay: hoisted.createCharacterSummaryReplay,
}));

vi.mock('../game/features/title/presentation/browser/level_up_popup_ui.js', () => ({
  LevelUpPopupUI: hoisted.LevelUpPopupUI,
}));

vi.mock('../game/features/title/presentation/browser/run_end_screen_ui.js', () => ({
  RunEndScreenUI: hoisted.RunEndScreenUI,
}));

import { CharacterSelectUI } from '../game/features/title/ports/public_character_select_presentation_capabilities.js';

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

function createDocument() {
  const headChildren = [];
  const elements = {
    charCard: createElement(),
    infoPanel: createElement(),
    dotsRow: createElement(),
    buttonsRow: createElement(),
    bgGradient: createElement(),
    headerTitle: createElement(),
    skillModal: createElement(),
  };
  const introA = { classList: { add: vi.fn() } };
  const introB = { classList: { add: vi.fn() } };

  return {
    head: {
      children: headChildren,
      appendChild(node) {
        headChildren.push(node);
        if (node?.id) elements[node.id] = node;
      },
    },
    createElement: vi.fn((tag) => ({
      tagName: tag,
      rel: '',
      href: '',
      id: '',
    })),
    getElementById: vi.fn((id) => elements[id] || null),
    querySelectorAll: vi.fn((selector) => (selector === '.intro' ? [introA, introB] : [])),
    elements,
    intros: [introA, introB],
  };
}

describe('character select ui mount wiring', () => {
  beforeEach(() => {
    vi.useFakeTimers();
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
    hoisted.getRoadmap.mockReturnValue([]);
    hoisted.setupCharacterSelectBindings.mockReturnValue(hoisted.cleanupBindings);
    hoisted.setupCharacterCardFx.mockReturnValue(hoisted.cleanupCardFx);
    hoisted.createCharacterSelectFlow.mockReturnValue(hoisted.flow);
    hoisted.createCharacterParticleRuntime.mockReturnValue(hoisted.particleRuntime);
    hoisted.createCharacterSummaryReplay.mockReturnValue(hoisted.summaryReplay);
    hoisted.LevelUpPopupUI.mockImplementation(function MockLevelUpPopupUI() {
      this.destroy = hoisted.levelUpDestroy;
    });
    hoisted.RunEndScreenUI.mockImplementation(function MockRunEndScreenUI() {
      this.destroy = hoisted.runEndDestroy;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    CharacterSelectUI._runtime = null;
  });

  it('mounts helper graph, exposes runtime, and cleans up on destroy', () => {
    const doc = createDocument();
    const requestAnimationFrame = vi.fn();
    const cancelAnimationFrame = vi.fn();
    const onBack = vi.fn();

    const mounted = CharacterSelectUI.mount({
      doc,
      win: {},
      gs: { meta: {} },
      onBack,
      requestAnimationFrame,
      cancelAnimationFrame,
    });

    expect(doc.head.children).toHaveLength(2);
    expect(doc.head.children.map((node) => node.href)).toEqual(expect.arrayContaining([
      expect.stringContaining('class_progression.css'),
      expect.stringContaining('character_select_layout.css'),
    ]));

    expect(hoisted.ensureMeta).toHaveBeenCalledWith({}, ['paladin', 'berserker']);
    expect(hoisted.createCharacterParticleRuntime).toHaveBeenCalledWith({
      doc,
      win: {},
      requestAnimationFrameImpl: requestAnimationFrame,
      cancelAnimationFrameImpl: cancelAnimationFrame,
    });
    expect(hoisted.LevelUpPopupUI).toHaveBeenCalledWith({
      cancelRaf: cancelAnimationFrame,
      doc,
      raf: requestAnimationFrame,
      win: {},
    });
    expect(hoisted.RunEndScreenUI).toHaveBeenCalledWith({
      doc,
      raf: requestAnimationFrame,
      setTimeout: expect.any(Function),
      win: {},
    });
    expect(hoisted.createCharacterSummaryReplay).toHaveBeenCalledWith(expect.objectContaining({
      meta: {},
      classIds: ['paladin', 'berserker'],
      saveProgressMeta: expect.any(Function),
      updateAll: expect.any(Function),
    }));
    expect(hoisted.createCharacterSelectFlow).toHaveBeenCalledWith(expect.objectContaining({
      state: expect.objectContaining({ idx: 0, phase: 'select' }),
      chars: CharacterSelectUI.CHARS,
      resolveById: expect.any(Function),
      sfx: expect.objectContaining({
        nav: expect.any(Function),
        select: expect.any(Function),
      }),
      updateAll: expect.any(Function),
      renderPhase: expect.any(Function),
    }));

    expect(hoisted.renderCharacterCard).toHaveBeenCalledTimes(1);
    expect(hoisted.renderCharacterInfoPanel).toHaveBeenCalledTimes(1);
    expect(hoisted.renderCharacterDots).toHaveBeenCalledWith(doc.elements.dotsRow, CharacterSelectUI.CHARS, 0, hoisted.flow.jumpTo);
    expect(hoisted.renderCharacterButtons).toHaveBeenCalledWith(doc.elements.buttonsRow, CharacterSelectUI.CHARS[0], expect.any(Function), hoisted.flow.handleConfirm);
    expect(hoisted.updateCharacterArrows).toHaveBeenCalledWith(expect.any(Function), '#7CC8FF');
    expect(hoisted.particleRuntime.start).toHaveBeenCalledWith('aegis', '#7CC8FF');
    expect(hoisted.setupCharacterSelectBindings).toHaveBeenCalledWith(expect.objectContaining({
      doc,
      onBack,
      go: hoisted.flow.go,
      handleConfirm: hoisted.flow.handleConfirm,
    }));
    expect(hoisted.setupCharacterCardFx).toHaveBeenCalledWith({
      card: doc.elements.charCard,
      resolveById: expect.any(Function),
    });

    vi.advanceTimersByTime(80);
    expect(doc.intros[0].classList.add).toHaveBeenCalledWith('mounted');
    expect(doc.intros[1].classList.add).toHaveBeenCalledWith('mounted');

    CharacterSelectUI.onEnter();
    expect(hoisted.renderCharacterCard).toHaveBeenCalledTimes(2);
    expect(hoisted.particleRuntime.start).toHaveBeenCalledTimes(2);

    CharacterSelectUI.showPendingSummaries();
    expect(hoisted.summaryReplay.consumePendingSummaries).toHaveBeenCalledTimes(1);

    expect(CharacterSelectUI.getSelectionSnapshot()).toEqual({
      index: 0,
      phase: 'select',
      classId: 'paladin',
      title: 'Paladin',
      name: 'Guardian',
      accent: '#7CC8FF',
    });

    mounted.destroy();
    expect(hoisted.cleanupBindings).toHaveBeenCalledTimes(1);
    expect(hoisted.cleanupCardFx).toHaveBeenCalledTimes(1);
    expect(hoisted.particleRuntime.stop).toHaveBeenCalledTimes(1);
    expect(hoisted.levelUpDestroy).toHaveBeenCalledTimes(1);
    expect(hoisted.runEndDestroy).toHaveBeenCalledTimes(1);
    expect(CharacterSelectUI._runtime).toBe(null);
    expect(CharacterSelectUI.getSelectionSnapshot()).toBe(null);
  });
});
