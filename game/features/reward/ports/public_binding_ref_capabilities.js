import { pickDefinedRefs } from '../../ui/ports/public_shared_support_capabilities.js';

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
