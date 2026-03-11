import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildRuntimeSubscriberActionGroups: vi.fn(),
  groups: {
    gameplay: { renderCombatCards: vi.fn(), updateCombatLog: vi.fn() },
    shell: { updateUI: vi.fn(), updateStatusDisplay: vi.fn() },
  },
}));

vi.mock('../game/core/bootstrap/build_runtime_subscriber_action_groups.js', () => ({
  buildRuntimeSubscriberActionGroups: hoisted.buildRuntimeSubscriberActionGroups,
}));

import { buildRuntimeSubscriberActions } from '../game/core/bootstrap/build_runtime_subscriber_actions.js';

describe('buildRuntimeSubscriberActions', () => {
  beforeEach(() => {
    hoisted.buildRuntimeSubscriberActionGroups.mockReset();
    hoisted.groups.gameplay.renderCombatCards.mockReset();
    hoisted.groups.gameplay.updateCombatLog.mockReset();
    hoisted.groups.shell.updateUI.mockReset();
    hoisted.groups.shell.updateStatusDisplay.mockReset();
    hoisted.buildRuntimeSubscriberActionGroups.mockReturnValue(hoisted.groups);
  });

  it('flattens runtime subscriber action groups in gameplay-to-shell order', () => {
    expect(buildRuntimeSubscriberActions({})).toEqual({
      ...hoisted.groups.gameplay,
      ...hoisted.groups.shell,
    });
    expect(hoisted.buildRuntimeSubscriberActionGroups).toHaveBeenCalledTimes(1);
  });
});
