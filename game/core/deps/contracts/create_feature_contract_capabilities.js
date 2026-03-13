import { createCombatFeatureFacade } from '../../../features/combat/public.js';
import { createEventFeatureFacade } from '../../../features/event/public.js';
import { createRewardFeatureFacade } from '../../../features/reward/public.js';
import { createRunFeatureFacade } from '../../../features/run/public.js';
import { createTitleFeatureFacade } from '../../../features/title/public.js';
import { createUiFeatureFacade } from '../../../features/ui/public.js';

export function createFeatureContractCapabilities() {
  return {
    combat: createCombatFeatureFacade().contracts,
    event: createEventFeatureFacade().contracts,
    reward: createRewardFeatureFacade().contracts,
    run: createRunFeatureFacade().contracts,
    title: createTitleFeatureFacade().contracts,
    ui: createUiFeatureFacade().contracts,
  };
}
