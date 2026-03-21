import { describe, expect, it } from 'vitest';
import { ClassProgressionSystem } from '../game/systems/class_progression_system.js';

function createGs(overrides = {}) {
  return {
    meta: {
      runConfig: { ascension: 0 },
      ...overrides.meta,
    },
    player: {
      class: 'swordsman',
      kills: 0,
      ...overrides.player,
    },
    currentFloor: 0,
    currentRegion: 0,
    combat: {
      miniBossDefeated: false,
      bossDefeated: false,
      ...overrides.combat,
    },
    ...overrides,
  };
}

describe('ClassProgressionSystem', () => {
  it('initializes class progression buckets in meta', () => {
    const meta = {};
    ClassProgressionSystem.ensureMeta(meta, ['swordsman', 'mage']);

    expect(meta.classProgress).toBeTruthy();
    expect(meta.classProgress.levels.swordsman).toBe(1);
    expect(meta.classProgress.levels.mage).toBe(1);
    expect(meta.classProgress.xp.swordsman).toBe(0);
    expect(Array.isArray(meta.classProgress.pendingSummaries)).toBe(true);
    expect(meta.classProgress.loadoutPresets.swordsman).toEqual({
      level11: null,
      level12: null,
    });
  });

  it('awards run xp and stores pending summary', () => {
    const gs = createGs({
      player: { class: 'swordsman', kills: 11 },
      currentFloor: 7,
      combat: { miniBossDefeated: true },
    });

    ClassProgressionSystem.ensureMeta(gs.meta, ['swordsman']);
    const summary = ClassProgressionSystem.awardRunXP(gs, 'victory', {
      classIds: ['swordsman'],
      bossCleared: true,
      ascension: 2,
      regionCount: 5,
    });

    expect(summary).toBeTruthy();
    expect(summary.totalGain).toBeGreaterThan(0);
    expect(summary.after.totalXp).toBe(summary.before.totalXp + summary.totalGain);
    expect(summary.rewards.some((row) => row.label.includes('보스'))).toBe(true);
    expect(gs.meta.classProgress.pendingSummaries).toHaveLength(1);
  });

  it('creates multi-level-up summary when gain is large enough', () => {
    const gs = createGs({
      player: { class: 'swordsman', kills: 30 },
      currentFloor: 10,
      combat: { miniBossDefeated: true },
    });

    ClassProgressionSystem.ensureMeta(gs.meta, ['swordsman']);
    gs.meta.classProgress.xp.swordsman = 90;
    gs.meta.classProgress.levels.swordsman = 1;

    const summary = ClassProgressionSystem.awardRunXP(gs, 'victory', {
      classIds: ['swordsman'],
      bossCleared: true,
      ascension: 5,
      regionCount: 5,
    });

    expect(summary.after.level).toBeGreaterThan(summary.before.level);
    expect(summary.levelUps.length).toBeGreaterThan(0);
  });

  it('consumes pending summary in fifo order', () => {
    const gs = createGs();
    ClassProgressionSystem.ensureMeta(gs.meta, ['swordsman']);

    ClassProgressionSystem.awardRunXP(gs, 'defeat', { classIds: ['swordsman'] });
    ClassProgressionSystem.awardRunXP(gs, 'defeat', { classIds: ['swordsman'] });

    const first = ClassProgressionSystem.consumePendingSummary(gs.meta, ['swordsman']);
    const second = ClassProgressionSystem.consumePendingSummary(gs.meta, ['swordsman']);
    const empty = ClassProgressionSystem.consumePendingSummary(gs.meta, ['swordsman']);

    expect(first).toBeTruthy();
    expect(second).toBeTruthy();
    expect(empty).toBeNull();
  });
});
