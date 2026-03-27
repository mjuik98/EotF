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
    titleRecentRuns: { ...makeElement(), id: 'titleRecentRuns' },
    titleRunArchive: { ...makeElement(), id: 'titleRunArchive' },
    titleRecoveryPanel: { ...makeElement(), id: 'titleRecoveryPanel' },
    titleRecoveryRetryBtn: { ...makeElement(), id: 'titleRecoveryRetryBtn' },
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
    visibilityState: 'visible',
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
      meta: {
        runCount: 3,
        totalKills: 19,
        bestChain: 7,
        runConfig: { ascension: 2 },
        recentRuns: [
          { outcome: 'victory', classId: 'mage', ascension: 2, maxChain: 7 },
        ],
      },
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
    expect(doc.elements.titleRecentRuns.innerHTML).toContain('최근 귀환');
    expect(doc.elements.titleRecentRuns.innerHTML).toContain('승리');
  });

  it('renders continue preview from saved data without hydrating the live gs', () => {
    const doc = createMockDocument();
    const gs = {
      meta: { runCount: 2, totalKills: 3, bestChain: 1, runConfig: { ascension: 0 } },
      player: {
        class: 'rogue',
        hp: 11,
        maxHp: 22,
        gold: 7,
        deck: [{ id: 'live' }],
        hand: [{ id: 'live-hand' }],
        items: [{ icon: 'L', name: 'Live Relic' }],
      },
      currentFloor: 9,
      currentRegion: 4,
    };

    const preview = {
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
      meta: {
        runConfig: { ascension: 4 },
      },
    };

    const saveSystem = {
      loadMeta: vi.fn(),
      hasSave: vi.fn(() => true),
      readRunPreview: vi.fn(() => preview),
      loadRun: vi.fn(() => true),
    };

    GameBootUI.refreshTitleSaveState({
      doc,
      gs,
      saveSystem,
    });

    expect(saveSystem.readRunPreview).toHaveBeenCalledTimes(1);
    expect(saveSystem.loadRun).not.toHaveBeenCalled();
    expect(doc.elements.sttClass.textContent).toBe('마법사');
    expect(doc.elements.titleContinueMeta.textContent).toContain('4층');
    expect(doc.elements.sttAscension.textContent).toBe('A4');
    expect(doc.elements.titleContinueMeta.textContent).toContain('A4');
    expect(gs.player.class).toBe('rogue');
    expect(gs.currentFloor).toBe(9);
    expect(gs.currentRegion).toBe(4);
  });

  it('marks queued continue previews as recovery-pending on the title screen', () => {
    const doc = createMockDocument();
    const gs = {
      meta: { runCount: 2, totalKills: 3, bestChain: 1, runConfig: { ascension: 0 } },
      player: {
        class: 'rogue',
        hp: 11,
        maxHp: 22,
        gold: 7,
        deck: [{ id: 'live' }],
        hand: [{ id: 'live-hand' }],
        items: [{ icon: 'L', name: 'Live Relic' }],
      },
      currentFloor: 9,
      currentRegion: 4,
    };
    const saveSystem = {
      flushOutbox: vi.fn(() => 1),
      hasSave: vi.fn(() => true),
      readRunPreview: vi.fn(() => ({
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
        saveState: 'queued',
        meta: {
          runConfig: { ascension: 4 },
        },
      })),
    };

    const hasSave = GameBootUI.refreshTitleSaveState({
      doc,
      gs,
      saveSystem,
    });

    expect(hasSave).toBe(true);
    expect(saveSystem.flushOutbox).toHaveBeenCalledTimes(1);
    expect(doc.elements.titleContinueMeta.textContent).toContain('복구 대기');
    expect(doc.elements.sttDeckPills.innerHTML).toContain('복구 대기');
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

  it('renders up to three recent run chips on the title stats panel', () => {
    const doc = createMockDocument();
    const gs = {
      meta: {
        runCount: 6,
        totalKills: 33,
        bestChain: 14,
        runConfig: { ascension: 0 },
        recentRuns: [
          { outcome: 'victory', classId: 'guardian', ascension: 3, maxChain: 14, curseId: 'tax' },
          { outcome: 'defeat', classId: 'berserker', ascension: 1, maxChain: 8 },
          { outcome: 'abandon', classId: 'hunter', ascension: 0, maxChain: 3, endless: true },
          { outcome: 'victory', classId: 'mage', ascension: 4, maxChain: 12 },
        ],
      },
      player: {},
      currentFloor: 1,
      currentRegion: 0,
    };

    GameBootUI.bootGame({
      doc,
      gs,
      audioEngine: {},
      runRules: { ensureMeta: vi.fn() },
      saveSystem: { hasSave: vi.fn(() => false), loadRun: vi.fn(() => false), loadMeta: vi.fn() },
      saveSystemDeps: {},
      initTitleCanvas: vi.fn(),
      updateUI: vi.fn(),
      refreshRunModePanel: vi.fn(),
    });

    expect(doc.elements.titleRecentRuns.innerHTML).toContain('마법사');
    expect(doc.elements.titleRecentRuns.innerHTML).toContain('광전사');
    expect(doc.elements.titleRecentRuns.innerHTML).toContain('사냥꾼');
    expect(doc.elements.titleRecentRuns.innerHTML).not.toContain('수호자');
  });

  it('renders a recent run archive list with unlock and achievement summaries', () => {
    const doc = createMockDocument();
    const gs = {
      meta: {
        runCount: 8,
        totalKills: 57,
        bestChain: 15,
        progress: {
          victories: 2,
          cursedVictories: 0,
          failures: 1,
        },
        achievements: {
          states: {
            first_victory: { unlocked: true },
          },
        },
        runConfig: { ascension: 0 },
        recentRuns: [
          { runNumber: 3, outcome: 'victory', classId: 'guardian', ascension: 3, maxChain: 14, unlockCount: 0, achievementCount: 1, kills: 11, floor: 8 },
          { runNumber: 4, outcome: 'defeat', classId: 'berserker', ascension: 1, maxChain: 8, unlockCount: 1, achievementCount: 0, kills: 9, floor: 5 },
          { runNumber: 5, outcome: 'abandon', classId: 'hunter', ascension: 0, maxChain: 3, endless: true, unlockCount: 0, achievementCount: 0, kills: 4, floor: 3 },
          { runNumber: 6, outcome: 'victory', classId: 'mage', ascension: 4, maxChain: 12, unlockCount: 2, achievementCount: 1, kills: 17, floor: 8 },
          { runNumber: 7, outcome: 'defeat', classId: 'paladin', ascension: 2, maxChain: 6, unlockCount: 0, achievementCount: 0, kills: 6, floor: 4 },
        ],
      },
      player: {},
      currentFloor: 1,
      currentRegion: 0,
    };

    GameBootUI.refreshTitleSaveState({
      doc,
      gs,
      saveSystem: { hasSave: vi.fn(() => false), loadRun: vi.fn(() => false), flushOutbox: vi.fn(() => 0), getOutboxMetrics: vi.fn(() => ({ queueDepth: 0 })) },
    });

    expect(doc.elements.titleRunArchive.innerHTML).toContain('귀환 기록실');
    expect(doc.elements.titleRunArchive.innerHTML).toContain('Run 7');
    expect(doc.elements.titleRunArchive.innerHTML).toContain('Run 6');
    expect(doc.elements.titleRunArchive.innerHTML).toContain('해금 2');
    expect(doc.elements.titleRunArchive.innerHTML).toContain('업적 1');
    expect(doc.elements.titleRunArchive.innerHTML).toContain('처치 17');
    expect(doc.elements.titleRunArchive.innerHTML).toContain('다음 업적');
    expect(doc.elements.titleRunArchive.innerHTML).toContain('상인의 인연');
    expect(doc.elements.titleRunArchive.innerHTML).toContain('0 / 1');
  });

  it('shows an explicit recovery panel and retries queued outbox saves on demand', () => {
    const doc = createMockDocument();
    const gs = {
      meta: { runCount: 2, totalKills: 3, bestChain: 1, runConfig: { ascension: 0 } },
      player: {},
    };
    const saveSystem = {
      flushOutbox: vi.fn(() => 0),
      hasSave: vi.fn(() => true),
      readRunPreview: vi.fn(() => ({
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
        saveState: 'queued',
        meta: {
          runConfig: { ascension: 4 },
        },
      })),
      getOutboxMetrics: vi.fn()
        .mockReturnValueOnce({
          queueDepth: 2,
          nextRetryAt: new Date('2026-01-01T00:00:05Z').getTime(),
          retryFailures: 1,
          lastFailureAt: new Date('2025-12-31T23:59:57Z').getTime(),
        })
        .mockReturnValueOnce({
          queueDepth: 0,
          nextRetryAt: 0,
          retryFailures: 1,
        }),
      showSaveStatus: vi.fn(),
    };

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

    GameBootUI.refreshTitleSaveState({
      doc,
      gs,
      saveSystem,
    });

    expect(doc.elements.titleRecoveryPanel.innerHTML).toContain('복구 대기 저장');
    expect(doc.elements.titleRecoveryPanel.innerHTML).toContain('2건');
    expect(doc.elements.titleRecoveryPanel.innerHTML).toContain('재시도 실패 1회');
    expect(doc.elements.titleRecoveryPanel.innerHTML).toContain('마지막 실패 3초 전');
    expect(doc.elements.titleRecoveryRetryBtn.addEventListener).toHaveBeenCalledTimes(1);

    const retryHandler = doc.elements.titleRecoveryRetryBtn.addEventListener.mock.calls[0][1];
    retryHandler();

    expect(saveSystem.flushOutbox).toHaveBeenCalledTimes(2);
    expect(saveSystem.showSaveStatus).toHaveBeenCalledWith({
      status: 'saved',
      persisted: true,
      queueDepth: 0,
    }, expect.objectContaining({ doc }));
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
