import { describe, expect, it } from 'vitest';

import {
  EventPublicSurface,
  createEventApplicationCapabilities,
  createEventContractCapabilities,
  createEventFeatureFacade,
  createEventRuntimeCapabilities,
} from '../game/features/event/public.js';
import {
  RewardPublicSurface,
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
    expect(EventPublicSurface.application).toEqual(createEventApplicationCapabilities());
    expect(EventPublicSurface.contracts).toEqual(createEventContractCapabilities());
    expect(EventPublicSurface.runtime).toEqual(createEventRuntimeCapabilities());
    expect(EventPublicSurface.moduleCapabilities.primary).toBeDefined();
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
    expect(RewardPublicSurface.application).toEqual(createRewardApplicationCapabilities());
    expect(RewardPublicSurface.contracts).toEqual(createRewardContractCapabilities());
    expect(RewardPublicSurface.runtime).toEqual(createRewardRuntimeCapabilities());
    expect(RewardPublicSurface.moduleCapabilities.primary).toBeDefined();
  });
});
