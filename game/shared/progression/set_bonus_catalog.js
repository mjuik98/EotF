export const MAX_SET_BONUS_TIER = 5;

export const LEGACY_SET_TIER_FLAGS = Object.freeze({
  serpents_gaze: Object.freeze({ 2: '_serpentSet2', 3: '_serpentSet3' }),
  holy_grail: Object.freeze({ 2: '_grailSet2', 3: '_grailSet3' }),
  titans_endurance: Object.freeze({ 2: '_titanSet2', 3: '_titanSet3' }),
  iron_fortress: Object.freeze({ 2: '_fortSet2', 3: '_fortSet3' }),
});

export const SETS = {
  void_set: {
    name: '공허의 삼위일체',
    items: ['void_eye', 'void_fang', 'void_crown'],
    bonuses: {
      2: { label: '공허의 공명 — 비용 0인 카드 사용 시 잔향 +5' },
      3: { label: '공허의 완성 — 약화된 적 공격 시 피해 +15%' },
    },
  },
  abyssal_set: {
    name: '심연의 삼위일체',
    items: ['abyssal_eye', 'abyssal_hand', 'abyssal_heart'],
    bonuses: {
      2: { label: '심연의 각성 — 잔향 게이지 최대치 +20%' },
      3: { label: '심연의 완성 — 모든 피해 +15% + 턴 시작 시 잔향 +15' },
    },
  },
  ancient_set: {
    name: '고대인의 유산',
    items: ['ancient_handle', 'ancient_leather', 'ancient_belt', 'ancient_cape', 'ancient_blade', 'ancient_scroll'],
    bonuses: {
      2: { label: '고대의 육신 — 최대 체력 +10' },
      4: { label: '고대의 지혜 — 전투 시작 시 카드 1장 드로우' },
      5: { label: '고대의 계승 — 공격 피해 +6' },
    },
  },
  serpents_gaze: {
    name: '독사의 시선',
    items: ['serpent_fang_dagger', 'acidic_vial', 'cobra_scale_charm'],
    bonuses: {
      2: { label: '독사의 갈무리 — 독 피해 시 10% 확률로 다른 적에게 전이' },
      3: { label: '독사의 맹독 — 독 수치 10 이상인 적 공격 시 피해 +25%' },
    },
  },
  holy_grail: {
    name: '생명의 성배',
    items: ['monks_rosary', 'fountain_essence', 'life_bloom_seed'],
    bonuses: {
      2: { label: '성배의 자비 — 초과 회복량을 방어막으로 전환' },
      3: { label: '성배의 축복 — 회복 시 다음 공격 피해 +4' },
    },
  },
  titans_endurance: {
    name: '거인의 인내',
    items: ['titans_belt', 'endurance_medal', 'ancient_heart_stone'],
    bonuses: {
      2: { label: '거인의 위압 — 체력 80% 이상일 때 공격 피해 +5' },
      3: { label: '거인의 불사 — 치명적 피해를 1회 방지 (전투당 1회)' },
    },
  },
  iron_fortress: {
    name: '철옹성',
    items: ['bastion_shield_plate', 'spiked_buckler', 'fortified_gauntlet', 'guardian_seal', 'unyielding_fort'],
    bonuses: {
      2: { label: '철옹성의 방패 — 공격 시 현재 방어막의 20%만큼 추가 피해' },
      3: { label: '철옹성의 가시 — 가시 및 반사 피해 +5' },
      5: { label: '철옹성의 완성 — 턴 시작 시 방어막이 40 이상이면 에너지 1 회복' },
    },
  },
};
