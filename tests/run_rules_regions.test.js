import { describe, expect, it } from 'vitest';
import { getRegionData, getRegionIdForStage } from '../game/systems/run_rules.js';

describe('RunRules region helpers', () => {
  it('prefers explicit routed region ids for a stage', () => {
    const gs = {
      regionRoute: { '2': 3 },
      runConfig: { endless: false },
    };

    expect(getRegionIdForStage(2, gs)).toBe(3);
  });

  it('annotates endless cycle metadata when region index exceeds base sequence', () => {
    const gs = {
      regionRoute: {},
      regionFloors: {},
      runConfig: { endless: true },
    };

    const region = getRegionData(6, gs);

    expect(region).not.toBeNull();
    expect(region._endlessCycle).toBe(1);
    expect(region._baseRegion).toBeGreaterThanOrEqual(0);
  });
});
