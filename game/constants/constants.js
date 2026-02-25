'use strict';

// ═══════════════════════════════════════════════
//  게임 밸런스 상수 — 매직 넘버 중앙 관리
//  밸런싱 시 이 파일만 수정하면 됩니다.
// ═══════════════════════════════════════════════

export const CONSTANTS = Object.freeze({
  COMBAT: Object.freeze({
    ENEMY_TURN_DELAY_MS: 700,
    STATUS_TICK_INTERVAL: 1,
    CHAIN_BURST_THRESHOLD: 5,
  }),

  ECHO: Object.freeze({
    SKILL_COST_LOW: 30,
    SKILL_COST_MID: 60,
    SKILL_COST_HIGH: 100,
    BURST_THRESHOLD: 100,
  }),

  ECHO_SKILLS: Object.freeze({
    swordsman: {
      1: { cost: 30, desc: '20 피해 + 방어막 8', shortDesc: '20↯ + 방어막 8', dmg: 20, shield: 8, log: '⚔️ Echo 스킬! 20 + 방어막 8' },
      2: { cost: 60, desc: '30 피해 + 방어막 12', shortDesc: '30↯ + 방어막 12', dmg: 30, shield: 12, log: '⚔️ 잔향 강타! 30 + 방어막 12' },
      3: { cost: 100, desc: '전체 40 피해 + 방어막 20', shortDesc: '전체 40↯ + 방어막 20', aoedmg: 40, shield: 20, log: '⚔️ 잔향 폭발! 전체 40 + 방어막 20' }
    },
    mage: {
      1: { cost: 30, desc: '적 약화 2턴 + 드로우 1', shortDesc: '약화 2턴 + 드로우', weaken: 2, draw: 1, log: '🔮 예지! 약화 2턴 + 드로우 1' },
      2: { cost: 60, desc: '전체 18 피해 + 드로우 2', shortDesc: '전체 18↯ + 드로우 2', aoedmg: 18, echo: 15, draw: 2, log: '🔮 잔향파! 전체 18 + 드로우 2' },
      3: { cost: 100, desc: '전체 30 피해 + Echo 30 + 드로우 3', shortDesc: '전체 30↯ + 드로우 3', aoedmg: 30, echo: 30, draw: 3, log: '🔮 비전 폭풍! 전체 30 + Echo 30 + 드로우 3' }
    },
    hunter: {
      1: { cost: 30, desc: '20 피해', shortDesc: '20↯', dmg: 20, log: '🗡️ 숨격! 20 피해' },
      2: { cost: 60, desc: '32 피해 + 은신', shortDesc: '32↯ + 은신', dmg: 32, vanish: 1, log: '🗡️ 기습! 32 + 은신' },
      3: { cost: 100, desc: '암살 50 피해 + 은신 2턴', shortDesc: '기습 50↯ + 은신 2턴', dmg: 50, vanish: 2, log: '🗡️ 암살! 50 피해 + 은신 2턴' }
    },
    paladin: {
      1: { cost: 30, desc: '22 피해 + 8 회복', shortDesc: '22↯ + 8♥', dmg: 22, heal: 8, log: '✨ 신벌! 22 + 체력 8 회복' },
      2: { cost: 60, desc: '35 피해 + 15 회복', shortDesc: '35↯ + 15♥', dmg: 35, heal: 15, log: '✨ 신성한 망치! 35 + 체력 15 회복' },
      3: { cost: 100, desc: '전체 45 피해 + 25 회복', shortDesc: '전체 45↯ + 25♥', aoedmg: 45, heal: 25, log: '✨ 빛의 심판! 전체 45 + 체력 25 회복' }
    },
    berserker: {
      1: { cost: 30, desc: '35 피해 + 위력 영구 성장(+2)', shortDesc: '35↯ + 성장(+2)', dmg: 35, atkGrowth: 2, log: '😡 광분! 35 + 공격력 +2 성장' },
      2: { cost: 60, desc: '55 피해 + 위력 영구 성장(+5)', shortDesc: '55↯ + 성장(+5)', dmg: 55, atkGrowth: 5, log: '😡 피의 분노! 55 + 공격력 +5 성장' },
      3: { cost: 100, desc: '전체 70 피해 + 위력 영구 성장(+10)', shortDesc: '전체 70↯ + 성장(+10)', aoedmg: 70, atkGrowth: 10, log: '😡 끝없는 광기! 전체 70 + 공격력 +10 영구 성장' }
    },
    shielder: {
      1: { cost: 30, desc: '방어막 45', shortDesc: '방어막 45', shield: 45, log: '🧱 강철 방패! 방어막 45' },
      2: { cost: 60, desc: '방어막 65 + 전체 약화 3', shortDesc: '방어막 65 + 약화', shield: 65, weaken: 3, log: '🧱 철벽 요새! 방어막 65 + 적 전체 약화 3' },
      3: { cost: 100, desc: '방어막 100 + 1턴간 모든 피해 면역', shortDesc: '방어막 100 + 면역', shield: 100, immune: 1, log: '🧱 신의 아이기스! 방어막 100 + 1턴간 피해 면역' }
    },
  }),

  PLAYER: Object.freeze({
    LOW_HP_RATIO: 0.3,
    MID_HP_RATIO: 0.5,
    HIGH_HP_RATIO: 0.4,
    POISON_VIAL_STACKS: 2,
    DEFAULT_ENERGY: 3,
    MAX_ENERGY_CAP: 5,
  }),

  DIFFICULTY: Object.freeze({
    RUN_SCALE: 0.05,
    REGION_SCALE: 0.10,
    FLOOR_SCALE: 0.03,
    ASCENSION_GOLD_SCALE: 0.02,
  }),

  BOSS_PHASES: Object.freeze({
    SHADOW_KING: { phase2: 0.66, phase3: 0.33 },
    VOID_HORROR: { phase2: 0.55, phase3: 0.40 },
    DEFAULT: { phase2: 0.50, phase3: 0.30 },
  }),
});

(function (globalObj) {
  
})(typeof window !== 'undefined' ? window : global);
