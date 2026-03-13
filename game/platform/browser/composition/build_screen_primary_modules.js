import { createUiFeatureFacade } from '../../../features/ui/public.js';
import { createEventFeatureFacade } from '../../../features/event/public.js';
import { createRewardFeatureFacade } from '../../../features/reward/public.js';

export function buildScreenPrimaryModules() {
  const uiCapabilities = createUiFeatureFacade().moduleCapabilities;
  const eventCapabilities = createEventFeatureFacade().moduleCapabilities;
  const rewardCapabilities = createRewardFeatureFacade().moduleCapabilities;
  return {
    ...uiCapabilities.primary,
    ...eventCapabilities.primary,
    ...rewardCapabilities.primary,
  };
}
