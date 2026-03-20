import { describe, expect, it } from 'vitest';

import {
  EventPublicSurface,
  createEventApplicationCapabilities,
  createEventBindingCapabilities,
  createEventCompatCapabilities,
  createEventContractCapabilities,
  createEventRuntimeCapabilities,
} from '../game/features/event/public.js';
import {
  RewardPublicSurface,
  createRewardApplicationCapabilities,
  createRewardContractCapabilities,
  createRewardRuntimeCapabilities,
} from '../game/features/reward/public.js';
import fs from 'node:fs';
import path from 'node:path';

describe('event/reward feature public surfaces', () => {
  it('exposes event capabilities through narrow capability exports', () => {
    expect(Object.keys(createEventApplicationCapabilities())).toEqual(expect.arrayContaining([
      'createShowEventSession',
      'createResolveEventSession',
      'createResolveEventChoice',
      'createEventShop',
      'createRestEvent',
      'buildViewModel',
    ]));
    expect(Object.keys(EventPublicSurface).sort()).toEqual([
      'application',
      'bindings',
      'compat',
      'contracts',
      'moduleCapabilities',
      'runtime',
    ]);
    expect(EventPublicSurface.application).toEqual(createEventApplicationCapabilities());
    expect(EventPublicSurface.bindings).toEqual(createEventBindingCapabilities());
    expect(EventPublicSurface.compat).toEqual(createEventCompatCapabilities());
    expect(EventPublicSurface.contracts).toEqual(createEventContractCapabilities());
    expect(EventPublicSurface.runtime).toEqual(createEventRuntimeCapabilities());
    expect(EventPublicSurface.moduleCapabilities.primary).toBeDefined();
  });

  it('exposes reward capabilities through narrow capability exports', () => {
    expect(Object.keys(createRewardApplicationCapabilities())).toEqual(expect.arrayContaining([
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

  it('routes event and reward application capabilities through feature capability port files without grouped feature facades', () => {
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
    expect(eventSource).not.toContain('createEventFeatureFacade');
    expect(rewardSource).not.toContain('createRewardFeatureFacade');
  });
});
