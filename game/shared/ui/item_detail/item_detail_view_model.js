const ITEM_DETAIL_RARITY_LABELS = {
  common: '일반',
  uncommon: '비범',
  rare: '희귀',
  legendary: '전설',
  boss: '보스',
};

function buildItemDetailFallbackParts(item, itemId = '') {
  const title = String(item?.name || itemId || '').trim();
  const desc = String(item?.desc || item?.passive || '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !/^\[세트:\s*.+\]$/.test(line))
    .join('\n');
  return { title, desc };
}

export function formatItemDetailChargeValue(liveCharge) {
  if (!liveCharge) return '';
  if (liveCharge.type === 'bool') return liveCharge.active ? '현재 활성화됨' : '비활성';
  if (liveCharge.type === 'num') return `${liveCharge.val} / ${liveCharge.max}`;
  return liveCharge.remaining > 0 ? `${liveCharge.remaining}회 남음` : '소진됨';
}

export function buildItemDetailViewModel(itemId, item, data, state) {
  const fallback = buildItemDetailFallbackParts(item, itemId);
  const setData = state?.setDef
    ? {
        name: state.setDef.name,
        count: state.setCount || 0,
        total: Array.isArray(state.setDef.items) ? state.setDef.items.length : 0,
        members: (state.setDef.items || []).map((memberId, index) => {
          const member = data?.items?.[memberId];
          return {
            id: memberId,
            icon: member?.icon || '?',
            name: member?.name || memberId,
            owned: !!state?.setOwnedFlags?.[index],
          };
        }),
        bonuses: Object.entries(state.setDef.bonuses || {})
          .sort(([left], [right]) => Number(left) - Number(right))
          .map(([tier, bonus]) => ({
            tier: Number(tier),
            label: bonus?.label || '',
            active: (state.setCount || 0) >= Number(tier),
          })),
      }
    : null;

  return {
    icon: item?.icon || '?',
    title: fallback.title || itemId,
    desc: fallback.desc,
    rarity: state?.rarity || 'common',
    rarityLabel: ITEM_DETAIL_RARITY_LABELS[state?.rarity] || state?.rarity || '일반',
    rarityMeta: state?.rarityMeta || null,
    triggerText: state?.triggerText || '패시브',
    charge: state?.liveCharge
      ? {
          label: state.liveCharge.label,
          value: formatItemDetailChargeValue(state.liveCharge),
          tone: state.liveCharge.type === 'bool' && !state.liveCharge.active ? 'muted' : 'accent',
        }
      : null,
    set: setData,
  };
}
