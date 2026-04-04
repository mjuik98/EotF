import { describe, expect, it, vi } from 'vitest';

import { buildFeatureContractAccessors } from '../game/core/deps_factory.js';

describe('buildFeatureContractAccessors', () => {
  it('uses the canonical core/composition feature contract catalog', async () => {
    const { createFeatureContractCapabilities } = await import(
      '../game/core/deps/contracts/create_feature_contract_capabilities.js'
    );
    const { createFeatureContractCapabilityCatalog } = await import(
      '../game/core/composition/feature_contract_capability_catalog.js'
    );

    expect(createFeatureContractCapabilities()).toEqual(
      createFeatureContractCapabilityCatalog(),
    );
  });

  it('prefers buildContractDepAccessors when the deps factory provides it', () => {
    const buildContractDepAccessors = vi.fn(() => Object.freeze({
      getScreenDeps: () => ({ token: 'screen' }),
    }));

    const accessors = buildFeatureContractAccessors(
      { getScreenDeps: 'screen' },
      { buildContractDepAccessors },
    );

    expect(buildContractDepAccessors).toHaveBeenCalledWith(
      { getScreenDeps: 'screen' },
      { buildContractDepAccessors },
    );
    expect(accessors.getScreenDeps()).toEqual({ token: 'screen' });
  });

  it('falls back to accessor-shaped deps factories when no contract builder exists', () => {
    const depsFactory = {
      getTooltipDeps: vi.fn(() => ({ token: 'tooltip' })),
    };

    const accessors = buildFeatureContractAccessors(
      { getTooltipDeps: 'tooltip' },
      depsFactory,
    );

    expect(accessors.getTooltipDeps({ doc: { id: 'doc' } })).toEqual({
      token: 'tooltip',
      doc: { id: 'doc' },
    });
    expect(depsFactory.getTooltipDeps).toHaveBeenCalledTimes(1);
  });
});
