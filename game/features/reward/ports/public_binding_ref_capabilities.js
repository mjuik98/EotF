import { pickDefinedRefs } from '../../../shared/runtime/pick_defined_refs.js';

const REWARD_BINDING_REF_KEYS = Object.freeze([
  'RewardUI',
  'showRewardScreen',
  'takeRewardCard',
  'takeRewardItem',
  'takeRewardUpgrade',
  'takeRewardRemove',
  'showSkipConfirm',
  'hideSkipConfirm',
  'skipReward',
  'returnFromReward',
  'returnToGame',
  'showItemToast',
]);

export function pickRewardBindingRefs(refs = {}) {
  return pickDefinedRefs(refs, REWARD_BINDING_REF_KEYS);
}
