import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GameBootUI } from '../game/features/title/ports/public_game_boot_presentation_capabilities.js';

function makeElement() {
  return {
    id: '',
    style: {},
    textContent: '',
    innerHTML: '',
    classList: { contains: vi.fn(() => true), add: vi.fn(), remove: vi.fn(), toggle: vi.fn() },
    addEventListener: vi.fn(),
    closest: vi.fn(() => null),
    click: vi.fn(),
    getBoundingClientRect: vi.fn(() => ({ top: 10, height: 40 })),
    getContext: vi.fn(() => ({
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      fill: vi.fn(),
      arc: vi.fn(),
      createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      fillRect: vi.fn(),
      globalCompositeOperation: 'source-over',
    })),
    querySelectorAll: vi.fn(() => []),
    querySelector: vi.fn(() => null),
  };
}

function createMockDocument() {
  const elements = {
    titleAudioWave: { ...makeElement(), id: 'titleAudioWave', width: 300, height: 32 },
    titleTimeLabel: { ...makeElement(), id: 'titleTimeLabel' },
    titleTimeText: { ...makeElement(), id: 'titleTimeText' },
    titleTimeDot: { ...makeElement(), id: 'titleTimeDot' },
    titleStatsBlock: { ...makeElement(), id: 'titleStatsBlock' },
    titleTotalRuns: { ...makeElement(), id: 'titleTotalRuns' },
    titleTotalKills: { ...makeElement(), id: 'titleTotalKills' },
    titleBestChain: { ...makeElement(), id: 'titleBestChain' },
    titleContinueWrap: { ...makeElement(), id: 'titleContinueWrap' },
    titleMenuDivider: { ...makeElement(), id: 'titleMenuDivider' },
    titleMenuPanel: { ...makeElement(), id: 'titleMenuPanel', getBoundingClientRect: vi.fn(() => ({ top: 0 })) },
    titleNavCursor: { ...makeElement(), id: 'titleNavCursor' },
    titleLoreText: { ...makeElement(), id: 'titleLoreText' },
    mainContinueBtn: { ...makeElement(), id: 'mainContinueBtn' },
    mainStartBtn: { ...makeElement(), id: 'mainStartBtn' },
    mainRunRulesBtn: { ...makeElement(), id: 'mainRunRulesBtn' },
    mainCodexBtn: { ...makeElement(), id: 'mainCodexBtn' },
    mainSettingsBtn: { ...makeElement(), id: 'mainSettingsBtn' },
    mainQuitBtn: { ...makeElement(), id: 'mainQuitBtn' },
    titleScreen: { ...makeElement(), id: 'titleScreen', classList: { contains: vi.fn(() => true) } },
    mainTitleSubScreen: { ...makeElement(), id: 'mainTitleSubScreen' },
    sttClass: { ...makeElement(), id: 'sttClass' },
    sttFloor: { ...makeElement(), id: 'sttFloor' },
    sttAscension: { ...makeElement(), id: 'sttAscension' },
    sttHp: { ...makeElement(), id: 'sttHp' },
    sttGold: { ...makeElement(), id: 'sttGold' },
    titleContinueMeta: { ...makeElement(), id: 'titleContinueMeta' },
    sttDeckPills: { ...makeElement(), id: 'sttDeckPills' },
    sttRelics: { ...makeElement(), id: 'sttRelics' },
  };

  return {
    readyState: 'complete',
    addEventListener: vi.fn(),
    getElementById: vi.fn((id) => elements[id] || null),
    querySelector: vi.fn(() => null),
    querySelectorAll: vi.fn(() => [
      elements.mainContinueBtn,
      elements.mainStartBtn,
      elements.mainRunRulesBtn,
      elements.mainCodexBtn,
      elements.mainSettingsBtn,
      elements.mainQuitBtn,
    ]),
    elements,
  };
}

describe('game_boot_ui', () => {
  let originalRaf;
  let originalCancelRaf;

  beforeEach(() => {
    vi.useFakeTimers();
    originalRaf = globalThis.requestAnimationFrame;
    originalCancelRaf = globalThis.cancelAnimationFrame;
    globalThis.requestAnimationFrame = vi.fn(() => 1);
    globalThis.cancelAnimationFrame = vi.fn();
  });

  afterEach(() => {
    GameBootUI.teardown();
    globalThis.requestAnimationFrame = originalRaf;
    globalThis.cancelAnimationFrame = originalCancelRaf;
    vi.useRealTimers();
  });

  it('shows save preview and stats blocks when meta and save data exist', () => {
    const doc = createMockDocument();
    const gs = {
      meta: { runCount: 3, totalKills: 19, bestChain: 7, runConfig: { ascension: 2 } },
      player: {
        class: 'mage',
        hp: 28,
        maxHp: 40,
        gold: 123,
        deck: [{}, {}, {}],
        hand: [{}, {}],
        items: [{ icon: '✦', name: '유물' }],
      },
      currentFloor: 4,
      currentRegion: 2,
    };

    const saveSystem = {
      loadMeta: vi.fn(),
      hasSave: vi.fn(() => true),
      loadRun: vi.fn(() => true),
    };

    GameBootUI.bootGame({
      doc,
      gs,
      audioEngine: {},
      runRules: { ensureMeta: vi.fn() },
      saveSystem,
      saveSystemDeps: {},
      initTitleCanvas: vi.fn(),
      updateUI: vi.fn(),
      refreshRunModePanel: vi.fn(),
    });

    expect(doc.elements.titleStatsBlock.style.display).toBe('block');
    expect(doc.elements.titleContinueWrap.style.display).toBe('block');
    expect(doc.elements.titleMenuDivider.style.display).toBe('block');
    expect(doc.elements.sttClass.textContent).toBe('마법사');
    expect(doc.elements.titleContinueMeta.textContent).toContain('4층');
    expect(doc.elements.sttDeckPills.innerHTML).toContain('덱 3장');
    expect(doc.elements.sttRelics.innerHTML).toContain('✦');
  });
  it('hides continue entry and clears preview when no save exists', () => {
    const doc = createMockDocument();
    const gs = {
      meta: { runCount: 1, totalKills: 0, bestChain: 0, runConfig: { ascension: 0 } },
      player: {},
      currentFloor: 1,
      currentRegion: 0,
    };

    const saveSystem = {
      hasSave: vi.fn(() => false),
      loadRun: vi.fn(() => false),
    };

    const hasSave = GameBootUI.refreshTitleSaveState({
      doc,
      gs,
      saveSystem,
    });

    expect(hasSave).toBe(false);
    expect(doc.elements.titleContinueWrap.style.display).toBe('none');
    expect(doc.elements.titleMenuDivider.style.display).toBe('none');
    expect(doc.elements.mainContinueBtn.disabled).toBe(true);
    expect(doc.elements.sttClass.textContent).toBe('-');
    expect(doc.elements.titleContinueMeta.textContent).toBe('');
    expect(doc.elements.sttDeckPills.innerHTML).toBe('');
    expect(doc.elements.sttRelics.innerHTML).toBe('');
  });

  it('hides continue entry when stored save cannot be loaded', () => {
    const doc = createMockDocument();
    const gs = {
      meta: { runCount: 1, totalKills: 0, bestChain: 0, runConfig: { ascension: 0 } },
      player: {},
      currentFloor: 1,
      currentRegion: 0,
    };

    const saveSystem = {
      hasSave: vi.fn(() => true),
      loadRun: vi.fn(() => false),
    };

    const hasSave = GameBootUI.refreshTitleSaveState({
      doc,
      gs,
      saveSystem,
    });

    expect(hasSave).toBe(false);
    expect(doc.elements.titleContinueWrap.style.display).toBe('none');
    expect(doc.elements.titleMenuDivider.style.display).toBe('none');
    expect(doc.elements.mainContinueBtn.disabled).toBe(true);
    expect(doc.elements.sttClass.textContent).toBe('-');
    expect(doc.elements.titleContinueMeta.textContent).toBe('');
    expect(doc.elements.sttDeckPills.innerHTML).toBe('');
    expect(doc.elements.sttRelics.innerHTML).toBe('');
  });

  it('boots keyboard navigation only once across repeated bootGame calls', () => {
    const doc = createMockDocument();
    const gs = {
      meta: { runCount: 1, totalKills: 0, bestChain: 0, runConfig: { ascension: 0 } },
      player: {},
      currentFloor: 1,
      currentRegion: 0,
    };
    const deps = {
      doc,
      gs,
      audioEngine: {},
      runRules: { ensureMeta: vi.fn() },
      saveSystem: { hasSave: vi.fn(() => false), loadRun: vi.fn(() => false), loadMeta: vi.fn() },
      saveSystemDeps: {},
      initTitleCanvas: vi.fn(),
      updateUI: vi.fn(),
      refreshRunModePanel: vi.fn(),
    };

    GameBootUI.bootGame(deps);
    GameBootUI.bootGame(deps);

    const keydownCalls = doc.addEventListener.mock.calls.filter(([name]) => name === 'keydown');
    const clickCalls = doc.addEventListener.mock.calls.filter(([name]) => name === 'click');

    expect(keydownCalls).toHaveLength(1);
    expect(clickCalls).toHaveLength(2);
  });
});
