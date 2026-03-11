export function buildRestOptions(state, { activeRegionId, upgradeMap }) {
  const options = [
    {
      id: 'upgrade_random',
      text: '무작위 카드 강화',
      disabledReason: '강화 가능한 카드가 없습니다.',
      isDisabled: (candidateState) => {
        const upgradable = (candidateState.player.deck || []).filter((id) => upgradeMap?.[id]);
        return upgradable.length === 0;
      },
    },
    {
      id: 'burn_one',
      text: '카드 1장 소각',
    },
  ];

  if (
    activeRegionId === 5 &&
    Array.isArray(state?._stagnationVault) &&
    state._stagnationVault.length > 0
  ) {
    options.push({
      id: 'reset_stagnation',
      text: '정체 덱 복원',
    });
  }

  return options;
}
