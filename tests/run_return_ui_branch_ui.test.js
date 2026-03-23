import { describe, expect, it, vi } from 'vitest';
import {
  normalizeRouteOptions,
  resolveBranchTargetRegion,
} from '../game/features/run/public.js';

describe('run_return_ui_branch_ui', () => {
  it('normalizes route options and drops invalid entries', () => {
    const options = normalizeRouteOptions([
      { regionId: 3.8, label: '심연', difficulty: '위험', rewardMod: '1.5' },
      null,
      { regionId: 'bad' },
      { regionId: 1 },
      { regionId: 2 },
    ]);

    expect(options).toEqual([
      { regionId: 3, label: '심연', difficulty: '위험', rewardMod: 1.5 },
      { regionId: 1, label: '지역 1', difficulty: '미확인', rewardMod: 1 },
    ]);
  });

  it('resolves branch target directly when only one valid route exists', async () => {
    const target = await resolveBranchTargetRegion(
      { currentRegion: 0 },
      {
        data: {
          branchRoutes: {
            after_region_0: [{ regionId: 4, label: '유리 숲' }],
          },
        },
        getRegionCount: () => 5,
      },
    );

    expect(target).toBe(4);
  });
});
