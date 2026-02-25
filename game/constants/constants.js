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

  BOSS_PHASES: Object.freeze({
    SHADOW_KING: { phase2: 0.66, phase3: 0.33 },
    VOID_HORROR: { phase2: 0.55, phase3: 0.40 },
    DEFAULT: { phase2: 0.50, phase3: 0.30 },
  }),
});

(function (globalObj) {
  globalObj.CONSTANTS = CONSTANTS;
})(typeof window !== 'undefined' ? window : global);
