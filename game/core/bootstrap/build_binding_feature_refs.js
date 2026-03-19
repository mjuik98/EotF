import { pickCombatBindingRefs } from '../../features/combat/ports/public_binding_ref_capabilities.js';
import { pickRewardBindingRefs } from '../../features/reward/ports/public_binding_ref_capabilities.js';
import { pickRunBindingRefs } from '../../features/run/ports/public_binding_ref_capabilities.js';
import { pickTitleBindingRefs } from '../../features/title/ports/public_binding_ref_capabilities.js';
import { pickUiBindingRefs } from '../../features/ui/ports/public_binding_ref_capabilities.js';
import { pickDefinedRefs } from '../../shared/runtime/pick_defined_refs.js';

const CORE_BINDING_REF_KEYS = Object.freeze([
  'GAME',
  'GS',
  'AudioEngine',
  'ParticleSystem',
  'SaveSystem',
  'ScreenShake',
  'HitStop',
  'ButtonFeedback',
]);

export function buildBindingFeatureRefs(refs = {}) {
  return {
    core: pickDefinedRefs(refs, CORE_BINDING_REF_KEYS),
    title: pickTitleBindingRefs(refs),
    combat: pickCombatBindingRefs(refs),
    run: pickRunBindingRefs(refs),
    reward: pickRewardBindingRefs(refs),
    screen: pickUiBindingRefs(refs),
  };
}
