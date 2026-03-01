import { CombatInitializer } from '../game/combat/combat_initializer.js';
import { DATA } from '../data/game_data.js';

const auditRegion = (regionIdx, targetEnemyIds) => {
    const gs = {
        currentRegion: regionIdx,
        currentFloor: 1,
        combat: { enemies: [] },
        meta: { codex: { enemies: new Set() } }
    };

    const deps = {
        getRegionData: (idx) => DATA.regions[idx],
        getBaseRegionIndex: (idx) => idx,
        getRegionCount: () => DATA.regions.length,
        difficultyScaler: { scaleEnemy: (enemy) => enemy }
    };

    const spawnedCounts = {};
    targetEnemyIds.forEach(id => spawnedCounts[id] = 0);

    for (let i = 0; i < 200; i++) {
        gs.combat.enemies = [];
        CombatInitializer.spawnEnemies(gs, DATA, false, deps);
        gs.combat.enemies.forEach(enemy => {
            if (spawnedCounts[enemy.id] !== undefined) spawnedCounts[enemy.id]++;
        });
    }

    console.log(`\n--- Verification for Region ${regionIdx} (${DATA.regions[regionIdx].name}) ---`);
    console.table(spawnedCounts);

    const success = targetEnemyIds.every(id => spawnedCounts[id] > 0);
    if (success) {
        console.log(`✅ Region ${regionIdx} SUCCESS: All target enemies spawned.`);
    } else {
        console.log(`❌ Region ${regionIdx} FAILURE: Some target enemies did not spawn.`);
    }
    return success;
};

console.log("Starting full verification...");
const r0 = auditRegion(0, ['slime', 'goblin', 'orc', 'fallen_knight']);
const r2 = auditRegion(2, ['nightmare_specter']);

if (r0 && r2) {
    console.log("\n✨ OVERALL SUCCESS: All missing monsters are now correctly assigned and spawnable!");
} else {
    process.exit(1);
}
