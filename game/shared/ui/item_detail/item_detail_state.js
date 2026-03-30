import { SETS as CANONICAL_SETS } from '../../progression/set_bonus_catalog.js';

const RARITY_TIP_META = {
  legendary: { color: '#c084fc', glow: 'rgba(192,132,252,0.5)', border: 'rgba(192,132,252,0.45)', rgb: '192,132,252' },
  rare: { color: '#f0d472', glow: 'rgba(240,180,41,0.4)', border: 'rgba(240,180,41,0.4)', rgb: '240,180,41' },
  uncommon: { color: '#4af3cc', glow: 'rgba(74,243,204,0.4)', border: 'rgba(74,243,204,0.4)', rgb: '74,243,204' },
  common: { color: '#9b8ab8', glow: 'rgba(155,138,184,0.25)', border: 'rgba(155,138,184,0.2)', rgb: '155,138,184' },
  boss: { color: '#ff3366', glow: 'rgba(255,51,102,0.4)', border: 'rgba(255,51,102,0.4)', rgb: '255,51,102' },
};

const RARITY_LABELS = {
  common: '일반',
  uncommon: '비범',
  rare: '희귀',
  legendary: '전설',
  boss: '보스',
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

function getSetMembers(data, setId) {
  return Object.values(data?.items || {}).filter((candidate) => candidate?.setId === setId);
}

function extractTaggedSetName(desc) {
  const match = String(desc || '').match(/\[세트:\s*([^\]\n]+)\s*\]/);
  return match?.[1]?.trim() || '';
}

function resolveSetDisplayName(item, setDef, members) {
  const canonicalName = CANONICAL_SETS[item?.setId]?.name;
  if (canonicalName) return canonicalName;

  const taggedName = [item, ...(members || [])]
    .map((entry) => extractTaggedSetName(entry?.desc))
    .find(Boolean);
  if (taggedName) return taggedName;

  return setDef?.name || item?.setId || '';
}

function readChargeState(gs, chargeMeta) {
  if (!gs || !chargeMeta) return undefined;
  if (chargeMeta.scope === 'combat' && !gs.combat?.active) return undefined;
  if (chargeMeta.itemRuntimeKey && chargeMeta.stateKey) {
    const runtime = gs._itemRuntime?.[chargeMeta.itemRuntimeKey];
    if (runtime && Object.prototype.hasOwnProperty.call(runtime, chargeMeta.stateKey)) {
      return runtime[chargeMeta.stateKey];
    }
  }
  if (chargeMeta.itemPlayerStateKey && chargeMeta.stateKey) {
    const persistent = gs.player?._itemState?.[chargeMeta.itemPlayerStateKey];
    if (persistent && Object.prototype.hasOwnProperty.call(persistent, chargeMeta.stateKey)) {
      return persistent[chargeMeta.stateKey];
    }
  }
  if (chargeMeta.fallbackGsKey) return gs[chargeMeta.fallbackGsKey];
  if (chargeMeta.gsKey) return gs[chargeMeta.gsKey];
  return undefined;
}

export function resolveItemDetailState(itemId, item, data, gs, setBonusSystem) {
  const rarity = item.rarity || 'common';
  const rarityLabel = RARITY_LABELS[rarity] || rarity;
  const rarityMeta = RARITY_TIP_META[rarity] || RARITY_TIP_META.common;
  const triggerText = item.trigger ? (TRIGGER_LABEL_MAP[item.trigger] || item.trigger) : '패시브';

  const chargeMeta = item?.chargeMeta || null;
  let liveCharge = null;
  if (chargeMeta && gs) {
    const val = readChargeState(gs, chargeMeta);
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
  const setMembers = item.setId ? getSetMembers(data, item.setId) : [];
  if (item.setId && setBonusSystem) {
    setDef = setBonusSystem.sets?.[item.setId] || null;
    if (!setDef) {
      if (setMembers.length >= 2) {
        setDef = { items: setMembers.map((member) => member.id), bonuses: {} };
      }
    }
    if (setDef) setDef = { ...setDef, name: resolveSetDisplayName(item, setDef, setMembers) };
    if (setDef && gs) {
      setOwnedFlags = setDef.items.map((id) => gs.player?.items?.includes(id) ?? false);
      const counts = setBonusSystem.getOwnedSetCounts?.(gs) || {};
      if (Object.prototype.hasOwnProperty.call(counts, item.setId)) {
        setCount = counts[item.setId] || 0;
      } else {
        setCount = setOwnedFlags.filter(Boolean).length;
      }
    }
  } else if (item.setId) {
    if (setMembers.length >= 2) {
      setDef = {
        name: resolveSetDisplayName(item, null, setMembers),
        items: setMembers.map((member) => member.id),
        bonuses: {},
      };
      if (gs) {
        setCount = setDef.items.filter((id) => gs.player?.items?.includes(id)).length;
        setOwnedFlags = setDef.items.map((id) => gs.player?.items?.includes(id) ?? false);
      }
    }
  }

  return {
    liveCharge,
    rarity,
    rarityLabel,
    rarityMeta,
    setCount,
    setDef,
    setOwnedFlags,
    triggerText,
  };
}
