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

const hoisted = vi.hoisted(() => ({
  preloadAssetDomainSpy: vi.fn(),
}));

vi.mock('../game/features/title/platform/browser/title_asset_runtime.js', () => ({
  preloadAssetDomain: hoisted.preloadAssetDomainSpy,
}));

import * as fx from '../game/features/title/presentation/browser/game_boot_ui_fx.js';
import * as helpers from '../game/features/title/presentation/browser/game_boot_ui_helpers.js';
import {
  bootGameRuntime,
  bootWhenReadyRuntime,
} from '../game/features/title/presentation/browser/game_boot_ui_runtime.js';

describe('game_boot_ui_runtime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    hoisted.preloadAssetDomainSpy.mockReset();
  });

  it('runs the boot orchestration and schedules title stats refresh', async () => {
    const statsBlock = { style: {} };
    const totalRuns = { id: 'titleTotalRuns' };
    const totalKills = { id: 'titleTotalKills' };
    const bestChain = { id: 'titleBestChain' };
    const doc = {
      visibilityState: 'visible',
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
      data: {
        assetManifest: { characters: { mage: {}, guardian: {} } },
      },
      saveSystem: {
        flushOutbox: vi.fn(() => 0),
        loadMeta: vi.fn(),
      },
      saveSystemDeps: { slot: 1 },
      initTitleCanvas: vi.fn(),
      updateUI: vi.fn(),
      refreshRunModePanel: vi.fn(),
    };

    bootGameRuntime(ui, deps);

    expect(doc.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), { once: false });
    expect(deps.saveSystem.flushOutbox).toHaveBeenCalledTimes(1);
    expect(deps.saveSystem.loadMeta).toHaveBeenCalledWith({ slot: 1 });
    expect(deps.runRules.ensureMeta).toHaveBeenCalledWith(deps.gs.meta);
    expect(deps.updateUI).toHaveBeenCalledTimes(1);
    expect(deps.refreshRunModePanel).toHaveBeenCalledTimes(1);
    expect(hoisted.preloadAssetDomainSpy).toHaveBeenCalledWith(deps.data, 'characters', expect.any(Object));
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
  }, 10000);

  it('flushes the outbox and refreshes title save state when the page becomes visible again', async () => {
    const doc = {
      visibilityState: 'hidden',
      addEventListener: vi.fn(),
      getElementById: vi.fn(() => null),
    };
    helpers.getDoc.mockReturnValue(doc);
    helpers.getWin.mockReturnValue(globalThis);

    const ui = {
      refreshTitleSaveState: vi.fn(),
    };
    const deps = {
      gs: { meta: {} },
      audioEngine: {},
      runRules: {
        ensureMeta: vi.fn(),
      },
      data: {
        assetManifest: { characters: { mage: {} } },
      },
      saveSystem: {
        flushOutbox: vi.fn(() => 0),
        loadMeta: vi.fn(),
      },
      saveSystemDeps: {},
      initTitleCanvas: vi.fn(),
      updateUI: vi.fn(),
      refreshRunModePanel: vi.fn(),
    };

    bootGameRuntime(ui, deps);

    const visibilityCall = doc.addEventListener.mock.calls.find(([name]) => name === 'visibilitychange');
    expect(visibilityCall).toBeTruthy();

    doc.visibilityState = 'visible';
    visibilityCall[1]();

    expect(deps.saveSystem.flushOutbox).toHaveBeenCalledTimes(2);
    expect(ui.refreshTitleSaveState).toHaveBeenCalledTimes(2);
  });

  it('waits for DOMContentLoaded before booting when the document is still loading', async () => {
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

  it('routes boot-time failures through an injected logger instead of console', async () => {
    const doc = {
      visibilityState: 'visible',
      addEventListener: vi.fn(),
      getElementById: vi.fn(() => null),
    };
    helpers.getDoc.mockReturnValue(doc);
    helpers.getWin.mockReturnValue(globalThis);

    const logger = {
      warn: vi.fn(),
      error: vi.fn(),
    };
    const ui = {
      refreshTitleSaveState: vi.fn(),
    };
    const deps = {
      gs: { meta: {} },
      logger,
      audioEngine: {},
      runRules: {
        ensureMeta: vi.fn(() => {
          throw new Error('ensure-meta-failed');
        }),
      },
      saveSystem: {
        flushOutbox: vi.fn(() => {
          throw new Error('flush-failed');
        }),
        loadMeta: vi.fn(() => {
          throw new Error('load-meta-failed');
        }),
      },
      updateUI: vi.fn(() => {
        throw new Error('update-ui-failed');
      }),
      refreshRunModePanel: vi.fn(),
    };

    bootGameRuntime(ui, deps);

    expect(logger.warn).toHaveBeenCalledWith('[GameBootUI] flushOutbox error:', expect.any(Error));
    expect(logger.error).toHaveBeenCalledWith('[GameBootUI] loadMeta error:', expect.any(Error));
    expect(logger.error).toHaveBeenCalledWith('[GameBootUI] ensureMeta error:', expect.any(Error));
    expect(logger.warn).toHaveBeenCalledWith('[GameBootUI] updateUI error:', expect.any(Error));
    expect(ui.refreshTitleSaveState).toHaveBeenCalledWith({
      doc,
      saveSystem: deps.saveSystem,
      gs: deps.gs,
    });
  });
});
