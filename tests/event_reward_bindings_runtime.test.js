import { describe, expect, it, vi } from 'vitest';

import { applyEventRewardBindings } from '../game/core/bindings/event_reward_bindings_runtime.js';

describe('applyEventRewardBindings', () => {
  it('creates ports once and assigns generated actions onto the target surface', () => {
    const modules = { EventUI: {} };
    const fns = { existing: vi.fn() };
    const ports = { getEventDeps: vi.fn() };
    const generatedActions = { triggerRandomEvent: vi.fn() };
    const createPorts = vi.fn(() => ports);
    const createActions = vi.fn(() => generatedActions);

    const result = applyEventRewardBindings({
      modules,
      fns,
      createActions,
      createPorts,
    });

    expect(createPorts).toHaveBeenCalledTimes(1);
    expect(createActions).toHaveBeenCalledWith(modules, fns, ports);
    expect(result).toBe(fns);
    expect(fns).toMatchObject(generatedActions);
    expect(fns.existing).toBeTypeOf('function');
  });
});
