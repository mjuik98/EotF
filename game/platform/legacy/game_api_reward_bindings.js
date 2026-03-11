export function buildLegacyGameAPIRewardBindings(_modules, fns) {
  return {
    showSkipConfirm: fns.showSkipConfirm,
    skipReward: fns.skipReward,
    hideSkipConfirm: fns.hideSkipConfirm,
  };
}
