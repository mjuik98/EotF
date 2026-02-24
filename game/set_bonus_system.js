// Set Bonus System extraction: logic moved from data/game_data.js
const SetBonusSystem = {
    sets: {
        void_set: {
            name: '심연의 삼위일체',
            items: ['void_eye', 'void_fang', 'void_crown'],
            bonuses: {
                2: { label: '심연의 각성 — Echo 게이지 최대 +20%', apply(gs) { if (!gs._voidSet2) { gs._voidSet2 = true; gs.player.maxEcho = Math.floor(gs.player.maxEcho * 1.2); } } },
                3: { label: '심연의 완성 — 모든 피해 +15% + 턴 시작 Echo +15', apply(gs) { gs._voidSet3 = true; } },
            }
        },
        echo_set: {
            name: '잔향의 삼각',
            items: ['echo_pendant', 'echo_bracer', 'echo_sigil'],
            bonuses: {
                2: { label: '잔향의 공명 — Resonance Burst 게이지 -20 (80에서 발동)', apply(gs) { gs._echoSet2 = true; } },
                3: { label: '잔향의 완성 — 매 턴 자동 Echo +20 추가', apply(gs) { gs._echoSet3 = true; } },
            }
        },
        blood_set: {
            name: '혈맹의 인장',
            items: ['blood_seal', 'blood_oath', 'blood_crown'],
            bonuses: {
                2: { label: '혈맹의 결의 — HP 최대치 +20', apply(gs) { if (!gs._bloodSet2) { gs._bloodSet2 = true; gs.player.maxHp += 20; gs.player.hp += 20; } } },
                3: { label: '혈맹의 완성 — 피해 받을 때 20% 확률 완전 무효', apply(gs) { gs._bloodSet3 = true; } },
            }
        },
    },

    getActiveSets(gs) {
        const owned = new Set(gs.player.items);
        const active = [];
        for (const [key, set] of Object.entries(this.sets)) {
            const count = set.items.filter(id => owned.has(id)).length;
            if (count >= 2) {
                active.push({ key, name: set.name, count, bonus: set.bonuses[Math.min(count, 3)] });
            }
        }
        return active;
    },

    applyPassiveBonuses(gs) {
        const owned = new Set(gs.player.items);
        for (const [key, set] of Object.entries(this.sets)) {
            const count = set.items.filter(id => owned.has(id)).length;
            if (count >= 2 && set.bonuses[2]) set.bonuses[2].apply(gs);
            if (count >= 3 && set.bonuses[3]) set.bonuses[3].apply(gs);
        }
    },

    triggerSetBonuses(gs, trigger, data) {
        const owned = new Set(gs.player.items);

        // 심연 3세트: 피해 +15%
        if (gs._voidSet3 && trigger === 'deal_damage' && data) return Math.floor(data * 1.15);
        // 심연 3세트: 턴 시작 Echo +15
        if (owned.has('void_eye') && owned.has('void_fang') && owned.has('void_crown')) {
            if (trigger === 'turn_start') { gs.addEcho(15); }
        }

        // 잔향 2세트: Burst 게이지 감소 (80에서 발동)
        // 잔향 3세트: 매 턴 Echo +20 추가
        if (gs._echoSet3 && trigger === 'turn_start') { gs.addEcho(20); }

        // 혈맹 3세트: 20% 피해 무효
        if (gs._bloodSet3 && trigger === 'damage_taken' && data > 0 && Math.random() < 0.2) {
            gs.addLog('💉 혈맹의 완성: 피해 무효!', 'echo');
            return true;
        }
    },
};
