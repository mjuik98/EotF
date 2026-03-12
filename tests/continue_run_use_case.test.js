import { describe, expect, it, vi } from 'vitest';

import { continueRunUseCase } from '../game/app/title/use_cases/continue_run_use_case.js';

describe('continue_run_use_case', () => {
  it('prefers the run feature resume handoff when provided', () => {
    const resumeRun = vi.fn(() => true);
    const loadRun = vi.fn(() => true);
    const onBeforeResume = vi.fn();
    const onAfterCanvasReady = vi.fn();
    const setTimeoutFn = vi.fn();

    const result = continueRunUseCase({
      currentRegion: 3,
      resumeRun,
      loadRun,
      onBeforeResume,
      onAfterCanvasReady,
      setTimeoutFn,
    });

    expect(result).toBe(true);
    expect(resumeRun).toHaveBeenCalledWith({
      currentRegion: 3,
      loadRun,
      onBeforeResume,
      onAfterCanvasReady,
      setTimeoutFn,
    });
  });

  it('returns false when no save data is loaded', () => {
    const getRunStartDeps = vi.fn();

    const result = continueRunUseCase({
      getRunStartDeps,
      loadRun: vi.fn(() => false),
    });

    expect(result).toBe(false);
    expect(getRunStartDeps).not.toHaveBeenCalled();
  });

  it('falls back to the legacy run start deps path when no feature handoff exists', () => {
    const runStartDeps = {
      markGameStarted: vi.fn(),
      switchScreen: vi.fn(),
      audioEngine: { startAmbient: vi.fn() },
      updateUI: vi.fn(),
      updateClassSpecialUI: vi.fn(),
      initGameCanvas: vi.fn(),
      gameLoop: vi.fn(),
      requestAnimationFrame: vi.fn(),
    };
    const setTimeoutFn = vi.fn((fn) => fn());
    const onBeforeResume = vi.fn();
    const onAfterCanvasReady = vi.fn();

    const result = continueRunUseCase({
      currentRegion: 3,
      getRunStartDeps: () => runStartDeps,
      loadRun: vi.fn(() => true),
      onBeforeResume,
      onAfterCanvasReady,
      setTimeoutFn,
    });

    expect(result).toBe(true);
    expect(onBeforeResume).toHaveBeenCalledWith(runStartDeps);
    expect(runStartDeps.markGameStarted).toHaveBeenCalledTimes(1);
    expect(runStartDeps.switchScreen).toHaveBeenCalledWith('game');
    expect(runStartDeps.audioEngine.startAmbient).toHaveBeenCalledWith(3);
    expect(runStartDeps.updateUI).toHaveBeenCalledTimes(1);
    expect(runStartDeps.updateClassSpecialUI).toHaveBeenCalledTimes(1);
    expect(setTimeoutFn).toHaveBeenCalledTimes(1);
    expect(runStartDeps.initGameCanvas).toHaveBeenCalledTimes(1);
    expect(runStartDeps.requestAnimationFrame).toHaveBeenCalledWith(runStartDeps.gameLoop);
    expect(onAfterCanvasReady).toHaveBeenCalledWith(runStartDeps);
  });
});
