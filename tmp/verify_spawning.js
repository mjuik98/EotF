import { CombatInitializer } from '../game/combat/combat_initializer.js';
import { DATA } from '../data/game_data.js';

// Mock Game State
const gs = {
    currentRegion: 0,
    currentFloor: 1,
    combat: {
        enemies: []
    },
    meta: {
        codex: {
            enemies: new Set()
        }
    }
};

// Mock dependencies
const deps = {
    getRegionData: (idx) => DATA.regions[idx],
    getBaseRegionIndex: (idx) => idx,
    getRegionCount: () => DATA.regions.length,
    difficultyScaler: {
        scaleEnemy: (enemy) => enemy
    }
};

console.log("--- Starting Verification for Region 0 Spawning ---");

const spawnedCounts = {
    slime: 0,
    goblin: 0,
    orc: 0,
    other: 0
};

// Run 100 iterations to check if the new enemies appear
for (let i = 0; i < 100; i++) {
    gs.combat.enemies = [];
    CombatInitializer.spawnEnemies(gs, DATA, false, deps);

    gs.combat.enemies.forEach(enemy => {
        if (spawnedCounts[enemy.id] !== undefined) {
            spawnedCounts[enemy.id]++;
        } else {
            spawnedCounts.other++;
        }
    });
}

console.log("Spawn results after 100 iterations:");
console.table(spawnedCounts);

const success = spawnedCounts.slime > 0 && spawnedCounts.goblin > 0 && spawnedCounts.orc > 0;
if (success) {
    console.log("\n✅ SUCCESS: Slime, Goblin, and Orc are now spawning correctly!");
} else {
    console.log("\n❌ FAILURE: Some missing enemies still not spawning.");
}
