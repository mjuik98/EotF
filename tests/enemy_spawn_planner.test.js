import { describe, expect, it, vi } from 'vitest';

import { createEnemySpawnPlan } from '../game/features/combat/app/enemy_spawn_planner.js';

describe('enemy_spawn_planner', () => {
  it('returns hidden boss plan when the last region secret conditions are met', () => {
    const plan = createEnemySpawnPlan({
      gs: {
        currentRegion: 4,
        currentFloor: 1,
        currentNode: { type: 'boss' },
        worldMemory: { savedMerchant: 1 },
        meta: { storyPieces: ['a', 'b', 'c', 'd', 'e'] },
      },
      data: { enemies: { echo_origin: { id: 'echo_origin' }, ancient_echo: { id: 'ancient_echo' } } },
      mode: 'boss',
      getRegionData: () => ({ boss: ['ancient_echo'] }),
      getBaseRegionIndex: (idx) => idx,
      getRegionCount: () => 5,
    });

    expect(plan.isHiddenBoss).toBe(true);
    expect(plan.spawnedKeys).toEqual(['echo_origin']);
    expect(plan.entries[0].extra).toEqual({ phase: 1 });
  });

  it('returns elite-only plan on elite nodes and normal multi-enemy plans otherwise', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const elitePlan = createEnemySpawnPlan({
      gs: {
        currentRegion: 1,
        currentFloor: 3,
        currentNode: { type: 'elite' },
        worldMemory: {},
        meta: { storyPieces: [] },
      },
      data: { enemies: { elite_1: { id: 'elite_1' }, wolf: { id: 'wolf' } } },
      mode: 'normal',
      getRegionData: () => ({ elites: ['elite_1'], enemies: ['wolf'] }),
      getBaseRegionIndex: () => 1,
      getRegionCount: () => 5,
    });

    const normalPlan = createEnemySpawnPlan({
      gs: {
        currentRegion: 1,
        currentFloor: 3,
        currentNode: { type: 'combat' },
        worldMemory: {},
        meta: { storyPieces: [] },
      },
      data: { enemies: { wolf: { id: 'wolf' } } },
      mode: 'normal',
      getRegionData: () => ({ enemies: ['wolf'] }),
      getBaseRegionIndex: () => 1,
      getRegionCount: () => 5,
    });

    expect(elitePlan.spawnedKeys).toEqual(['elite_1']);
    expect(normalPlan.spawnedKeys.length).toBe(3);
    expect(normalPlan.spawnedKeys).toEqual(['wolf', 'wolf', 'wolf']);
    vi.restoreAllMocks();
  });
});
