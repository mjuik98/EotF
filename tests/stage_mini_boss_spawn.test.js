import { describe, expect, it } from 'vitest';
import { DATA } from '../data/game_data.js';
import { CombatInitializer } from '../game/features/combat/public.js';

function createState(regionId) {
  return {
    currentRegion: regionId,
    worldMemory: {},
    currentNode: { type: 'mini_boss' },
    combat: { enemies: [] },
    meta: {
      storyPieces: [],
      codex: { enemies: new Set(), cards: new Set(), items: new Set() },
    },
    triggerItems: () => {},
  };
}

function getRegionDataById(regionId) {
  return DATA.regions.find((region) => Number(region.id) === Number(regionId)) || null;
}

describe('stage mini boss configuration', () => {
  it('defines exactly one dedicated mini boss per region', () => {
    DATA.regions.forEach((region) => {
      expect(Array.isArray(region.miniBoss)).toBe(true);
      expect(region.miniBoss.length).toBe(1);

      const miniBossId = region.miniBoss[0];
      const enemy = DATA.enemies[miniBossId];
      expect(enemy).toBeTruthy();
      expect(enemy.isMiniBoss).toBe(true);
      expect(Number(enemy.region)).toBe(Number(region.id));
    });
  });

  it('spawns the stage mini boss on mini_boss combat nodes', () => {
    DATA.regions.forEach((region) => {
      const gs = createState(region.id);
      const expectedMiniBossId = region.miniBoss[0];

      const result = CombatInitializer.spawnEnemies(gs, DATA, 'mini_boss', {
        getRegionData: (idx) => getRegionDataById(idx),
        getBaseRegionIndex: (idx) => Number(idx) || 0,
        getRegionCount: () => DATA.regions.length,
        difficultyScaler: null,
      });

      expect(result.spawnedKeys).toEqual([expectedMiniBossId]);
      expect(gs.combat.enemies.length).toBe(1);
      expect(gs.combat.enemies[0].id).toBe(expectedMiniBossId);
      expect(gs.combat.enemies[0].isMiniBoss).toBe(true);
    });
  });
});
