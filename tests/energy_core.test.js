import { describe, expect, it, vi } from 'vitest';
import { ITEMS } from '../data/items.js';
import { Trigger } from '../game/data/triggers.js';

describe('energy_core relic', () => {
    it('increases max energy only on boss victory and max 2 times', () => {
        const energy_core = ITEMS.energy_core;
        const gs = {
            player: { maxEnergy: 3, energy: 3 },
            addLog: vi.fn(),
            markDirty: vi.fn()
        };

        // 1. Normal combat victory - should NOT increase
        energy_core.passive(gs, Trigger.COMBAT_END, { isBoss: false });
        expect(gs.player.maxEnergy).toBe(3);
        expect(gs.player._energyCoreCount).toBeUndefined();

        // 2. Boss combat victory 1 - should increase
        energy_core.passive(gs, Trigger.COMBAT_END, { isBoss: true });
        expect(gs.player.maxEnergy).toBe(4);
        expect(gs.player._energyCoreCount).toBe(1);
        expect(gs.addLog).toHaveBeenCalledWith(expect.stringContaining('에너지 핵'), 'echo');

        // 3. Boss combat victory 2 - should increase
        energy_core.passive(gs, Trigger.COMBAT_END, { isBoss: true });
        expect(gs.player.maxEnergy).toBe(5);
        expect(gs.player._energyCoreCount).toBe(2);

        // 4. Boss combat victory 3 - should NOT increase (limit 2)
        energy_core.passive(gs, Trigger.COMBAT_END, { isBoss: true });
        expect(gs.player.maxEnergy).toBe(5);
        expect(gs.player._energyCoreCount).toBe(2);
    });
});
