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
    SHIELD: '방어막',
  }),

  ECHO: Object.freeze({
    SKILL_COST_LOW: 30,
    SKILL_COST_MID: 60,
    SKILL_COST_HIGH: 100,
    BURST_THRESHOLD: 100,
  }),

  ECHO_SKILLS: Object.freeze({
    swordsman: {
      1: { cost: 30, desc: '피해 24. 방어막 10.', shortDesc: '피해 24 / 방어막 10', dmg: 24, shield: 10, log: '🗡️ 환영검! 피해 24. 방어막 10.' },
      2: { cost: 60, desc: '피해 38. 방어막 15.', shortDesc: '피해 38 / 방어막 15', dmg: 38, shield: 15, log: '🗡️ 환영검무! 강타! 피해 38. 방어막 15.' },
      3: { cost: 100, desc: '모든 적에게 피해 48. 방어막 22.', shortDesc: '전체 피해 48 / 방어막 22', aoedmg: 48, shield: 22, log: '🗡️ 환영발도! 모든 적 피해 48. 방어막 22.' }
    },
    mage: {
      1: { cost: 30, desc: '약화 2턴 부여. 카드 1장 드로우. 잔향 10 충전.', shortDesc: '약화 2턴 / 드로우 1 / 잔향 10', weaken: 2, draw: 1, echo: 10, log: '🪄 예지! 약화 2턴. 카드 1장 뽑기. 잔향 10.' },
      2: { cost: 60, desc: '모든 적에게 피해 25. 카드 2장 드로우. 잔향 10 충전.', shortDesc: '전체 피해 25 / 드로우 2 / 잔향 10', aoedmg: 25, echo: 10, draw: 2, log: '🪄 잔향파! 모든 적 피해 25. 카드 2장 뽑기. 잔향 10.' },
      3: { cost: 100, desc: '모든 적에게 피해 38. 카드 3장 드로우. 잔향 20 충전.', shortDesc: '전체 피해 38 / 드로우 3 / 잔향 20', aoedmg: 38, echo: 20, draw: 3, log: '🪄 비전 폭풍! 모든 적 피해 38.  카드 3장 뽑기. 잔향 20.' }
    },
    hunter: {
      1: { cost: 30, desc: '피해 22. 독 2턴 부여.', shortDesc: '피해 22 / 독 2', dmg: 22, poison: 2, log: '⚔️ 습격! 피해 22. 독 2턴.' },
      2: { cost: 60, desc: '피해 32. 은신 1턴.', shortDesc: '피해 32 / 은신', dmg: 32, vanish: 1, log: '⚔️ 기습! 피해 32. 은신 1턴.' },
      3: { cost: 100, desc: '피해 45. 은신 2턴.', shortDesc: '피해 45 / 은신 2', dmg: 45, vanish: 2, log: '⚔️ 암살! 피해 45. 은신 2턴.' }
    },
    paladin: {
      1: { cost: 30, desc: '피해 20. 체력 8 회복.', shortDesc: '피해 20 / 회복 8', dmg: 20, heal: 8, log: '✨ 신벌! 피해 20. 회복 8.' },
      2: { cost: 60, desc: '피해 30. 체력 12 회복.', shortDesc: '피해 30 / 회복 12', dmg: 30, heal: 12, log: '✨ 신성한 망치! 피해 30. 회복 12.' },
      3: { cost: 100, desc: '모든 적에게 피해 38. 체력 20 회복.', shortDesc: '전체 피해 38 / 회복 20', aoedmg: 38, heal: 20, log: '✨ 빛의 심판! 모든 적 피해 38. 회복 20.' }
    },
    berserker: {
      1: { cost: 30, desc: '피해 22. 공격력 영구 +1.', shortDesc: '피해 22 / 성장 +1', dmg: 22, atkGrowth: 1, log: '🪓 광분! 피해 22. 공격력 1 영구 성장.' },
      2: { cost: 60, desc: '피해 36. 공격력 영구 +2.', shortDesc: '피해 36 / 성장 +2', dmg: 36, atkGrowth: 2, log: '🪓 피의 분노! 피해 36. 공격력 2 영구 성장.' },
      3: { cost: 100, desc: '모든 적에게 피해 45. 공격력 영구 +4.', shortDesc: '전체 피해 45 / 성장 +4', aoedmg: 45, atkGrowth: 4, log: '🪓 끝없는 광기! 모든 적 피해 45. 공격력 4 영구 성장.' }
    },
    guardian: {
      1: { cost: 30, desc: '방어막 28.', shortDesc: '방어막 28', shield: 28, log: '🛡️ 강철 방패! 방어막 28.' },
      2: { cost: 60, desc: '방어막 38. 모든 적에게 약화 2턴 부여.', shortDesc: '방어막 38 / 약화 2', shield: 38, weaken: 2, log: '🛡️ 철벽 요새! 방어막 38. 모든 적 약화 2.' },
      3: { cost: 100, desc: '방어막 50. 면역 1턴.', shortDesc: '방어막 50 / 면역 1', shield: 50, immune: 1, log: '🛡️ 신의 아이기스! 방어막 50. 1턴 동안 모든 피해 면역.' }
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
    BASE_MULTIPLIER_CAP: 3.0,
  }),

  BOSS_PHASES: Object.freeze({
    SHADOW_KING: { phase2: 0.66, phase3: 0.33 },
    VOID_HORROR: { phase2: 0.55, phase3: 0.40 },
    DEFAULT: { phase2: 0.50, phase3: 0.30 },
  }),
});
