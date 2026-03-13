import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../game/features/title/presentation/browser/game_boot_ui_fx.js', () => ({
  countUp: vi.fn(),
  setupKeyboardNav: vi.fn(),
  startAudioWave: vi.fn(),
  startLoreTicker: vi.fn(),
}));

vi.mock('../game/features/title/presentation/browser/game_boot_ui_helpers.js', () => ({
  getDoc: vi.fn(),
  getWin: vi.fn(),
}));

describe('game_boot_ui_runtime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('runs the boot orchestration and schedules title stats refresh', async () => {
    const helpers = await import('../game/features/title/presentation/browser/game_boot_ui_helpers.js');
    const fx = await import('../game/features/title/presentation/browser/game_boot_ui_fx.js');
    const { bootGameRuntime } = await import('../game/features/title/presentation/browser/game_boot_ui_runtime.js');
    const statsBlock = { style: {} };
    const totalRuns = { id: 'titleTotalRuns' };
    const totalKills = { id: 'titleTotalKills' };
    const bestChain = { id: 'titleBestChain' };
    const doc = {
      addEventListener: vi.fn(),
      getElementById: vi.fn((id) => {
        if (id === 'titleStatsBlock') return statsBlock;
        if (id === 'titleTotalRuns') return totalRuns;
        if (id === 'titleTotalKills') return totalKills;
        if (id === 'titleBestChain') return bestChain;
        return null;
      }),
    };
    helpers.getDoc.mockReturnValue(doc);
    helpers.getWin.mockReturnValue(globalThis);

    const ui = {
      refreshTitleSaveState: vi.fn(),
    };
    const deps = {
      gs: {
        meta: {
          runCount: 4,
          totalKills: 17,
          bestChain: 9,
        },
      },
      audioEngine: {
        init: vi.fn(),
        resume: vi.fn(),
      },
      runRules: {
        ensureMeta: vi.fn(),
      },
      saveSystem: {
        loadMeta: vi.fn(),
      },
      saveSystemDeps: { slot: 1 },
      initTitleCanvas: vi.fn(),
      updateUI: vi.fn(),
      refreshRunModePanel: vi.fn(),
    };

    bootGameRuntime(ui, deps);

    expect(doc.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), { once: false });
    expect(deps.saveSystem.loadMeta).toHaveBeenCalledWith({ slot: 1 });
    expect(deps.runRules.ensureMeta).toHaveBeenCalledWith(deps.gs.meta);
    expect(deps.updateUI).toHaveBeenCalledTimes(1);
    expect(deps.refreshRunModePanel).toHaveBeenCalledTimes(1);
    expect(fx.startAudioWave).toHaveBeenCalledWith(doc, expect.objectContaining({
      win: globalThis,
    }));
    expect(fx.startLoreTicker).toHaveBeenCalledWith(doc, expect.objectContaining({
      win: globalThis,
      setTimeout: expect.any(Function),
      clearTimeout: expect.any(Function),
      setInterval: expect.any(Function),
      clearInterval: expect.any(Function),
    }));
    expect(fx.setupKeyboardNav).toHaveBeenCalledWith(doc);
    expect(ui.refreshTitleSaveState).toHaveBeenCalledWith({
      doc,
      saveSystem: deps.saveSystem,
      gs: deps.gs,
    });

    vi.advanceTimersByTime(100);
    expect(deps.initTitleCanvas).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(250);
    expect(statsBlock.style.display).toBe('block');
    expect(fx.countUp).toHaveBeenCalledTimes(3);
    expect(fx.countUp).toHaveBeenNthCalledWith(1, totalRuns, 3, 1100);
    expect(fx.countUp).toHaveBeenNthCalledWith(2, totalKills, 17, 1250);
    expect(fx.countUp).toHaveBeenNthCalledWith(3, bestChain, 9, 1350);
  });

  it('waits for DOMContentLoaded before booting when the document is still loading', async () => {
    const helpers = await import('../game/features/title/presentation/browser/game_boot_ui_helpers.js');
    const { bootWhenReadyRuntime } = await import('../game/features/title/presentation/browser/game_boot_ui_runtime.js');
    const doc = {
      readyState: 'loading',
      addEventListener: vi.fn(),
    };
    helpers.getDoc.mockReturnValue(doc);
    helpers.getWin.mockReturnValue(globalThis);

    const ui = {
      bootGame: vi.fn(),
    };
    const deps = { marker: true };

    const ready = bootWhenReadyRuntime(ui, deps);

    expect(ready).toBe(false);
    expect(doc.addEventListener).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));

    const [, onReady] = doc.addEventListener.mock.calls[0];
    onReady();

    expect(ui.bootGame).toHaveBeenCalledWith(deps);
  });
});
