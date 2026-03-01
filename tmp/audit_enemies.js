import { ENEMIES } from './data/enemies.js';
import { REGIONS } from './data/regions.js';

const allEnemyKeys = Object.keys(ENEMIES);
const assignedEnemyKeys = new Set();
const assignedEliteKeys = new Set();
const assignedBossKeys = new Set();

REGIONS.forEach(region => {
    if (region.enemies) region.enemies.forEach(k => assignedEnemyKeys.add(k));
    if (region.elites) region.elites.forEach(k => assignedEliteKeys.add(k));
    if (region.boss) region.boss.forEach(k => assignedBossKeys.add(k));
});

const allAssignedKeys = new Set([...assignedEnemyKeys, ...assignedEliteKeys, ...assignedBossKeys]);

const missing = allEnemyKeys.filter(k => !allAssignedKeys.has(k));

console.log("--- Enemy Assignment Audit ---");
console.log(`Total enemies defined: ${allEnemyKeys.length}`);
console.log(`Total enemies assigned: ${allAssignedKeys.size}`);
console.log(`Missing assignments: ${missing.length}`);

if (missing.length > 0) {
    console.log("\nDetails of missing enemies:");
    missing.forEach(k => {
        const e = ENEMIES[k];
        const type = e.isBoss ? "BOSS" : (e.isElite ? "ELITE" : "NORMAL");
        console.log(`- [${type}] ${k} (${e.name}) -> Target Region: ${e.region}`);
    });
} else {
    console.log("\n✅ All defined enemies are correctly assigned to regions.");
}
