import { describe, expect, it, vi } from 'vitest';

import { createMazeRuntime } from '../game/features/run/application/create_maze_runtime.js';

describe('create_maze_runtime', () => {
  it('runs with injected browser/runtime ports instead of importing browser modules directly', () => {
    const presenter = {
      draw: vi.fn(),
      resize: vi.fn(),
      updateHud: vi.fn(),
    };
    const handleMazeExit = vi.fn();
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    const dom = {
      getCanvas: vi.fn(() => ({ getContext: vi.fn(() => ({})) })),
      getMinimap: vi.fn(() => ({ getContext: vi.fn(() => ({})) })),
      getWin: vi.fn(() => ({
        addEventListener,
        removeEventListener,
        requestAnimationFrame: vi.fn(),
        setTimeout: vi.fn((fn) => fn()),
      })),
      hideOverlay: vi.fn(),
      removeGuide: vi.fn(),
      showOverlay: vi.fn(),
    };

    const runtime = createMazeRuntime({
      mazeDom: dom,
      createMazePresenter: vi.fn(() => presenter),
      prepareMazeOpenState: vi.fn(() => ({
        pendingCombat: true,
        stepCount: 0,
        W: 2,
        H: 2,
        map: [[0, 1], [1, 0]],
        px: 0,
        py: 0,
        fovActive: true,
      })),
      resolveMazeMove: vi.fn(() => ({
        moved: true,
        px: 1,
        py: 1,
        stepCount: 1,
        shouldExit: true,
      })),
      handleMazeExit,
    });

    runtime.open(false);
    runtime.move(1, 0);

    expect(dom.showOverlay).toHaveBeenCalledTimes(1);
    expect(presenter.resize).toHaveBeenCalledTimes(1);
    expect(presenter.updateHud).toHaveBeenCalledTimes(2);
    expect(presenter.draw).toHaveBeenCalledTimes(2);
    expect(addEventListener).toHaveBeenCalledWith('resize', presenter.resize);
    expect(removeEventListener).toHaveBeenCalledWith('resize', presenter.resize);
    expect(handleMazeExit).toHaveBeenCalledWith(expect.objectContaining({
      pendingCombat: true,
      setTimeoutFn: expect.any(Function),
    }));
  });
});
