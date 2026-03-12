import { describe, expect, it, vi } from 'vitest';

import {
  applyMetaFragmentSelection,
  restartFromEndingAction,
  selectMetaFragmentAction,
} from '../game/features/title/application/meta_progression_actions.js';

describe('meta_progression_actions', () => {
  it('applies known meta fragment effects and consumes an echo fragment', () => {
    const meta = {
      echoFragments: 2,
      inscriptions: {},
    };

    expect(applyMetaFragmentSelection('fortune', meta)).toBe(true);
    expect(meta.echoFragments).toBe(1);
    expect(meta.inscriptions.fortune).toBe(true);
    expect(applyMetaFragmentSelection('unknown', meta)).toBe(false);
  });

  it('cleans up and schedules title return when selecting a fragment', () => {
    const cleanup = vi.fn();
    const completeTitleReturn = vi.fn();
    const setTimeoutFn = vi.fn((fn) => fn());
    const deps = {
      gs: {
        meta: {
          echoFragments: 3,
          inscriptions: {},
        },
      },
      completeTitleReturn,
    };

    const selected = selectMetaFragmentAction('echo_boost', deps, {
      cleanup,
      setTimeoutFn,
    });

    expect(selected).toBe(true);
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(setTimeoutFn).toHaveBeenCalledWith(expect.any(Function), 500);
    expect(completeTitleReturn).toHaveBeenCalledTimes(1);
    expect(deps.gs.meta.inscriptions.echo_boost).toBe(true);
  });

  it('reuses completeTitleReturn when restarting from ending', () => {
    const cleanup = vi.fn();
    const completeTitleReturn = vi.fn();

    restartFromEndingAction({ completeTitleReturn }, { cleanup });

    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(completeTitleReturn).toHaveBeenCalledTimes(1);
  });
});
