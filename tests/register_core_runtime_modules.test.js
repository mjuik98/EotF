import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildCoreEngineModules: vi.fn(() => ({ AudioEngine: { id: 'audio' }, GS: { id: 'gs' } })),
  buildCoreRuntimeBridgeModules: vi.fn(() => ({ GAME: { id: 'game' }, GameInit: { id: 'init' } })),
  buildCoreSystemModules: vi.fn(() => ({ RunRules: { id: 'rules' }, SaveSystem: { id: 'save' } })),
}));

vi.mock('../game/platform/browser/composition/build_core_engine_modules.js', () => ({
  buildCoreEngineModules: hoisted.buildCoreEngineModules,
}));

vi.mock('../game/platform/browser/composition/build_core_runtime_bridge_modules.js', () => ({
  buildCoreRuntimeBridgeModules: hoisted.buildCoreRuntimeBridgeModules,
}));

vi.mock('../game/platform/browser/composition/build_core_system_modules.js', () => ({
  buildCoreSystemModules: hoisted.buildCoreSystemModules,
}));

import { registerCoreModules } from '../game/platform/browser/composition/register_core_runtime_modules.js';

describe('registerCoreModules', () => {
  it('merges core engine, runtime bridge, and system module groups', () => {
    const modules = registerCoreModules();

    expect(hoisted.buildCoreEngineModules).toHaveBeenCalledTimes(1);
    expect(hoisted.buildCoreRuntimeBridgeModules).toHaveBeenCalledTimes(1);
    expect(hoisted.buildCoreSystemModules).toHaveBeenCalledTimes(1);
    expect(modules).toEqual({
      AudioEngine: { id: 'audio' },
      GS: { id: 'gs' },
      GAME: { id: 'game' },
      GameInit: { id: 'init' },
      RunRules: { id: 'rules' },
      SaveSystem: { id: 'save' },
    });
  });
});
