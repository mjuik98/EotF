import { describe, expect, it, vi } from 'vitest';

import { Actions } from '../game/core/store/state_actions.js';
import { changeScreenState } from '../game/features/ui/state/screen_state_commands.js';

describe('screen_state_commands', () => {
  it('falls back to local reducer semantics when dispatch is unavailable', () => {
    const gs = {
      currentScreen: 'combat',
    };

    expect(changeScreenState(gs, 'reward')).toEqual({
      prev: 'combat',
      current: 'reward',
    });
    expect(gs.currentScreen).toBe('reward');
  });

  it('uses dispatch when available', () => {
    const gs = {
      currentScreen: 'combat',
      dispatch: vi.fn(() => ({ prev: 'combat', current: 'title' })),
    };

    expect(changeScreenState(gs, 'title')).toEqual({
      prev: 'combat',
      current: 'title',
    });
    expect(gs.dispatch).toHaveBeenCalledWith(Actions.SCREEN_CHANGE, { screen: 'title' });
  });
});
