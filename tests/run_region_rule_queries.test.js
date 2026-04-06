import { describe, expect, it, vi } from 'vitest';

import {
  getBaseRegionIndex,
  getRegionCount,
  getRegionIdForStage,
  resolveRegionData,
} from '../game/features/run/domain/run_region_rule_queries.js';

describe('run_region_rule_queries', () => {
  it('reads region sequence metadata from injected data without touching runtime state', () => {
    const data = {
      baseRegionSequence: [2, 4, 1],
    };

    expect(getRegionCount(data)).toBe(3);
    expect(getBaseRegionIndex(4, data)).toBe(1);
    expect(getRegionIdForStage(4, {
      data,
      regionRoute: { '4': 7 },
    })).toBe(7);
  });

  it('builds endless region data and returns the next floor cache map without mutating inputs', () => {
    const data = {
      baseRegionSequence: [2, 1],
      regions: [
        { id: 1, name: '균열 회랑', floors: 6 },
        { id: 2, name: '메아리 숲', floors: 7 },
      ],
    };
    const regionFloors = {};
    const rollRegionFloors = vi.fn(() => 8);

    const { nextRegionFloors, region } = resolveRegionData(3, {
      data,
      endless: true,
      regionFloors,
      regionRoute: {},
      rollRegionFloors,
    });

    expect(regionFloors).toEqual({});
    expect(rollRegionFloors).toHaveBeenCalledTimes(1);
    expect(nextRegionFloors).toEqual({ '3': 8 });
    expect(region).toEqual(expect.objectContaining({
      _baseRegion: 1,
      _endlessCycle: 1,
      _resolvedRegionId: 1,
      floors: 8,
    }));
    expect(region.name).toContain('· 순환 2');
  });
});
