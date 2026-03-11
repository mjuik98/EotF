import { describe, expect, it, vi } from 'vitest';

import { buildLegacyGameAPIQueryBindings } from '../game/platform/legacy/game_api_query_bindings.js';

describe('buildLegacyGameAPIQueryBindings', () => {
  it('composes module and runtime query groups', () => {
    const modules = {
      AudioEngine: { id: 'audio' },
      SaveSystem: {
        getOutboxMetrics: vi.fn(() => ({ queued: 2 })),
        flushOutbox: vi.fn(() => 2),
      },
      HudUpdateUI: {
        updateUI: vi.fn(),
        processDirtyFlags: vi.fn(),
      },
    };
    const deps = {
      getHudUpdateDeps: vi.fn(() => ({ token: 'hud-deps' })),
    };
    const runtimeMetrics = {
      getRuntimeMetrics: vi.fn(() => ({ errors: 0 })),
      resetRuntimeMetrics: vi.fn(),
    };

    const bindings = buildLegacyGameAPIQueryBindings(modules, deps, runtimeMetrics);

    expect(bindings.AudioEngine).toBe(modules.AudioEngine);
    expect(bindings.getSaveOutboxMetrics()).toEqual({ queued: 2 });
    expect(bindings.flushSaveOutbox()).toBe(2);
    expect(bindings.getRuntimeMetrics()).toEqual({ errors: 0 });
    bindings.resetRuntimeMetrics();
    bindings.updateUI();
    bindings.processDirtyFlags();

    expect(runtimeMetrics.resetRuntimeMetrics).toHaveBeenCalledTimes(1);
    expect(modules.HudUpdateUI.updateUI).toHaveBeenCalledWith({ token: 'hud-deps' });
    expect(modules.HudUpdateUI.processDirtyFlags).toHaveBeenCalledWith({ token: 'hud-deps' });
  });
});
