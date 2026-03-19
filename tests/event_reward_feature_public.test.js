import { describe, expect, it } from 'vitest';

import {
  EventPublicSurface,
  createEventApplicationCapabilities,
  createEventBindingCapabilities,
  createEventCompatCapabilities,
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
import fs from 'node:fs';
import path from 'node:path';

describe('event/reward feature public facades', () => {
  it('exposes event capabilities through a single feature facade', () => {
    const facade = createEventFeatureFacade();

    expect(facade.application).toEqual(createEventApplicationCapabilities());
    expect(facade.bindings).toEqual(createEventBindingCapabilities());
    expect(facade.compat).toEqual(createEventCompatCapabilities());
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
    expect(EventPublicSurface.bindings).toEqual(createEventBindingCapabilities());
    expect(EventPublicSurface.compat).toEqual(createEventCompatCapabilities());
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

  it('routes event and reward application capabilities through feature capability port files', () => {
    const eventSource = fs.readFileSync(
      path.join(process.cwd(), 'game/features/event/ports/public_surface.js'),
      'utf8',
    );
    const rewardSource = fs.readFileSync(
      path.join(process.cwd(), 'game/features/reward/ports/public_surface.js'),
      'utf8',
    );

    expect(eventSource).toContain("./public_application_capabilities.js");
    expect(rewardSource).toContain("./public_application_capabilities.js");
  });
});
