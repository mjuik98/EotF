'use strict';

// ═══════════════════════════════════════════════
//  게임 밸런스 상수 — 매직 넘버 중앙 관리
//  밸런싱 시 이 파일만 수정하면 됩니다.
// ═══════════════════════════════════════════════

const CONSTANTS = Object.freeze({
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

  BOSS: Object.freeze({
    PHASE2_HP_RATIO: 0.5,
    PHASE2_HP_RATIO_HIGH: 0.55,
    PHASE2_HP_RATIO_MID: 0.6,
    PHASE3_HP_RATIO: 0.3,
    PHASE2_HP_RATIO_66: 0.66,
    PHASE3_HP_RATIO_33: 0.33,
    PHASE2_HP_RATIO_70: 0.7,
    PHASE3_HP_RATIO_40: 0.4,
  }),
});

(function (globalObj) {
  globalObj.CONSTANTS = CONSTANTS;
})(typeof window !== 'undefined' ? window : global);
