import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  registerRuntimeSubscribers: vi.fn(),
  registerRuntimeDebugHooks: vi.fn(),
  registerRuntimeBootSteps: vi.fn(() => ({ StorySystem: { id: 'story-system' } })),
}));

vi.mock('../game/core/bootstrap/register_runtime_subscribers.js', () => ({
  registerRuntimeSubscribers: hoisted.registerRuntimeSubscribers,
}));

vi.mock('../game/core/bootstrap/register_runtime_debug_hooks.js', () => ({
  registerRuntimeDebugHooks: hoisted.registerRuntimeDebugHooks,
}));

vi.mock('../game/core/bootstrap/register_runtime_boot_steps.js', () => ({
  registerRuntimeBootSteps: hoisted.registerRuntimeBootSteps,
}));

import { bootRuntimeFeatures } from '../game/core/bootstrap/boot_runtime_features.js';

describe('bootRuntimeFeatures', () => {
  beforeEach(() => {
    Object.values(hoisted).forEach((fn) => fn.mockReset?.());
    hoisted.registerRuntimeBootSteps.mockReturnValue({ StorySystem: { id: 'story-system' } });
  });

  it('delegates runtime boot orchestration to subscriber, debug-hook, and boot-step helpers', () => {
    const modules = { GAME: {} };
    const fns = { updateUI: vi.fn() };
    const deps = {};
    const doc = { body: {} };
    const win = {};

    const result = bootRuntimeFeatures({ modules, fns, deps, doc, win });

    expect(hoisted.registerRuntimeSubscribers).toHaveBeenCalledWith({ modules, fns, doc, win });
    expect(hoisted.registerRuntimeDebugHooks).toHaveBeenCalledWith({ modules, fns, doc, win });
    expect(hoisted.registerRuntimeBootSteps).toHaveBeenCalledWith({ modules, fns, deps, doc, win });
    expect(result).toEqual({ StorySystem: { id: 'story-system' } });
  });
});
