import { describe, expect, it } from 'vitest';

import {
  advanceRegionState,
  markRegionIntroStartState,
  normalizeTargetRegionId,
  replaceGeneratedMapState,
} from '../game/features/run/state/region_state_commands.js';

describe('region_state_commands', () => {
  it('normalizes and applies region transition state in one command', () => {
    const state = {
      currentRegion: 1,
      currentFloor: 4,
      regionRoute: {},
      stats: {
        regionClearTimes: {},
        _regionStartTs: 1000,
      },
    };

    const result = advanceRegionState(state, {
      now: 4600,
      targetRegionId: normalizeTargetRegionId('6'),
    });

    expect(result).toEqual({
      currentRegion: 2,
      currentFloor: 0,
      targetRegionId: 6,
    });
    expect(state.regionRoute['2']).toBe(6);
    expect(state.stats.regionClearTimes[1]).toBe(3600);
  });

  it('replaces map state and refreshes region intro start time', () => {
    const state = {
      currentFloor: 3,
      currentNode: { id: '3-2' },
      stats: {},
    };
    const mapNodes = [{ id: '1-0', floor: 1 }];

    replaceGeneratedMapState(state, mapNodes);
    markRegionIntroStartState(state, 9999);

    expect(state.mapNodes).toBe(mapNodes);
    expect(state.currentNode).toBeNull();
    expect(state.currentFloor).toBe(0);
    expect(state.stats._regionStartTs).toBe(9999);
  });
});
