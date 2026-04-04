import { pickCombatBindingRefs } from '../../features/combat/ports/public_binding_ref_capabilities.js';
import { pickRewardBindingRefs } from '../../features/reward/ports/public_binding_ref_capabilities.js';
import { pickRunBindingRefs } from '../../features/run/ports/public_binding_ref_capabilities.js';
import { pickTitleBindingRefs } from '../../features/title/ports/public_binding_ref_capabilities.js';
import { pickUiBindingRefs } from '../../features/ui/ports/public_binding_ref_capabilities.js';

export function buildFeatureBindingRefGroups(refs = {}) {
  return {
    title: pickTitleBindingRefs(refs),
    combat: pickCombatBindingRefs(refs),
    run: pickRunBindingRefs(refs),
    reward: pickRewardBindingRefs(refs),
    screen: pickUiBindingRefs(refs),
  };
}
