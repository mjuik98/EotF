import { ClassMechanics } from '../game/combat/class_mechanics.js';
import { DamageSystem } from '../game/combat/damage_system.js';

// Mock Game State
const mockGS = {
    player: {
        class: 'hunter',
        hp: 80,
        maxHp: 80,
        shield: 100,
        buffs: {},
    },
    combat: {
        active: true,
        enemies: [
            { name: 'Slime', hp: 100, maxHp: 100, statusEffects: {} }
        ],
        log: []
    },
    addLog: (msg) => mockGS.combat.log.push(msg),
    applyEnemyStatus: (status, duration, targetIdx) => {
        mockGS.combat.enemies[targetIdx].statusEffects[status] = duration;
    },
    addBuff: (id, stacks) => {
        mockGS.player.buffs[id] = { stacks };
    },
    getBuff: (id) => mockGS.player.buffs[id] || null,
    addShield: (amount) => { mockGS.player.shield += amount; },
    dealDamage: (amount, targetIdx) => {
        // Simple mock of dealDamage trigger
        mockGS.combat.enemies[targetIdx].hp -= amount;
        ClassMechanics.hunter.onDealDamage(mockGS, amount, targetIdx);
    },
    markDirty: () => { }
};

console.log("--- Hunter Trait Test ---");
for (let i = 1; i <= 5; i++) {
    mockGS.dealDamage(10, 0);
    console.log(`Hit ${i}: Enemy HP=${mockGS.combat.enemies[0].hp}`);
}
console.log("Poison:", mockGS.combat.enemies[0].statusEffects.poisoned);
console.log("Stealth(Vanish):", mockGS.player.buffs.vanish ? "Yes" : "No");

console.log("\n--- Guardian Trait Test ---");
mockGS.player.class = 'guardian';
mockGS.player.shield = 100;
mockGS.player._preservedShield = 0;
ClassMechanics.guardian.onTurnEnd(mockGS);
console.log("Preserved Shield:", mockGS.player._preservedShield);
ClassMechanics.guardian.onTurnStart(mockGS);
console.log("Player Shield after turn start:", mockGS.player.shield);

console.log("\n✅ Simulation complete.");
