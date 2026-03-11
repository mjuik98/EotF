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
  CARDS: {},
}));

vi.mock('../game/systems/class_progression_system.js', () => ({
  ClassProgressionSystem: {
    MAX_LEVEL: 10,
    ensureMeta: hoisted.ensureMeta,
    getClassState: hoisted.getClassState,
    getRoadmap: hoisted.getRoadmap,
  },
}));

vi.mock('../game/ui/cards/tooltip_ui.js', () => ({
  TooltipUI: {},
}));

vi.mock('../game/ui/title/character_select_panels.js', () => ({
  renderCharacterInfoPanel: hoisted.renderCharacterInfoPanel,
  renderCharacterPhase: hoisted.renderCharacterPhase,
}));

vi.mock('../game/ui/title/character_select_render.js', () => ({
  renderCharacterButtons: hoisted.renderCharacterButtons,
  renderCharacterDots: hoisted.renderCharacterDots,
  updateCharacterArrows: hoisted.updateCharacterArrows,
}));

vi.mock('../game/ui/title/character_select_radar.js', () => ({
  buildCharacterRadar: hoisted.buildCharacterRadar,
}));

vi.mock('../game/ui/title/character_select_card_ui.js', () => ({
  renderCharacterCard: hoisted.renderCharacterCard,
}));

import {
  buildCharacterSelectSectionLabel,
  createCharacterSelectMountRuntime,
  getCharacterClassProgress,
} from '../game/ui/title/character_select_mount_runtime.js';

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
    expect(hoisted.renderCharacterPhase).toHaveBeenCalledTimes(1);
    expect(deps.onProgressConsumed).toHaveBeenCalledTimes(1);
    expect(runtime.resolveClass('berserker')).toBe(chars[1]);
  });
});
