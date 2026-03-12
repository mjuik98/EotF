import { describe, expect, it } from 'vitest';

import {
  createEventApplicationCapabilities,
  createEventContractCapabilities,
  createEventFeatureFacade,
  createEventRuntimeCapabilities,
} from '../game/features/event/public.js';
import {
  createRewardApplicationCapabilities,
  createRewardContractCapabilities,
  createRewardFeatureFacade,
  createRewardRuntimeCapabilities,
} from '../game/features/reward/public.js';

describe('event/reward feature public facades', () => {
  it('exposes event capabilities through a single feature facade', () => {
    const facade = createEventFeatureFacade();

    expect(facade.application).toEqual(createEventApplicationCapabilities());
    expect(facade.contracts).toEqual(createEventContractCapabilities());
    expect(facade.runtime).toEqual(createEventRuntimeCapabilities());
    expect(Object.keys(facade.application)).toEqual(expect.arrayContaining([
      'createShowEventSession',
      'createResolveEventSession',
      'createResolveEventChoice',
      'createEventShop',
      'createRestEvent',
      'buildViewModel',
    ]));
  });

  it('exposes reward capabilities through a single feature facade', () => {
    const facade = createRewardFeatureFacade();

    expect(facade.application).toEqual(createRewardApplicationCapabilities());
    expect(facade.contracts).toEqual(createRewardContractCapabilities());
    expect(facade.runtime).toEqual(createRewardRuntimeCapabilities());
    expect(Object.keys(facade.application)).toEqual(expect.arrayContaining([
      'buildOptions',
      'claimReward',
      'ensureMiniBossBonus',
      'startRemove',
      'takeClaim',
    ]));
  });
});
