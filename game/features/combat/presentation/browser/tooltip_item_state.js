const RARITY_TIP_META = {
  legendary: { color: '#c084fc', glow: 'rgba(192,132,252,0.5)', border: 'rgba(192,132,252,0.45)', rgb: '192,132,252' },
  rare: { color: '#f0d472', glow: 'rgba(240,180,41,0.4)', border: 'rgba(240,180,41,0.4)', rgb: '240,180,41' },
  uncommon: { color: '#4af3cc', glow: 'rgba(74,243,204,0.4)', border: 'rgba(74,243,204,0.4)', rgb: '74,243,204' },
  common: { color: '#9b8ab8', glow: 'rgba(155,138,184,0.25)', border: 'rgba(155,138,184,0.2)', rgb: '155,138,184' },
  boss: { color: '#ff3366', glow: 'rgba(255,51,102,0.4)', border: 'rgba(255,51,102,0.4)', rgb: '255,51,102' },
};

const ITEM_CHARGE_META = {
  echo_bell: { gsKey: '_bellCount', max: 10, label: '이번 전투 카드 사용', type: 'num' },
  clockwork_butterfly: { gsKey: '_butterflyCount', max: 3, label: '이번 턴 발동 횟수', type: 'dot' },
  void_crystal: { gsKey: '_voidCrystalUsed', max: 1, label: '이번 전투 발동', type: 'invert-dot' },
  echo_heart: { gsKey: '_heartUsed', max: 1, label: '부활 횟수', type: 'invert-dot' },
  eternal_fragment: { gsKey: '_fragmentActive', label: '전투 효과 상태', type: 'bool' },
  titan_fragment: { gsKey: '_titanUsed', label: '발동 여부', type: 'bool' },
};

const TRIGGER_LABEL_MAP = {
  combat_start: '전투 시작 시',
  card_play: '카드 사용 시',
  turn_start: '턴 시작 시',
  turn_end: '턴 종료 시',
  damage_taken: '피해 받을 때',
  boss_start: '보스 조우 시',
  combat_end: '전투 종료 시',
  enemy_kill: '적 처치 시',
  card_draw: '카드 드로우 시',
  card_exhaust: '카드 소멸 시',
  card_discard: '카드 버릴 때',
  floor_start: '층 이동 시',
  resonance_burst: '공명 폭발 시',
  poison_damage: '독 피해 시',
  enemy_status_apply: '적 상태이상 부여 시',
  echo_gain: '잔향 획득 시',
  chain_gain: '연쇄 증가 시',
  chain_break: '연쇄 단절 시',
  energy_gain: '에너지 획득 시',
  energy_empty: '에너지 소진 시',
  deal_damage: '피해 줄 때',
  pre_death: '사망 직전 (1회)',
  shop_buy: '상점 구매 시',
  heal_amount: '체력 회복 시',
  shield_gain: '방어막 획득 시',
};

export function resolveItemTooltipState(itemId, item, data, gs, setBonusSystem) {
  const rarity = item.rarity || 'common';
  const rarityMeta = RARITY_TIP_META[rarity] || RARITY_TIP_META.common;
  const triggerText = item.trigger ? (TRIGGER_LABEL_MAP[item.trigger] || item.trigger) : '패시브';

  const chargeMeta = ITEM_CHARGE_META[itemId] || null;
  let liveCharge = null;
  if (chargeMeta && gs) {
    const val = gs[chargeMeta.gsKey];
    if (chargeMeta.type === 'bool') {
      liveCharge = { type: 'bool', active: !!val, label: chargeMeta.label };
    } else if (chargeMeta.type === 'invert-dot') {
      const used = val ? 1 : 0;
      liveCharge = { type: 'dot', val: chargeMeta.max - used, max: chargeMeta.max, remaining: chargeMeta.max - used, label: chargeMeta.label };
    } else {
      const cur = Number(val) || 0;
      liveCharge = { type: chargeMeta.type, val: cur, max: chargeMeta.max, remaining: chargeMeta.max - cur, label: chargeMeta.label };
    }
  }

  let setDef = null;
  let setCount = 0;
  let setOwnedFlags = [];
  if (item.setId && setBonusSystem) {
    setDef = setBonusSystem.sets?.[item.setId] || null;
    if (!setDef) {
      const members = Object.values(data.items).filter((candidate) => candidate.setId === item.setId);
      if (members.length >= 2) setDef = { name: item.setId, items: members.map((member) => member.id), bonuses: {} };
    }
    if (setDef && gs) {
      const counts = setBonusSystem.getOwnedSetCounts?.(gs) || {};
      setCount = counts[item.setId] || 0;
      setOwnedFlags = setDef.items.map((id) => gs.player?.items?.includes(id) ?? false);
    }
  } else if (item.setId) {
    const members = Object.values(data.items).filter((candidate) => candidate.setId === item.setId);
    if (members.length >= 2) {
      setDef = { name: item.setId, items: members.map((member) => member.id), bonuses: {} };
      if (gs) {
        setCount = setDef.items.filter((id) => gs.player?.items?.includes(id)).length;
        setOwnedFlags = setDef.items.map((id) => gs.player?.items?.includes(id) ?? false);
      }
    }
  }

  return {
    liveCharge,
    rarity,
    rarityMeta,
    setCount,
    setDef,
    setOwnedFlags,
    triggerText,
  };
}
