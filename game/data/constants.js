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
      1: { cost: 30, desc: '피해 20. 방어도 8.', shortDesc: '피해 20 / 방어도 8', dmg: 20, shield: 8, log: '⚔️ 잔향 스킬! 피해 20. 방어도 8.' },
      2: { cost: 60, desc: '피해 30. 방어도 12.', shortDesc: '피해 30 / 방어도 12', dmg: 30, shield: 12, log: '⚔️ 잔향 강타! 피해 30. 방어도 12.' },
      3: { cost: 100, desc: '모든 적에게 피해 40. 방어도 20.', shortDesc: '전체 피해 40 / 방어도 20', aoedmg: 40, shield: 20, log: '⚔️ 잔향 폭발! 모든 적 피해 40. 방어도 20.' }
    },
    mage: {
      1: { cost: 30, desc: '약화 2턴 부여. 카드 1장 드로우. 잔향 10 충전.', shortDesc: '약화 2턴 / 드로우 1 / 잔향 10', weaken: 2, draw: 1, echo: 10, log: '🔮 예지! 약화 2턴. 카드 1장 뽑기. 잔향 10.' },
      2: { cost: 60, desc: '모든 적에게 피해 18. 카드 2장 드로우.', shortDesc: '전체 피해 18 / 드로우 2', aoedmg: 18, echo: 15, draw: 2, log: '🔮 잔향파! 모든 적 피해 18. 카드 2장 뽑기.' },
      3: { cost: 100, desc: '모든 적에게 피해 30. 카드 3장 드로우. 잔향 30 충전.', shortDesc: '전체 피해 30 / 드로우 3', aoedmg: 30, echo: 30, draw: 3, log: '🔮 비전 폭풍! 모든 적 피해 30. 잔향 30. 카드 3장 뽑기.' }
    },
    hunter: {
      1: { cost: 30, desc: '피해 22. 독 1턴 부여.', shortDesc: '피해 22 / 독 1', dmg: 22, poison: 1, log: '🗡️ 숨격! 피해 22. 독 1.' },
      2: { cost: 60, desc: '피해 32. 은신. (이번 공격 치명타)', shortDesc: '피해 32 / 은신', dmg: 32, vanish: 1, log: '🗡️ 기습! 피해 32. 은신 1턴.' },
      3: { cost: 100, desc: '피해 50. 은신 2턴.', shortDesc: '피해 50 / 은신 2', dmg: 50, vanish: 2, log: '🗡️ 암살! 피해 50. 은신 2턴.' }
    },
    paladin: {
      1: { cost: 30, desc: '피해 22. 체력 8 회복.', shortDesc: '피해 22 / 회복 8', dmg: 22, heal: 8, log: '✨ 신벌! 피해 22. 회복 8.' },
      2: { cost: 60, desc: '피해 35. 체력 15 회복.', shortDesc: '피해 35 / 회복 15', dmg: 35, heal: 15, log: '✨ 신성한 망치! 피해 35. 회복 15.' },
      3: { cost: 100, desc: '모든 적에게 피해 45. 체력 25 회복.', shortDesc: '전체 피해 45 / 회복 25', aoedmg: 45, heal: 25, log: '✨ 빛의 심판! 모든 적 피해 45. 회복 25.' }
    },
    berserker: {
      1: { cost: 30, desc: '피해 25. 공격력 영구 +1.', shortDesc: '피해 25 / 성장 +1', dmg: 25, atkGrowth: 1, log: '😡 광분! 피해 25. 공격력 1 영구 성장.' },
      2: { cost: 60, desc: '피해 45. 공격력 영구 +3.', shortDesc: '피해 45 / 성장 +3', dmg: 45, atkGrowth: 3, log: '😡 피의 분노! 피해 45. 공격력 3 영구 성장.' },
      3: { cost: 100, desc: '모든 적에게 피해 55. 공격력 영구 +7.', shortDesc: '전체 피해 55 / 성장 +7', aoedmg: 55, atkGrowth: 7, log: '😡 끝없는 광기! 모든 적 피해 55. 공격력 7 영구 성장.' }
    },
    shielder: {
      1: { cost: 30, desc: '방어도 45.', shortDesc: '방어도 45', shield: 45, log: '🧱 강철 방패! 방어도 45.' },
      2: { cost: 60, desc: '방어도 55. 모든 적에게 약화 3턴 부여.', shortDesc: '방어도 55 / 약화 3', shield: 55, weaken: 3, log: '🧱 철벽 요새! 방어도 55. 모든 적 약화 3.' },
      3: { cost: 100, desc: '방어도 70. 면역 1턴.', shortDesc: '방어도 70 / 면역 1턴', shield: 70, immune: 1, log: '🧱 신의 아이기스! 방어도 70. 1턴 동안 모든 피해 면역.' }
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
