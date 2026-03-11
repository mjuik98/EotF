import { describe, expect, it, vi } from 'vitest';

import { executeRuntimeBootSequence } from '../game/core/bootstrap/execute_runtime_boot_sequence.js';

describe('executeRuntimeBootSequence', () => {
  it('runs runtime boot steps in order and returns the story system handle', () => {
    const calls = [];
    const bindings = {
      StorySystem: { id: 'story-system' },
      registerBindings: vi.fn(() => calls.push('bindings')),
      configureMaze: vi.fn(() => calls.push('maze')),
      scheduleCharacterSelectMount: vi.fn(() => calls.push('character')),
      exposeRuntimeGlobals: vi.fn(() => calls.push('globals')),
      bootGameInit: vi.fn(() => calls.push('boot')),
    };

    const result = executeRuntimeBootSequence(bindings);

    expect(calls).toEqual(['bindings', 'maze', 'character', 'globals', 'boot']);
    expect(result).toEqual({ StorySystem: bindings.StorySystem });
  });
});
