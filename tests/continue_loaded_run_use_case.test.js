import { describe, expect, it, vi } from 'vitest';

import { continueLoadedRunUseCase } from '../game/features/run/application/continue_loaded_run_use_case.js';

describe('continue_loaded_run_use_case', () => {
  it('loads a saved run and resumes gameplay through run feature handoff deps', () => {
    const deps = {
      currentRegion: 3,
      markGameStarted: vi.fn(),
      switchScreen: vi.fn(),
      audioEngine: { startAmbient: vi.fn() },
      updateUI: vi.fn(),
      updateClassSpecialUI: vi.fn(),
      initGameCanvas: vi.fn(),
      gameLoop: vi.fn(),
      requestAnimationFrame: vi.fn(),
      loadRun: vi.fn(() => true),
      onBeforeResume: vi.fn(),
      onAfterCanvasReady: vi.fn(),
      setTimeoutFn: vi.fn((fn) => fn()),
    };

    const result = continueLoadedRunUseCase(deps);

    expect(result).toBe(true);
    expect(deps.onBeforeResume).toHaveBeenCalledWith(expect.objectContaining({
      switchScreen: deps.switchScreen,
      audioEngine: deps.audioEngine,
    }));
    expect(deps.markGameStarted).toHaveBeenCalledTimes(1);
    expect(deps.switchScreen).toHaveBeenCalledWith('game');
    expect(deps.audioEngine.startAmbient).toHaveBeenCalledWith(3);
    expect(deps.updateUI).toHaveBeenCalledTimes(1);
    expect(deps.updateClassSpecialUI).toHaveBeenCalledTimes(1);
    expect(deps.initGameCanvas).toHaveBeenCalledTimes(1);
    expect(deps.requestAnimationFrame).toHaveBeenCalledWith(deps.gameLoop);
    expect(deps.onAfterCanvasReady).toHaveBeenCalledWith(expect.objectContaining({
      initGameCanvas: deps.initGameCanvas,
    }));
  });

  it('returns false when no saved run is loaded', () => {
    expect(continueLoadedRunUseCase({
      loadRun: vi.fn(() => false),
    })).toBe(false);
  });
});
