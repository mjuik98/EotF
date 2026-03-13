export const MAX_SET_BONUS_TIER = 5;

export const LEGACY_SET_TIER_FLAGS = Object.freeze({
  serpents_gaze: Object.freeze({ 2: '_serpentSet2', 3: '_serpentSet3' }),
  holy_grail: Object.freeze({ 2: '_grailSet2', 3: '_grailSet3' }),
  titans_endurance: Object.freeze({ 2: '_titanSet2', 3: '_titanSet3' }),
  iron_fortress: Object.freeze({ 2: '_fortSet2', 3: '_fortSet3' }),
});

export const SETS = {
  void_set: {
    name: '심연의 삼위일체',
    items: ['void_eye', 'void_fang', 'void_crown'],
    bonuses: {
      2: { label: '심연의 각성 — Echo 게이지 최대 +20%' },
      3: { label: '심연의 완성 — 모든 피해 +15% + 턴 시작 Echo +15' },
    },
  },
  echo_set: {
    name: '반향의 삼각',
    items: ['echo_pendant', 'echo_bracer', 'echo_sigil'],
    bonuses: {
      2: { label: '반향의 공명 — Resonance Burst 게이지 -20 (80에서 발동)' },
      3: { label: '반향의 완성 — 매 턴 자동 Echo +20 추가' },
    },
  },
  blood_set: {
    name: '혈맹의 인장',
    items: ['blood_seal', 'blood_oath', 'blood_crown'],
    bonuses: {
      2: { label: '혈맹의 결의 — HP 최대치 +20' },
      3: { label: '혈맹의 완성 — 피해 받을 때 20% 확률 완전 무효' },
    },
  },
  storm_set: {
    name: '폭풍의 세 검',
    items: ['storm_needle', 'storm_crest', 'storm_herald'],
    bonuses: {
      2: { label: '폭풍의 세 검 — 카드 사용 시 잔향 +4' },
      3: { label: '폭풍의 세 검 — 연쇄 3 이상이면 공격 피해 +10%' },
    },
  },
  machine_set: {
    name: '기계의 심장',
    items: ['gear_cog', 'piston_drive', 'circuit_board'],
    bonuses: {
      2: { label: '기계의 심장 — 소멸 시 에너지 +1 (전투당 4회)' },
      3: { label: '기계의 심장 — 소멸 누적에 비례한 추가 피해' },
    },
  },
  moon_set: {
    name: '달의 신비',
    items: ['moon_veil', 'moon_ward', 'moon_crest', 'moon_shard', 'moon_orb'],
    bonuses: {
      2: { label: '달의 신비 — 회복 시 방어막 +2' },
      3: { label: '턴 시작 방어막 15 이상이면 체력 3 회복' },
      5: { label: '치명적 피해 1회 방지 및 체력 20 회복 (전투당 1회)' },
    },
  },
  dusk_set: {
    name: '황혼의 쌍인',
    items: ['dusk_fang', 'dusk_mark'],
    bonuses: {
      2: { label: '황혼의 쌍인 — 독 대상 공격 시 피해 +8' },
    },
  },
  plague_coven: {
    name: '역병의 결사',
    items: ['poison_gland_flask', 'thornvine_heart', 'plague_doctor_scalpel', 'decaying_shroud'],
    bonuses: {
      2: { label: '역병의 전조 — 독 피해 시 방어막 +1' },
      3: { label: '역병의 완성 — 독 피해량 +20%' },
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
  judgement: {
    name: '심판의 불꽃',
    items: ['judgement_torch', 'judgement_ash', 'judgement_censer', 'judgement_scroll', 'judgement_blade'],
    bonuses: {
      2: { label: '심판의 개시 — 전투 시작 시 잔향 15 획득' },
      3: { label: '심판의 순환 — 카드 3장 사용할 때마다 에너지 1 회복' },
      5: { label: '심판의 완수 — 적 처치 시 체력 5 회복 및 방어막 10 획득' },
    },
  },
  shadow_venom: {
    name: '그림자 독사',
    items: ['shadow_venom_dagger', 'shadow_venom_cloak', 'shadow_venom_extract', 'shadow_venom_charm', 'shadow_venom_eye'],
    bonuses: {
      2: { label: '그림자 독사의 순환 — 독 피해 +2' },
      3: { label: '그림자 독사의 수확 — 독으로 적 처치 시 카드 1장 드로우' },
      5: { label: '그림자 독사의 완성 — 독 피해 발생 시 방어막 2 획득' },
    },
  },
  sanctuary: {
    name: '성역의 은총',
    items: ['sanctuary_rosary', 'sanctuary_chalice', 'sanctuary_shroud', 'sanctuary_lantern', 'sanctuary_wing'],
    bonuses: {
      2: { label: '성역의 축복 — 전투 시작 시 최대 체력 +10, 현재 체력도 +10' },
      3: { label: '성역의 순환 — 회복량이 최대 체력을 초과하면 초과분만큼 방어막 획득' },
      5: { label: '성역의 가호 — 턴 시작 시 체력 5 회복 + 무작위 디버프 1개 제거' },
    },
  },
};
