import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildEventSubscriberRegistrarGroups: vi.fn(),
  groups: {
    gameplay: [vi.fn(), vi.fn(), vi.fn()],
    runtime: [vi.fn()],
  },
}));

vi.mock('../game/core/build_event_subscriber_registrar_groups.js', () => ({
  buildEventSubscriberRegistrarGroups: hoisted.buildEventSubscriberRegistrarGroups,
}));

import { buildEventSubscriberRegistrars } from '../game/core/build_event_subscriber_registrars.js';

describe('buildEventSubscriberRegistrars', () => {
  beforeEach(() => {
    hoisted.buildEventSubscriberRegistrarGroups.mockReset();
    hoisted.groups.gameplay.forEach((registrar) => registrar.mockReset());
    hoisted.groups.runtime.forEach((registrar) => registrar.mockReset());
    hoisted.buildEventSubscriberRegistrarGroups.mockReturnValue(hoisted.groups);
  });

  it('flattens subscriber registrar groups in gameplay-to-runtime order', () => {
    expect(buildEventSubscriberRegistrars()).toEqual([
      ...hoisted.groups.gameplay,
      ...hoisted.groups.runtime,
    ]);
    expect(hoisted.buildEventSubscriberRegistrarGroups).toHaveBeenCalledTimes(1);
  });
});
