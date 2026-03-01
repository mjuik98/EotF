import { ENEMIES } from '../data/enemies.js';
import { REGIONS } from '../data/regions.js';

const allEnemyKeys = Object.keys(ENEMIES);
const assignedKeys = new Set();

REGIONS.forEach(region => {
    if (region.enemies) region.enemies.forEach(k => assignedKeys.add(k));
    if (region.elites) region.elites.forEach(k => assignedKeys.add(k));
    if (region.boss) region.boss.forEach(k => assignedKeys.add(k));
});

const missing = allEnemyKeys.filter(k => !assignedKeys.has(k));

console.log("--- Definitive Audit ---");
console.log(`Missing: ${missing.length}`);
missing.forEach(k => {
    console.log(`- ${k} (Region field: ${ENEMIES[k].region})`);
});
