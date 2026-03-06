const MAX_SET_BONUS_TIER = 5;

function normalizeTrigger(trigger) {
    return String(trigger || '').toLowerCase();
}

function getOwnedItemIds(gs) {
    return new Set(gs?.player?.items || []);
}

function countOwnedSetItems(owned, itemIds) {
    return itemIds.reduce((count, id) => count + (owned.has(id) ? 1 : 0), 0);
}

function resolveTargetIdx(gs, fallbackTargetIdx = null) {
    if (Number.isInteger(fallbackTargetIdx) && fallbackTargetIdx >= 0) return fallbackTargetIdx;

    const selected = Number(gs?._selectedTarget);
    if (Number.isInteger(selected) && selected >= 0 && (gs?.combat?.enemies?.[selected]?.hp || 0) > 0) {
        return selected;
    }

    return gs?.combat?.enemies?.findIndex?.((enemy) => enemy.hp > 0) ?? -1;
}

function getHighestUnlockedTier(bonuses, count) {
    return Math.min(
        count,
        Math.max(0, ...Object.keys(bonuses || {}).map((tier) => Number(tier) || 0), 0),
        MAX_SET_BONUS_TIER,
    );
}

const SETS = {
    void_set: {
        name: '심연의 삼위일체',
        items: ['void_eye', 'void_fang', 'void_crown'],
        bonuses: {
            2: { label: '심연의 각성 — Echo 게이지 최대 +20%' },
            3: { label: '심연의 완성 — 모든 피해 +15% + 턴 시작 Echo +15' },
        },
    },
    echo_set: {
        name: '반향의 삼각',
        items: ['echo_pendant', 'echo_bracer', 'echo_sigil'],
        bonuses: {
            2: { label: '반향의 공명 — Resonance Burst 게이지 -20 (80에서 발동)' },
            3: { label: '반향의 완성 — 매 턴 자동 Echo +20 추가' },
        },
    },
    blood_set: {
        name: '혈맹의 인장',
        items: ['blood_seal', 'blood_oath', 'blood_crown'],
        bonuses: {
            2: { label: '혈맹의 결의 — HP 최대치 +20' },
            3: { label: '혈맹의 완성 — 피해 받을 때 20% 확률 완전 무효' },
        },
    },
    storm_set: {
        name: '폭풍의 세 검',
        items: ['storm_needle', 'storm_crest', 'storm_herald'],
        bonuses: {
            2: { label: '폭풍의 세 검 — 카드 사용 시 잔향 +4' },
            3: { label: '폭풍의 세 검 — 연쇄 3 이상이면 공격 피해 +10%' },
        },
    },
    machine_set: {
        name: '기계의 심장',
        items: ['gear_cog', 'piston_drive', 'circuit_board'],
        bonuses: {
            2: { label: '기계의 심장 — 소멸 시 에너지 +1 (전투당 4회)' },
            3: { label: '기계의 심장 — 소멸 누적에 비례한 추가 피해' },
        },
    },
    moon_set: {
        name: '달의 신비',
        items: ['moon_veil', 'moon_ward', 'moon_crest', 'moon_shard', 'moon_orb'],
        bonuses: {
            2: { label: '달의 신비 — 회복 시 방어막 +2' },
            3: { label: '달의 신비 — 턴 시작 방어막 15 이상이면 체력 3 회복' },
            5: { label: '달의 신비 — 치명적 피해 1회 방지 및 체력 20 회복 (전투당 1회)' },
        },
    },
    dusk_set: {
        name: '황혼의 쌍인',
        items: ['dusk_fang', 'dusk_mark'],
        bonuses: {
            2: { label: '황혼의 쌍인 — 독 대상 공격 시 피해 +8' },
        },
    },
    plague_coven: {
        name: '역병의 결사',
        items: ['poison_gland_flask', 'thornvine_heart', 'plague_doctor_scalpel', 'decaying_shroud'],
        bonuses: {
            2: { label: '역병의 전조 — 독 피해 시 방어막 +1' },
            3: { label: '역병의 완성 — 독 피해량 +20%' },
        },
    },
    serpents_gaze: {
        name: '독사의 시선',
        items: ['serpent_fang_dagger', 'acidic_vial', 'cobra_scale_charm'],
        bonuses: {
            2: { label: '독사의 갈무리 — 독 피해 시 10% 확률로 다른 적에게 전이' },
            3: { label: '독사의 맹독 — 독 수치 10 이상인 적 공격 시 피해 +25%' },
        },
    },
    holy_grail: {
        name: '생명의 성배',
        items: ['monks_rosary', 'fountain_essence', 'life_bloom_seed'],
        bonuses: {
            2: { label: '성배의 자비 — 초과 회복량을 방어막으로 전환' },
            3: { label: '성배의 축복 — 회복 시 다음 공격 피해 +4' },
        },
    },
    titans_endurance: {
        name: '거인의 인내',
        items: ['titans_belt', 'endurance_medal', 'ancient_heart_stone'],
        bonuses: {
            2: { label: '거인의 위압 — 체력 80% 이상일 때 공격 피해 +5' },
            3: { label: '거인의 불사 — 치명적 피해를 1회 방지 (전투당 1회)' },
        },
    },
    iron_fortress: {
        name: '철옹성',
        items: ['bastion_shield_plate', 'spiked_buckler', 'fortified_gauntlet', 'guardian_seal', 'unyielding_fort'],
        bonuses: {
            2: { label: '철옹성의 방패 — 공격 시 현재 방어막의 20%만큼 추가 피해' },
            3: { label: '철옹성의 가시 — 가시 및 반사 피해 +5' },
            5: { label: '철옹성의 완성 — 턴 시작 시 방어막이 40 이상이면 에너지 1 회복' },
        },
    },
    judgement: {
        name: '심판의 불꽃',
        items: ['judgement_torch', 'judgement_ash', 'judgement_censer', 'judgement_scroll', 'judgement_blade'],
        bonuses: {
            2: { label: '심판의 개시 — 전투 시작 시 잔향 15 획득' },
            3: { label: '심판의 순환 — 카드 3장 사용할 때마다 에너지 1 회복' },
            5: { label: '심판의 완수 — 적 처치 시 체력 5 회복 및 방어막 10 획득' },
        },
    },
    shadow_venom: {
        name: '그림자 독사',
        items: ['shadow_venom_dagger', 'shadow_venom_cloak', 'shadow_venom_extract', 'shadow_venom_charm', 'shadow_venom_eye'],
        bonuses: {
            2: { label: '그림자 독사의 순환 — 독 피해 +2' },
            3: { label: '그림자 독사의 수확 — 독으로 적 처치 시 카드 1장 드로우' },
            5: { label: '그림자 독사의 완성 — 독 피해 발생 시 방어막 2 획득' },
        },
    },
    sanctuary: {
        name: '성역의 은총',
        items: ['sanctuary_rosary', 'sanctuary_chalice', 'sanctuary_shroud', 'sanctuary_lantern', 'sanctuary_wing'],
        bonuses: {
            2: { label: '성역의 축복 — 전투 시작 시 최대 체력 +10, 현재 체력도 +10' },
            3: { label: '성역의 순환 — 회복량이 최대 체력을 초과하면 초과분만큼 방어막 획득' },
            5: { label: '성역의 가호 — 턴 시작 시 체력 5 회복 + 무작위 디버프 1개 제거' },
        },
    },
};

export const SetBonusSystem = {
    sets: SETS,

    getOwnedSetCounts(gs) {
        const owned = getOwnedItemIds(gs);
        return Object.fromEntries(
            Object.entries(this.sets).map(([key, set]) => [key, countOwnedSetItems(owned, set.items)]),
        );
    },

    hasBonus(gs, setKey, tier) {
        const count = this.getOwnedSetCounts(gs)[setKey] || 0;
        return count >= tier;
    },

    getActiveSets(gs) {
        const counts = this.getOwnedSetCounts(gs);
        const active = [];

        for (const [key, set] of Object.entries(this.sets)) {
            const count = counts[key] || 0;
            if (count < 2) continue;

            const unlockedTier = getHighestUnlockedTier(set.bonuses, count);
            const unlockedBonuses = Object.entries(set.bonuses)
                .filter(([tier]) => count >= Number(tier))
                .map(([tier, bonus]) => ({ tier: Number(tier), ...bonus }));

            active.push({
                key,
                name: set.name,
                count,
                bonus: set.bonuses[unlockedTier] || null,
                bonuses: unlockedBonuses,
            });
        }

        return active;
    },

    applyPassiveBonuses(gs) {
        const counts = this.getOwnedSetCounts(gs);

        if (counts.void_set >= 2 && !gs._voidSet2Applied) {
            gs._voidSet2Applied = true;
            gs.player.maxEcho = Math.floor((gs.player.maxEcho || 0) * 1.2);
        }

        if (counts.echo_set >= 2) gs._echoSet2 = true;

        if (counts.blood_set >= 2 && !gs._bloodSet2Applied) {
            gs._bloodSet2Applied = true;
            gs.player.maxHp += 20;
            gs.player.hp += 20;
            gs.markDirty?.('hud');
        }
    },

    triggerSetBonuses(gs, trigger, data) {
        const counts = this.getOwnedSetCounts(gs);
        const normalizedTrigger = normalizeTrigger(trigger);

        if (normalizedTrigger === 'combat_start') {
            gs._machineSet2EnergyUsed = 0;
            gs._machineSet3DamageBonus = 0;
            gs._judgementSetCardCount = 0;
            gs._titanUsed = false;
            gs._moonSetReviveUsed = false;
            gs._sanctuarySet2Applied = false;
            gs._sanctuarySet2Bonus = 0;
            gs._grailNextBonus = 0;
        }

        if (normalizedTrigger === 'combat_end') {
            if (gs._sanctuarySet2Applied && gs._sanctuarySet2Bonus > 0) {
                gs.player.maxHp = Math.max(1, (gs.player.maxHp || 1) - gs._sanctuarySet2Bonus);
                gs.player.hp = Math.min(gs.player.hp || 0, gs.player.maxHp || 1);
                gs.markDirty?.('hud');
            }
            gs._sanctuarySet2Applied = false;
            gs._sanctuarySet2Bonus = 0;
            gs._machineSet2EnergyUsed = 0;
            gs._machineSet3DamageBonus = 0;
            gs._judgementSetCardCount = 0;
            gs._moonSetReviveUsed = false;
        }

        if (counts.void_set >= 3) {
            if (normalizedTrigger === 'deal_damage' && typeof data === 'number') {
                return Math.floor(data * 1.15);
            }
            if (normalizedTrigger === 'turn_start') {
                gs.addEcho?.(15, { name: '심연의 삼위일체 세트(3)', type: 'set' });
            }
        }

        if (counts.echo_set >= 3 && normalizedTrigger === 'turn_start') {
            gs.addEcho?.(20, { name: '반향의 삼각 세트(3)', type: 'set' });
        }

        if (counts.blood_set >= 3 && normalizedTrigger === 'damage_taken' && typeof data === 'number' && data > 0 && Math.random() < 0.2) {
            gs.addLog?.('💉 혈맹의 완성: 피해 무효!', 'echo');
            return true;
        }

        if (counts.storm_set >= 2 && normalizedTrigger === 'card_play') {
            gs.addEcho?.(4, { name: '폭풍의 세 검 세트(2)', type: 'set' });
        }
        if (counts.storm_set >= 3 && normalizedTrigger === 'deal_damage' && (gs.player.echoChain || 0) >= 3 && typeof data === 'number') {
            return Math.floor(data * 1.1);
        }

        if (counts.machine_set >= 2) {
            if (normalizedTrigger === 'card_exhaust' && (gs._machineSet2EnergyUsed || 0) < 4) {
                gs._machineSet2EnergyUsed = (gs._machineSet2EnergyUsed || 0) + 1;
                gs.player.energy = Math.min(gs.player.maxEnergy || 0, (gs.player.energy || 0) + 1);
                gs.markDirty?.('hud');
                gs.addLog?.('⚙️ 기계의 심장 세트(2): 에너지 +1', 'item');
            }
            if (normalizedTrigger === 'turn_start') {
                gs._machineSet3DamageBonus = counts.machine_set >= 3 ? (gs.player.exhausted?.length || 0) * 5 : 0;
            }
        }
        if (counts.machine_set >= 3 && normalizedTrigger === 'deal_damage' && (gs._machineSet3DamageBonus || 0) > 0 && typeof data === 'number') {
            return data + gs._machineSet3DamageBonus;
        }

        if (counts.moon_set >= 2 && normalizedTrigger === 'heal_amount' && typeof data === 'number' && data > 0) {
            gs.addShield?.(2, { name: '달의 신비 세트(2)', type: 'set' });
        }
        if (counts.moon_set >= 3 && normalizedTrigger === 'turn_start' && (gs.player.shield || 0) >= 15) {
            gs.heal?.(3, { name: '달의 신비 세트(3)', type: 'set' });
        }
        if (counts.moon_set >= 5 && normalizedTrigger === 'damage_taken' && typeof data === 'number' && data >= (gs.player.hp || 0) && !gs._moonSetReviveUsed) {
            gs._moonSetReviveUsed = true;
            gs.player.hp = 20;
            gs.markDirty?.('hud');
            gs.addLog?.('🌙 달의 신비: 치명적 피해 방지 및 체력 회복!', 'echo');
            return true;
        }

        if (counts.dusk_set >= 2 && normalizedTrigger === 'deal_damage' && typeof data === 'number') {
            const targetIdx = resolveTargetIdx(gs);
            if (targetIdx < 0) return undefined;
            const target = gs.combat?.enemies?.[targetIdx];
            if ((target?.statusEffects?.poisoned || 0) > 0) {
                return data + 8;
            }
        }

        if (counts.plague_coven >= 2 && normalizedTrigger === 'poison_damage') {
            const amount = typeof data === 'number' ? data : data?.amount;
            if (amount > 0) gs.addShield?.(1, { name: '역병의 결사 세트(2)', type: 'set' });
        }
        if (counts.plague_coven >= 3 && normalizedTrigger === 'poison_damage') {
            if (typeof data === 'number') return Math.floor(data * 1.2);
            if (data && typeof data.amount === 'number') return { ...data, amount: Math.floor(data.amount * 1.2) };
        }

        if (counts.serpents_gaze >= 2 && normalizedTrigger === 'poison_damage' && data?.amount > 0 && Math.random() < 0.1) {
            const aliveIndices = (gs.combat?.enemies || [])
                .map((enemy, idx) => (enemy.hp > 0 ? idx : -1))
                .filter((idx) => idx !== -1);
            if (aliveIndices.length > 1) {
                const others = aliveIndices.filter((idx) => idx !== data.targetIdx);
                const targetIdx = others[Math.floor(Math.random() * others.length)];
                if (Number.isInteger(targetIdx)) {
                    gs.applyEnemyStatus?.('poisoned', 2, targetIdx, { name: '독사의 시선 세트(2)', type: 'set' });
                    gs.addLog?.('🐍 독사의 갈무리: 독 전이!', 'echo');
                }
            }
        }
        if (counts.serpents_gaze >= 3 && normalizedTrigger === 'deal_damage' && typeof data === 'number') {
            const targetIdx = resolveTargetIdx(gs);
            if (targetIdx >= 0 && (gs.combat?.enemies?.[targetIdx]?.statusEffects?.poisoned || 0) >= 10) {
                return Math.floor(data * 1.25);
            }
        }

        if (counts.holy_grail >= 2 && normalizedTrigger === 'heal_amount' && typeof data === 'number' && data > 0) {
            const currentHp = gs.player.hp || 0;
            const maxHp = gs.player.maxHp || 0;
            const overflow = Math.max(0, currentHp + data - maxHp);
            if (overflow > 0) {
                gs.addShield?.(overflow, { name: '생명의 성배 세트(2)', type: 'set' });
                return Math.max(0, maxHp - currentHp);
            }
        }
        if (counts.holy_grail >= 3 && normalizedTrigger === 'heal_amount' && typeof data === 'number' && data > 0) {
            gs._grailNextBonus = (gs._grailNextBonus || 0) + 4;
        }
        if (counts.holy_grail >= 3 && normalizedTrigger === 'deal_damage' && typeof data === 'number' && (gs._grailNextBonus || 0) > 0) {
            const bonus = gs._grailNextBonus;
            gs._grailNextBonus = 0;
            return data + bonus;
        }

        if (counts.titans_endurance >= 2 && normalizedTrigger === 'deal_damage' && typeof data === 'number' && (gs.player.hp || 0) >= (gs.player.maxHp || 0) * 0.8) {
            return data + 5;
        }
        if (counts.titans_endurance >= 3 && normalizedTrigger === 'damage_taken' && typeof data === 'number' && data >= (gs.player.hp || 0) && !gs._titanUsed) {
            gs._titanUsed = true;
            gs.player.hp = 1;
            gs.markDirty?.('hud');
            gs.addLog?.('🛡️ 거인의 불사: 치명적 피해 방지!', 'echo');
            return true;
        }

        if (counts.iron_fortress >= 2 && normalizedTrigger === 'deal_damage' && typeof data === 'number') {
            let result = data + Math.floor((gs.player.shield || 0) * 0.2);
            // 3세트도 같은 트리거이므로 여기서 누적 처리
            const isReflect = gs._isReflectDamage || (typeof data === 'object' && data?.isReflect);
            if (counts.iron_fortress >= 3 && isReflect) {
                result += 5;
            }
            return result;
        }
        if (counts.iron_fortress >= 5 && normalizedTrigger === 'turn_start' && (gs.player.shield || 0) >= 40) {
            gs.player.energy = Math.min(gs.player.maxEnergy || 0, (gs.player.energy || 0) + 1);
            gs.markDirty?.('hud');
            gs.addLog?.('🛡️ 철옹성 세트(5): 에너지 +1', 'item');
        }

        if (counts.judgement >= 2 && normalizedTrigger === 'combat_start') {
            gs.addEcho?.(15, { name: '심판의 불꽃 세트(2)', type: 'set' });
        }
        if (counts.judgement >= 3) {
            if (normalizedTrigger === 'card_play') {
                gs._judgementSetCardCount = (gs._judgementSetCardCount || 0) + 1;
                if (gs._judgementSetCardCount % 3 === 0) {
                    gs.player.energy = Math.min(gs.player.maxEnergy || 0, (gs.player.energy || 0) + 1);
                    gs.markDirty?.('hud');
                    gs.addLog?.('🔥 심판의 불꽃 세트(3): 에너지 회복', 'item');
                }
            }
        }
        if (counts.judgement >= 5 && normalizedTrigger === 'enemy_kill') {
            gs.heal?.(5, { name: '심판의 불꽃 세트(5)', type: 'set' });
            gs.addShield?.(10, { name: '심판의 불꽃 세트(5)', type: 'set' });
        }

        if (counts.shadow_venom >= 2 && normalizedTrigger === 'poison_damage') {
            if (typeof data === 'number') return data + 2;
            if (data && typeof data.amount === 'number') return { ...data, amount: data.amount + 2 };
        }
        if (counts.shadow_venom >= 3 && normalizedTrigger === 'enemy_kill' && gs._lastKillByPoison) {
            gs.drawCards?.(1, { name: '그림자 독사 세트(3)', type: 'set' });
        }
        if (counts.shadow_venom >= 5 && normalizedTrigger === 'poison_damage') {
            const amount = typeof data === 'number' ? data : (data?.amount || 0);
            if (amount > 0) gs.addShield?.(2, { name: '그림자 독사 세트(5)', type: 'set' });
        }

        if (counts.sanctuary >= 2 && normalizedTrigger === 'combat_start' && !gs._sanctuarySet2Applied) {
            gs._sanctuarySet2Applied = true;
            gs._sanctuarySet2Bonus = 10;
            gs.player.maxHp += 10;
            gs.player.hp += 10;
            gs.markDirty?.('hud');
        }
        if (counts.sanctuary >= 3 && normalizedTrigger === 'heal_amount' && typeof data === 'number' && data > 0) {
            const currentHp = gs.player.hp || 0;
            const maxHp = gs.player.maxHp || 0;
            const overflow = Math.max(0, currentHp + data - maxHp);
            if (overflow > 0) {
                gs.addShield?.(overflow, { name: '성역의 은총 세트(3)', type: 'set' });
            }
        }
        if (counts.sanctuary >= 5 && normalizedTrigger === 'turn_start') {
            gs.heal?.(5, { name: '성역의 은총 세트(5)', type: 'set' });
            if (gs.player.statusEffects) {
                const debuffs = Object.keys(gs.player.statusEffects).filter((key) => gs.player.statusEffects[key] > 0);
                if (debuffs.length > 0) {
                    const target = debuffs[Math.floor(Math.random() * debuffs.length)];
                    gs.player.statusEffects[target] = 0;
                    gs.addLog?.(`✨ 성역의 은총 세트(5): ${target} 제거!`, 'item');
                }
            }
        }

        return undefined;
    },
};
