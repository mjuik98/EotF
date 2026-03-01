const fs = require('fs');
const path = require('path');

const enemiesContent = fs.readFileSync(path.join('c:', 'Users', 'mjuik', 'RoguelikeRPG', 'data', 'enemies.js'), 'utf8');
const regionsContent = fs.readFileSync(path.join('c:', 'Users', 'mjuik', 'RoguelikeRPG', 'data', 'regions.js'), 'utf8');

// Simple regex to find enemy keys in enemies.js
// Expecting format like "key: {" or "  key: {"
const enemyKeysMatch = enemiesContent.match(/^\s*([a-zA-Z0-9_]+):\s*{/gm);
const allDefinedKeys = enemyKeysMatch.map(m => m.match(/([a-zA-Z0-9_]+)/)[1]);

// Simple regex to find all strings in regions.js that might be enemy keys
const allStringsInRegions = regionsContent.match(/'([a-zA-Z0-9_]+)'/g).map(s => s.slice(1, -1));
const assignedKeys = new Set(allStringsInRegions);

const missing = allDefinedKeys.filter(k => !assignedKeys.has(k));

console.log("--- Enemy Assignment Audit (V2) ---");
console.log(`Total defined keys found: ${allDefinedKeys.length}`);
console.log(`Missing assignments: ${missing.length}`);

if (missing.length > 0) {
    missing.forEach(k => {
        // Try to find region info in enemiesContent for this key
        const regionLine = enemiesContent.split('\n').find(line => line.includes(k + ':') || line.includes("id: '" + k + "'"));
        console.log(`- ${k}`);
        if (regionLine) console.log(`  (Line hint: ${regionLine.trim()})`);
    });
} else {
    console.log("\n✅ All defined enemies appear to be referenced in regions.js.");
}
