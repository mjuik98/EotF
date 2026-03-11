import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildGameBootActionGroups: vi.fn(),
  groups: {
    title: { startGame: vi.fn(), openSettings: vi.fn() },
    run: { drawCard: vi.fn(), closeCodex: vi.fn() },
  },
}));

vi.mock('../game/core/bootstrap/build_game_boot_action_groups.js', () => ({
  buildGameBootActionGroups: hoisted.buildGameBootActionGroups,
}));

import { buildGameBootActions } from '../game/core/bootstrap/build_game_boot_actions.js';

describe('buildGameBootActions', () => {
  beforeEach(() => {
    hoisted.buildGameBootActionGroups.mockReset();
    hoisted.groups.title.startGame.mockReset();
    hoisted.groups.title.openSettings.mockReset();
    hoisted.groups.run.drawCard.mockReset();
    hoisted.groups.run.closeCodex.mockReset();
    hoisted.buildGameBootActionGroups.mockReturnValue(hoisted.groups);
  });

  it('flattens boot action groups in title-to-run order', () => {
    expect(buildGameBootActions({})).toEqual({
      ...hoisted.groups.title,
      ...hoisted.groups.run,
    });
    expect(hoisted.buildGameBootActionGroups).toHaveBeenCalledTimes(1);
  });
});
