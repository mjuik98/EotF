import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  registerLegacyBridgeRuntime: vi.fn(),
}));

vi.mock('../game/platform/legacy/register_legacy_bridge_runtime.js', () => ({
  registerLegacyBridgeRuntime: hoisted.registerLegacyBridgeRuntime,
}));

import { registerLegacyBridge } from '../game/platform/legacy/register_legacy_bridge.js';

describe('registerLegacyBridge', () => {
  it('delegates legacy registration through the compat core surface', () => {
    const options = { modules: { marker: true }, fns: { startGame: vi.fn() } };

    registerLegacyBridge(options);

    expect(hoisted.registerLegacyBridgeRuntime).toHaveBeenCalledWith(options);
  });
});
