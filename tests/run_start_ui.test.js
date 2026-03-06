import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearIdempotencyPrefix } from '../game/utils/idempotency_utils.js';
import { RunStartUI } from '../game/ui/run/run_start_ui.js';
import { startEchoRippleDissolve } from '../game/ui/effects/echo_ripple_transition.js';

vi.mock('../game/ui/effects/echo_ripple_transition.js', () => ({
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
    refs: {
      mainTitleSubScreen,
      charSelectSubScreen,
    },
  };
}

function createDeps(overrides = {}) {
  const doc = createMockDoc();
  const requestAnimationFrame = vi.fn((cb) => {
    if (typeof cb === 'function') cb();
    return 1;
  });

  return {
    gs: { worldMemory: {} },
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

describe('RunStartUI transition flow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    clearIdempotencyPrefix('run:enter-run');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('skips fallback ripple when pre-run ripple already played and enters after stage fade', () => {
    const deps = createDeps();
    deps.gs._preRunRipplePlayed = true;

    RunStartUI.enterRun(deps);

    expect(deps.showRunFragment).toHaveBeenCalledTimes(1);
    expect(startEchoRippleDissolve).not.toHaveBeenCalled();
    expect(deps.switchScreen).not.toHaveBeenCalled();
    expect(deps.doc.body.appendChild).toHaveBeenCalledTimes(1);
    expect(deps.doc.body.appendChild.mock.calls[0][0].style.cssText).toContain('opacity:1');

    vi.advanceTimersByTime(330);
    expect(deps.switchScreen).toHaveBeenCalledWith('game');
    expect(deps.doc.refs.mainTitleSubScreen.style.display).toBe('');
    expect(deps.doc.refs.charSelectSubScreen.style.display).toBe('none');
  });

  it('plays fallback ripple when no run fragment is available and pre-run ripple was not played', () => {
    const deps = createDeps();

    RunStartUI.enterRun(deps);

    expect(deps.showRunFragment).toHaveBeenCalledTimes(1);
    expect(startEchoRippleDissolve).toHaveBeenCalledTimes(1);
    expect(deps.switchScreen).not.toHaveBeenCalled();

    vi.advanceTimersByTime(330);
    expect(deps.switchScreen).toHaveBeenCalledWith('game');

    vi.advanceTimersByTime(80);
    expect(deps.initGameCanvas).toHaveBeenCalledTimes(1);
    expect(deps.gameLoop).toHaveBeenCalledTimes(1);
  });

  it('waits for fragment close callback when a run fragment is shown', () => {
    let closeCallback = null;
    const deps = createDeps({
      showRunFragment: vi.fn((options = {}) => {
        closeCallback = options.onFragmentClosed;
        return true;
      }),
    });

    RunStartUI.enterRun(deps);

    expect(deps.showRunFragment).toHaveBeenCalledTimes(1);
    expect(deps.showRunFragment.mock.calls[0][0].closeEffect).toBe('none');
    expect(startEchoRippleDissolve).not.toHaveBeenCalled();
    expect(deps.switchScreen).not.toHaveBeenCalled();

    expect(typeof closeCallback).toBe('function');
    closeCallback();

    expect(deps.switchScreen).not.toHaveBeenCalled();
    vi.advanceTimersByTime(330);
    expect(deps.switchScreen).toHaveBeenCalledWith('game');
    expect(deps.markGameStarted).toHaveBeenCalledTimes(1);
  });
});
