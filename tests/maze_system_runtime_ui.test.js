import { describe, expect, it, vi } from 'vitest';

import {
  handleMazeExit,
  prepareMazeOpenState,
  resolveMazeMove,
} from '../game/ui/map/maze_system_runtime_ui.js';

describe('maze_system_runtime_ui', () => {
  it('prepares maze open state from the fov engine', () => {
    const map = [[1, 1], [1, 0]];
    const fovEngine = {
      generateMaze: vi.fn(),
      getSize: vi.fn(() => ({ W: 2, H: 2 })),
      getMap: vi.fn(() => map),
    };

    const result = prepareMazeOpenState(fovEngine, true);

    expect(fovEngine.generateMaze).toHaveBeenCalledWith(21, 13);
    expect(result).toEqual({
      pendingCombat: 'boss',
      stepCount: 0,
      W: 2,
      H: 2,
      map,
      px: 1,
      py: 1,
      fovActive: true,
    });
  });

  it('resolves blocked and successful moves with exit detection', () => {
    const map = [
      [1, 1, 1, 1],
      [1, 0, 1, 1],
      [1, 0, 0, 1],
      [1, 1, 1, 1],
    ];

    expect(resolveMazeMove({
      dx: 1,
      dy: 0,
      px: 1,
      py: 1,
      map,
      stepCount: 0,
      W: 4,
      H: 4,
    })).toMatchObject({
      moved: false,
      px: 1,
      py: 1,
      stepCount: 0,
      shouldExit: false,
    });

    expect(resolveMazeMove({
      dx: 0,
      dy: 1,
      px: 1,
      py: 1,
      map,
      stepCount: 0,
      W: 4,
      H: 4,
    })).toMatchObject({
      moved: true,
      px: 1,
      py: 2,
      stepCount: 1,
      shouldExit: false,
    });

    expect(resolveMazeMove({
      dx: 1,
      dy: 0,
      px: 1,
      py: 2,
      map,
      stepCount: 1,
      W: 4,
      H: 4,
    })).toMatchObject({
      moved: true,
      px: 2,
      py: 2,
      stepCount: 2,
      shouldExit: true,
    });
  });

  it('shows notice and schedules combat start on exit', () => {
    const setTimeoutFn = vi.fn((fn, delay) => {
      fn();
      return delay;
    });
    const showWorldMemoryNotice = vi.fn();
    const startCombat = vi.fn();

    handleMazeExit({
      pendingCombat: 'boss',
      showWorldMemoryNotice,
      startCombat,
      setTimeoutFn,
    });

    expect(showWorldMemoryNotice).toHaveBeenCalledWith('🚪 출구 발견! 전투가 시작된다...');
    expect(setTimeoutFn).toHaveBeenCalledWith(expect.any(Function), 800);
    expect(startCombat).toHaveBeenCalledWith(true);
  });
});
