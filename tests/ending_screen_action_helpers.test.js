import { describe, expect, it, vi } from 'vitest';

import {
  resolveEndingActions,
  restartHiddenEndingOverlay,
  scheduleEndingRestartAction,
} from '../game/features/ui/public.js';

describe('ending_screen_action_helpers', () => {
  it('prefers injected ending runtime accessors over browser defaults', () => {
    const cleanup = vi.fn();
    const restart = vi.fn();
    const getEndingDoc = vi.fn(() => ({ id: 'doc' }));
    const getEndingWin = vi.fn(() => ({
      setTimeout(fn, delay) {
        fn();
        return delay;
      },
    }));

    scheduleEndingRestartAction({
      endingActions: { restart },
      getEndingDoc,
      getEndingWin,
    }, {
      cleanup,
      delayMs: 25,
    });

    expect(getEndingDoc).toHaveBeenCalledTimes(1);
    expect(getEndingWin).toHaveBeenCalled();
    expect(cleanup).toHaveBeenCalledWith({
      doc: { id: 'doc' },
      win: expect.objectContaining({
        setTimeout: expect.any(Function),
      }),
    });
  });

  it('prefers endingActions callbacks when resolving action handles', () => {
    const restart = vi.fn();
    const selectFragment = vi.fn();
    const openCodex = vi.fn();

    const resolved = resolveEndingActions({
      endingActions: {
        restart,
        selectFragment,
        openCodex,
      },
      restartEndingFlow: vi.fn(),
      selectEndingFragment: vi.fn(),
      openEndingCodex: vi.fn(),
    });

    resolved.restart();
    resolved.selectFragment('echo_boost');
    resolved.openCodex();

    expect(restart).toHaveBeenCalledTimes(1);
    expect(selectFragment).toHaveBeenCalledWith('echo_boost');
    expect(openCodex).toHaveBeenCalledTimes(1);
  });

  it('schedules cleanup and restart through the shared restart action', () => {
    const restart = vi.fn();
    const cleanup = vi.fn();
    const scheduled = [];
    const session = { timers: [] };

    const timer = scheduleEndingRestartAction({
      doc: { id: 'doc' },
      win: {
        setTimeout(fn, delay) {
          scheduled.push(delay);
          fn();
          return delay;
        },
      },
      endingActions: { restart },
    }, {
      cleanup,
      session,
    });

    expect(timer).toBe(420);
    expect(scheduled).toEqual([420]);
    expect(cleanup).toHaveBeenCalledWith({
      doc: { id: 'doc' },
      win: {
        setTimeout: expect.any(Function),
      },
    });
    expect(restart).toHaveBeenCalledTimes(1);
    expect(session.timers).toEqual([420]);
  });

  it('restarts the hidden ending overlay through the shared action resolver', () => {
    const restart = vi.fn();

    restartHiddenEndingOverlay({
      endingActions: { restart },
      restartEndingFlow: vi.fn(),
    });

    expect(restart).toHaveBeenCalledTimes(1);
  });
});
