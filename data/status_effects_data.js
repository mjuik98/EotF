'use strict';

export const STATUS_KR = Object.freeze({
  resonance: { name: '공명', icon: '🎵', buff: true, desc: '카드 사용 시 공격 피해 보너스가 누적됩니다.' },
  acceleration: { name: '가속', icon: '⚡', buff: true, desc: '이번 공격 피해가 증가하고 연계 효과를 강화합니다.' },

  mirror: { name: '반사막', icon: '🪞', buff: true, desc: '받은 피해를 적에게 그대로 반사합니다.' },
  time_warp: { name: '시간 왜곡', icon: '⏳', buff: true, desc: '매 턴 추가 에너지를 획득합니다.' },
  time_warp_plus: { name: '시간 왜곡+', icon: '⌛', buff: true, desc: '매 턴 더 많은 추가 에너지를 획득합니다.' },

  vanish: { name: '은신', icon: '🌫', buff: true, desc: '다음 공격이 치명타가 됩니다.' },
  shadow_atk: { name: '그림자 강화', icon: '🌒', buff: true, desc: '다음 공격 피해가 증가합니다.' },
  dodge: { name: '회피', icon: '💨', buff: true, desc: '다음 공격을 완전히 회피합니다.' },

  focus: { name: '집중', icon: '🎯', buff: true, desc: '다음 공격이 치명타가 됩니다.' },
  critical_turn: { name: '치명 턴', icon: '💥', buff: true, desc: '이번 턴 모든 공격이 치명타가 됩니다.' },
  lifesteal: { name: '흡혈', icon: '🩸', buff: true, desc: '가한 피해 비율만큼 체력을 회복합니다.' },
  spike_shield: { name: '가시 방패', icon: '🌵', buff: true, desc: '이번 턴 적 공격을 반사하고 무효화합니다.' },
  immune: { name: '무적', icon: '🔰', buff: true, desc: '모든 피해와 상태 이상을 무시합니다.' },
  soul_armor: { name: '영혼 갑옷', icon: '🛡', buff: true, desc: '받는 피해를 줄이고 잔향을 회복합니다.' },
  zeroCost: { name: '무소모', icon: '0', buff: true, desc: '카드 비용이 0이 됩니다.' },
  strength: { name: '힘', icon: '💪', buff: true, desc: '가하는 피해가 증가합니다.' },
  dexterity: { name: '민첩', icon: '🤸', buff: true, desc: '얻는 방어막 수치가 증가합니다.' },
  echo_on_hit: { name: '타격 잔향', icon: '🎶', buff: true, desc: '공격 적중 시 추가 잔향을 획득합니다.' },

  blessing_of_light: { name: '빛의 축복', icon: '☀️', buff: true, desc: '매 턴 체력을 회복합니다.' },
  blessing_of_light_plus: { name: '빛의 축복+', icon: '🌞', buff: true, desc: '매 턴 더 많은 체력을 회복합니다.' },
  divine_grace: { name: '신의 은총', icon: '🙏', buff: true, desc: '방어막과 잔향을 동시에 획득합니다.' },
  divine_aura: { name: '신성 오라', icon: '😇', buff: true, desc: '턴 종료 시 방어막을 획득합니다.' },
  protection: { name: '보호', icon: '🧱', buff: true, desc: '다음에 받는 피해를 크게 줄입니다.' },
  endure_buff: { name: '인내', icon: '🪨', buff: true, desc: '다음 턴 공격 피해가 강화됩니다.' },

  berserk_mode: { name: '광전사의 격노', icon: '😡', buff: true, desc: '공격할수록 피해가 영구 누적됩니다.' },
  berserk_mode_plus: { name: '광전사의 격노+', icon: '🤬', buff: true, desc: '공격할수록 더 큰 피해가 영구 누적됩니다.' },
  echo_berserk: { name: '에코 광폭', icon: '⚔️', buff: true, desc: '잔향 스킬 발동 시 영구 공격 보너스를 얻습니다.' },

  unbreakable_wall: { name: '불굴의 벽', icon: '🧱', buff: true, desc: '턴 시작 시 방어막 비례 피해를 가합니다.' },
  unbreakable_wall_plus: { name: '불굴의 벽+', icon: '🏯', buff: true, desc: '턴 시작 시 더 큰 방어막 비례 피해를 가합니다.' },
  thorns: { name: '가시', icon: '🌹', buff: true, desc: '피격 시 공격자에게 고정 피해를 반사합니다.' },
  stunImmune: { name: '기절 면역', icon: '🛡️', buff: true, desc: '기절 효과를 지정된 횟수만큼 무효화합니다.' },

  weakened: { name: '약화', icon: '🪶', buff: false, desc: '가하는 피해가 감소합니다.' },
  slowed: { name: '감속', icon: '🐢', buff: false, desc: '다음 턴 시작 시 에너지가 감소합니다.' },
  burning: { name: '화상', icon: '🔥', buff: false, desc: '매 턴 화상 피해를 받습니다.' },
  cursed: { name: '저주', icon: '🕯', buff: false, desc: '카드 효과와 회복 효율이 감소합니다.' },
  poisoned: { name: '중독', icon: '☠', buff: false, desc: '턴 시작 시 중독 중첩에 비례한 피해를 받습니다.' },
  stunned: { name: '기절', icon: '⏸', buff: false, desc: '행동할 수 없습니다.' },
  confusion: { name: '혼란', icon: '🌀', buff: false, desc: '손패가 무작위로 재배열됩니다.' },
  vulnerable: { name: '취약', icon: '💔', buff: false, desc: '받는 피해가 증가합니다.' },
  marked: { name: '표식', icon: '🎯', buff: false, desc: '추가 피해를 유발하는 표식을 부여합니다.' },
  doom: { name: '파멸', icon: '💀', buff: false, desc: '카운트다운 종료 시 큰 피해가 발생합니다.' },
});

export const STATUS_NAME_OVERRIDES = Object.freeze({
  silence: '移⑤У',
});

export const ENEMY_STATUS_KR = Object.freeze({
  stunned: '기절',
  weakened: '약화',
  poisoned: '독',
  marked: '표식',
  branded: '낙인',
  mirror: '반사',
  immune: '무적',
  slowed: '감속',
  burning: '화상',
  abyss_regen: '심연 재생',
  draw_block: '드로우 간섭',
  doom: '파멸',
  cursed: '저주',
  dodge: '회피',
  thorns: '가시',
});

export const ENEMY_STATUS_DESC = Object.freeze({
  stunned: { icon: '⏸', desc: '행동 불가' },
  weakened: { icon: '🪶', desc: '가하는 피해 감소' },
  poisoned: { icon: '☠', desc: '턴 시작 시 독 중첩 × 5 피해' },
  marked: { icon: '🎯', desc: '표식 폭발 시 추가 피해' },
  branded: { icon: '🕯', desc: '대상 공격 시 공격자 체력 회복' },
  mirror: { icon: '🪞', desc: '받는 피해 반사' },
  immune: { icon: '🛡', desc: '받는 피해 무시' },
  slowed: { icon: '🐢', desc: '행동 지연' },
  burning: { icon: '🔥', desc: '매 턴 화상 피해' },
  abyss_regen: { icon: '💚', desc: '턴 시작 시 체력 회복' },
  draw_block: { icon: '🕳️', desc: '플레이어 드로우 1 감소' },
  doom: { icon: '☠️', desc: '카운트다운 종료 시 플레이어 대폭 피해' },
  cursed: { icon: '🕸', desc: '저주 페널티' },
  dodge: { icon: '💨', desc: '다음 공격 회피' },
  thorns: { icon: '🌵', desc: '근접 공격자에게 피해 반사' },
});
