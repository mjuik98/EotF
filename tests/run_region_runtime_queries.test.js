import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  getRegionData,
  getRegionIdForStage,
} from '../game/features/run/application/run_region_runtime_queries.js';

describe('run_region_runtime_queries', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('normalizes runtime state containers and caches rolled region floors on demand', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.25);

    const gs = {
      regionFloors: null,
      regionRoute: [],
      runConfig: { endless: true },
    };

    const region = getRegionData(6, gs);

    expect(gs.regionRoute).toEqual({});
    expect(gs.regionFloors).toEqual(expect.objectContaining({
      '6': expect.any(Number),
    }));
    expect(region).toEqual(expect.objectContaining({
      floors: gs.regionFloors['6'],
      _endlessCycle: 1,
    }));
  });

  it('keeps explicit routed region ids on the stateful runtime surface', () => {
    const gs = {
      regionRoute: { '2': 3 },
      runConfig: { endless: false },
    };

    expect(getRegionIdForStage(2, gs)).toBe(3);
  });
});
