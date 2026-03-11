import { describe, expect, it, vi } from 'vitest';

import { createEventPorts } from '../game/features/event/ports/event_ports.js';
import { createRewardPorts } from '../game/features/event/ports/reward_ports.js';
import { createEventRewardPorts } from '../game/features/event/ports/create_event_reward_ports.js';

describe('event reward ports', () => {
  it('creates event ports from injected deps factory', () => {
    const depsFactory = {
      getEventDeps: vi.fn(() => ({ token: 'event-deps' })),
    };

    const ports = createEventPorts(depsFactory);

    expect(ports.getEventDeps()).toEqual({ token: 'event-deps' });
    expect(depsFactory.getEventDeps).toHaveBeenCalledTimes(1);
  });

  it('creates reward ports from injected deps factory', () => {
    const depsFactory = {
      getRewardDeps: vi.fn(() => ({ token: 'reward-deps' })),
      getRunReturnDeps: vi.fn(() => ({ token: 'run-return-deps' })),
    };

    const ports = createRewardPorts(depsFactory);

    expect(ports.getRewardDeps()).toEqual({ token: 'reward-deps' });
    expect(ports.getRunReturnDeps()).toEqual({ token: 'run-return-deps' });
    expect(depsFactory.getRewardDeps).toHaveBeenCalledTimes(1);
    expect(depsFactory.getRunReturnDeps).toHaveBeenCalledTimes(1);
  });

  it('composes event and reward ports into one surface', () => {
    const ports = createEventRewardPorts();

    expect(ports).toHaveProperty('getEventDeps');
    expect(ports).toHaveProperty('getRewardDeps');
    expect(ports).toHaveProperty('getRunReturnDeps');
  });
});
