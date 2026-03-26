import { describe, expect, it, vi } from 'vitest';

import { createCharacterSelectMountActions } from '../game/features/title/application/character_select_actions.js';

describe('character_select_actions', () => {
  it('normalizes selected character keys through class metadata before starting the run', () => {
    const fns = {
      selectClass: vi.fn(),
      startGame: vi.fn(),
    };
    const actions = createCharacterSelectMountActions({ fns });

    actions.onConfirm({ class: 'guardian', id: 6 });
    actions.onStart({ class: 'guardian', id: 6 });

    expect(fns.selectClass).toHaveBeenNthCalledWith(1, 'guardian');
    expect(fns.selectClass).toHaveBeenNthCalledWith(2, 'guardian');
    expect(fns.startGame).toHaveBeenCalledTimes(1);
  });

  it('falls back to legacy id only when class metadata is missing', () => {
    const fns = {
      selectClass: vi.fn(),
      startGame: vi.fn(),
    };
    const actions = createCharacterSelectMountActions({ fns });

    actions.onStart({ id: 2 });

    expect(fns.selectClass).toHaveBeenCalledWith(2);
    expect(fns.startGame).toHaveBeenCalledTimes(1);
  });
});
