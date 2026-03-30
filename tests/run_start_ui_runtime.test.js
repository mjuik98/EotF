import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearIdempotencyPrefix } from '../game/utils/idempotency_utils.js';
import { enterRunRuntime } from '../game/features/run/public.js';

vi.mock('../game/platform/browser/effects/echo_ripple_transition.js', () => ({
  startEchoRippleDissolve: vi.fn((overlayEl, deps = {}) => {
    overlayEl?.remove?.();
    deps.onComplete?.();
  }),
}));

function createMockElement() {
  return {
    style: {},
    remove: vi.fn(),
  };
}

function createMockDoc() {
  const mainTitleSubScreen = { style: {} };
  const charSelectSubScreen = { style: {} };

  return {
    body: {
      appendChild: vi.fn(),
    },
    createElement: vi.fn(() => createMockElement()),
    getElementById: vi.fn((id) => {
      if (id === 'mainTitleSubScreen') return mainTitleSubScreen;
      if (id === 'charSelectSubScreen') return charSelectSubScreen;
      return null;
    }),
  };
}

function createDeps(overrides = {}) {
  const doc = createMockDoc();
  const requestAnimationFrame = vi.fn((cb) => {
    if (typeof cb === 'function') cb();
    return 1;
  });

  return {
    gs: {
      worldMemory: {
        savedMerchant: 1,
        killed_ancient_echo: true,
      },
    },
    doc,
    win: {
      requestAnimationFrame,
      cancelAnimationFrame: vi.fn(),
    },
    requestAnimationFrame,
    cancelAnimationFrame: vi.fn(),
    switchScreen: vi.fn(),
    markGameStarted: vi.fn(),
    generateMap: vi.fn(),
    audioEngine: { startAmbient: vi.fn() },
    updateUI: vi.fn(),
    updateClassSpecialUI: vi.fn(),
    initGameCanvas: vi.fn(),
    gameLoop: vi.fn(),
    showWorldMemoryNotice: vi.fn(),
    showRunFragment: vi.fn(() => false),
    ...overrides,
  };
}

describe('run_start_ui_runtime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearIdempotencyPrefix('run:enter-run');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows combined world-memory notice after gameplay starts', () => {
    const deps = createDeps({
      gs: {
        worldMemory: {
          savedMerchant: 2,
          killed_ancient_echo: true,
        },
      },
    });

    enterRunRuntime(deps);
    vi.advanceTimersByTime(330);
    vi.advanceTimersByTime(1000);

    expect(deps.showWorldMemoryNotice).toHaveBeenCalledTimes(1);
    expect(deps.showWorldMemoryNotice.mock.calls[0][0]).toContain('상인들이 당신을 기억한다');
    expect(deps.showWorldMemoryNotice.mock.calls[0][0]).toContain('태고의 잔향이 기다린다');
  });

  it('uses the injected runtime scheduler for canvas handoff and world-memory notice work', () => {
    const scheduled = [];
    const deps = createDeps({
      setTimeoutFn: vi.fn((callback, delayMs) => {
        scheduled.push({ callback, delayMs });
        return scheduled.length;
      }),
      gs: {
        worldMemory: {
          savedMerchant: 1,
        },
      },
    });

    enterRunRuntime(deps);
    vi.advanceTimersByTime(330);

    expect(deps.setTimeoutFn).toHaveBeenCalledTimes(2);
    expect(scheduled.map(({ delayMs }) => delayMs)).toEqual([80, 1000]);

    scheduled[0].callback();
    expect(deps.initGameCanvas).toHaveBeenCalledTimes(1);
    expect(deps.gameLoop).toHaveBeenCalledTimes(1);

    scheduled[1].callback();
    expect(deps.showWorldMemoryNotice).toHaveBeenCalledWith('상인들이 당신을 기억한다');
  });
});
