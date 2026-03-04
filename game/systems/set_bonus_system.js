export // Set Bonus System extraction: logic moved from data/game_data.js
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
            storm_set: {
                name: '폭풍의 세 검',
                items: ['storm_needle', 'storm_crest', 'storm_herald'],
                bonuses: {
                    2: { label: '카드 사용 시 잔향 +4', apply() { } },
                    3: { label: '연쇄 3 이상이면 공격 피해 +10%', apply() { } },
                }
            },
            machine_set: {
                name: '기계의 심장',
                items: ['gear_cog', 'piston_drive', 'circuit_board'],
                bonuses: {
                    2: { label: '소멸 시 에너지 +1 (전투당 4회)', apply() { } },
                    3: { label: '소멸 누적에 비례한 추가 피해', apply() { } },
                }
            },
            moon_set: {
                name: '달의 삼위',
                items: ['moon_veil', 'moon_ward', 'moon_crest'],
                bonuses: {
                    2: { label: '회복 시 방어막 +2', apply() { } },
                    3: { label: '턴 시작 방어막 15 이상이면 체력 3 회복', apply() { } },
                }
            },
            dusk_set: {
                name: '황혼의 쌍인',
                items: ['dusk_fang', 'dusk_mark'],
                bonuses: {
                    2: { label: '황혼의 쌍인 — 독 대상 공격 시 피해 +8', apply() { } },
                }
            },
            plague_coven: {
                name: '역병의 결사',
                items: ['poison_gland_flask', 'thornvine_heart', 'plague_doctor_scalpel', 'decaying_shroud'],
                bonuses: {
                    2: { label: '역병의 전조 — 독 피해 시 방어막 +1', apply(gs) { gs._plagueSet2 = true; } },
                    3: { label: '역병의 완성 — 독 피해량 +20%', apply(gs) { gs._plagueSet3 = true; } },
                }
            },
            serpents_gaze: {
                name: '독사의 시선',
                items: ['serpent_fang_dagger', 'acidic_vial', 'cobra_scale_charm'],
                bonuses: {
                    2: { label: '독사의 갈무리 — 독 피해 시 10% 확률로 다른 적에게 전이', apply(gs) { gs._serpentSet2 = true; } },
                    3: { label: '독사의 맹독 — 독 수치 10 이상인 적 공격 시 피해 +25%', apply(gs) { gs._serpentSet3 = true; } },
                }
            },
            holy_grail: {
                name: '생명의 성배',
                items: ['monks_rosary', 'fountain_essence', 'life_bloom_seed'],
                bonuses: {
                    2: { label: '성배의 자비 — 초과 회복량을 방어막으로 전환', apply(gs) { gs._grailSet2 = true; } },
                    3: { label: '성배의 축복 — 회복 시 다음 공격 피해 +4', apply(gs) { gs._grailSet3 = true; } },
                }
            },
            titans_endurance: {
                name: '거인의 인내',
                items: ['titans_belt', 'endurance_medal', 'ancient_heart_stone'],
                bonuses: {
                    2: { label: '거인의 위압 — 체력 80% 이상일 때 공격 피해 +5', apply(gs) { gs._titanSet2 = true; } },
                    3: { label: '거인의 불사 — 치명적 피해를 1회 방지 (전투당 1회)', apply(gs) { gs._titanSet3 = true; } },
                }
            },
            iron_fortress: {
                name: '철옹성',
                items: ['bastion_shield_plate', 'spiked_buckler', 'fortified_gauntlet'],
                bonuses: {
                    2: { label: '철옹성의 비축 — 턴 시작 시 방어막 보유 시 25% 확률로 에너지 +1', apply(gs) { gs._fortSet2 = true; } },
                    3: { label: '철옹성의 반격 — 공격 시 현재 방어막의 20%만큼 추가 피해', apply(gs) { gs._fortSet3 = true; } },
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

            // 역병 2세트: 독 피해 시 방어막 +1
            if (gs._plagueSet2 && trigger === 'poison_damage' && data > 0) {
                gs.addShield(1, { name: '역병 세트', type: 'item' });
            }

            // 역병 3세트: 독 피해량 +20%
            if (gs._plagueSet3 && trigger === 'poison_damage' && typeof data === 'number') {
                return Math.floor(data * 1.2);
            }
            if (gs._plagueSet3 && trigger === 'poison_damage' && data && typeof data.amount === 'number') {
                return { ...data, amount: Math.floor(data.amount * 1.2) };
            }

            // 독사의 시선 3세트
            if (gs._serpentSet3 && trigger === 'deal_damage') {
                const selected = Number(gs._selectedTarget);
                const targetIdx = Number.isInteger(selected) && selected >= 0 ? selected : (gs.combat?.enemies?.findIndex(e => e.hp > 0) ?? -1);
                if ((gs.combat?.enemies?.[targetIdx]?.statusEffects?.poisoned || 0) >= 10) {
                    return Math.floor((data || 0) * 1.25);
                }
            }
            // 독사의 시선 2세트
            if (gs._serpentSet2 && trigger === 'poison_damage' && data.amount > 0 && Math.random() < 0.1) {
                const aliveIndices = gs.combat?.enemies?.map((e, i) => e.hp > 0 ? i : -1).filter(i => i !== -1) || [];
                if (aliveIndices.length > 1) {
                    const others = aliveIndices.filter(i => i !== data.targetIdx);
                    const targetIdx = others[Math.floor(Math.random() * others.length)];
                    gs.applyEnemyStatus('poisoned', 2, targetIdx, { name: '독사 세트', type: 'item' });
                    gs.addLog('🐍 독사의 갈무리: 독 전이!', 'echo');
                }
            }

            // 생명의 성배 2세트
            if (gs._grailSet2 && trigger === 'heal_amount' && typeof data === 'number') {
                const potentialHp = (gs.player.hp || 0) + data;
                const maxHp = gs.player.maxHp || 100;
                if (potentialHp > maxHp) {
                    const overheal = potentialHp - maxHp;
                    if (overheal > 0) gs.addShield(overheal, { name: '성배 세트', type: 'item' });
                    return Math.max(0, maxHp - (gs.player.hp || 0));
                }
            }
            // 생명의 성배 3세트
            if (gs._grailSet3 && trigger === 'heal_amount' && data > 0) {
                gs._grailNextBonus = (gs._grailNextBonus || 0) + 4;
            }
            if (gs._grailNextBonus && trigger === 'deal_damage') {
                const bonus = gs._grailNextBonus;
                gs._grailNextBonus = 0;
                return (data || 0) + bonus;
            }

            // 거인의 인내 2세트
            if (gs._titanSet2 && trigger === 'deal_damage' && (gs.player.hp || 0) >= (gs.player.maxHp || 0) * 0.8) {
                return (data || 0) + 5;
            }
            // 거인의 인내 3세트
            if (gs._titanSet3 && trigger === 'damage_taken' && data >= (gs.player.hp || 0) && !gs._titanUsed) {
                gs._titanUsed = true;
                gs.player.hp = 1;
                gs.addLog('🛡️ 거인의 불사: 치명적 피해 방지!', 'echo');
                return true;
            }

            // 철옹성 2세트
            if (gs._fortSet2 && trigger === 'turn_start' && (gs.player.shield || 0) > 0 && Math.random() < 0.25) {
                gs.player.energy = Math.min(gs.player.maxEnergy, (gs.player.energy || 0) + 1);
                gs.addLog('🔋 철옹성의 비축: 에너지 +1!', 'item');
            }
            // 철옹성 3세트
            if (gs._fortSet3 && trigger === 'deal_damage') {
                return (data || 0) + Math.floor((gs.player.shield || 0) * 0.2);
            }
        },
    };
