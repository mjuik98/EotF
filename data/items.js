/**
 * items.js — 아이템/유물 데이터
 */
import { LogUtils } from '../game/utils/log_utils.js';
import { CARDS } from './cards.js';
import { Trigger } from '../game/data/triggers.js';
import { CONSTANTS } from '../game/data/constants.js';

function getCardCost(cardId) {
    return CARDS?.[cardId]?.cost ?? 0;
}

function discardDrawnCard(gs, cardId, sourceName) {
    const hand = gs?.player?.hand;
    if (!Array.isArray(hand)) return false;
    const idx = hand.lastIndexOf(cardId);
    if (idx < 0) return false;
    hand.splice(idx, 1);
    if (!Array.isArray(gs.player.graveyard)) gs.player.graveyard = [];
    gs.player.graveyard.push(cardId);
    gs.markDirty?.('hand');
    if (sourceName) gs.addLog?.(LogUtils.formatItem(sourceName, `${CARDS?.[cardId]?.name || cardId} 버림`), 'item');
    return true;
}

function exhaustDrawnCard(gs, cardId, sourceName) {
    const hand = gs?.player?.hand;
    if (!Array.isArray(hand)) return false;
    const idx = hand.lastIndexOf(cardId);
    if (idx < 0) return false;
    hand.splice(idx, 1);
    if (!Array.isArray(gs.player.exhausted)) gs.player.exhausted = [];
    gs.player.exhausted.push(cardId);
    gs.markDirty?.('hand');
    const exhaustResult = gs.triggerItems?.(Trigger.CARD_EXHAUST, { cardId });
    if (exhaustResult === true) {
        const exIdx = gs.player.exhausted.lastIndexOf(cardId);
        if (exIdx >= 0) gs.player.exhausted.splice(exIdx, 1);
        if (!Array.isArray(gs.player.graveyard)) gs.player.graveyard = [];
        gs.player.graveyard.push(cardId);
        if (sourceName) gs.addLog?.(LogUtils.formatItem(sourceName, `${CARDS?.[cardId]?.name || cardId} 소멸 방지`), 'item');
        return true;
    }
    if (sourceName) gs.addLog?.(LogUtils.formatItem(sourceName, `${CARDS?.[cardId]?.name || cardId} 소멸`), 'item');
    return true;
}

function getSpecialRelicProgress(gs) {
    if (!gs?.player) return {};
    const current = gs.player._specialRelicProgress;
    if (!current || typeof current !== 'object' || Array.isArray(current)) {
        gs.player._specialRelicProgress = {};
    }
    return gs.player._specialRelicProgress;
}

function advanceSpecialRelicAwakening(gs, {
    dormantId,
    awakenedId,
    awakenedName = null,
    requiredCombats,
    sourceName,
}) {
    if (!gs?.player || !dormantId || !awakenedId) return false;
    const idx = gs.player.items?.indexOf?.(dormantId) ?? -1;
    if (idx < 0) return false;

    const progress = getSpecialRelicProgress(gs);
    const current = Number(progress[dormantId]) || 0;
    const next = Math.min(requiredCombats, current + 1);
    progress[dormantId] = next;

    if (next < requiredCombats) {
        gs.addLog?.(`🌱 ${sourceName}: 개화 진행 ${next}/${requiredCombats}`, 'echo');
        return false;
    }

    gs.player.items[idx] = awakenedId;
    delete progress[dormantId];
    gs.meta?.codex?.items?.add?.(awakenedId);
    gs.addLog?.(`🌌 ${sourceName} 개화: ${awakenedName || awakenedId}`, 'item');
    return true;
}

export const ITEMS = {
    // ══════════════ COMMON (회색) ══════════════
    void_compass: {
        id: 'void_compass', name: '공허의 나침반', icon: '🧭', rarity: 'common',
        desc: '전투 시작: 카드 1장 드로우.',
        passive(gs, trigger) { if (trigger === Trigger.COMBAT_START) { gs.drawCards(1, { name: '공허의 나침반', type: 'item' }); } }
    },
    void_shard: {
        id: 'void_shard', name: '공허의 파편', icon: '🔷', rarity: 'common',
        desc: '전투 종료: 잔향 20 충전.',
        passive(gs, trigger) { if (trigger === Trigger.COMBAT_END) { gs.addEcho(20, { name: '공허의 파편', type: 'item' }); } }
    },
    cracked_amulet: {
        id: 'cracked_amulet', name: '부서진 목걸이', icon: '📿', rarity: 'common',
        desc: '매 턴: 체력 2 회복.',
        passive(gs, trigger) { if (trigger === Trigger.TURN_START) { gs.heal(2, { name: '부서진 목걸이', type: 'item' }); } }
    },
    worn_pouch: {
        id: 'worn_pouch', name: '낡은 주머니', icon: '👜', rarity: 'common',
        desc: '전투 시작: 골드 5 획득.',
        passive(gs, trigger) { if (trigger === Trigger.COMBAT_START) { gs.addGold(5, { name: '낡은 주머니', type: 'item' }); } }
    },
    dull_blade: {
        id: 'dull_blade', name: '무딘 검', icon: '🔪', rarity: 'common',
        desc: '카드 사용 시: 10% 확률로 잔향 10 충전.',
        passive(gs, trigger) { if (trigger === Trigger.CARD_PLAY && Math.random() < 0.1) { gs.addEcho(10, { name: '무딘 검', type: 'item' }); } }
    },
    travelers_map: {
        id: 'travelers_map', name: '여행자의 지도', icon: '🗺️', rarity: 'common',
        desc: '층 이동 시: 체력 3 회복.',
        passive(gs, trigger) { if (trigger === Trigger.FLOOR_START) { gs.heal(3, { name: '여행자의 지도', type: 'item' }); } }
    },
    rift_talisman: {
        id: 'rift_talisman', name: '균열의 부적', icon: '💍', rarity: 'common',
        desc: '전투 시작: 방어막 5 획득.',
        passive(gs, trigger) { if (trigger === Trigger.COMBAT_START) { gs.addShield(5, { name: '균열의 부적', type: 'item' }); } }
    },
    blood_shard: {
        id: 'blood_shard', name: '핏빛 파편', icon: '🍷', rarity: 'common',
        desc: '적 처치 시: 잔향 10 충전.',
        passive(gs, trigger) { if (trigger === Trigger.ENEMY_KILL) { gs.addEcho(10, { name: '핏빛 파편', type: 'item' }); } }
    },
    // ══════════════ UNCOMMON (파랑) ══════════════
    blood_gem: {
        id: 'blood_gem', name: '혈정', icon: '🔴', rarity: 'uncommon',
        desc: '피해를 받을 때마다 잔향을 15 충전합니다.',
        passive(gs, trigger, data) { if (trigger === Trigger.DAMAGE_TAKEN && data > 0) { gs.addEcho(15, { name: '혈정', type: 'item' }); } }
    },
    phantom_cloak: {
        id: 'phantom_cloak', name: '환영 망토', icon: '🧥', rarity: 'uncommon',
        desc: '전투 시작: 회피 1 획득.',
        trigger: Trigger.COMBAT_START,
        passive(gs, trigger) { if (trigger === Trigger.COMBAT_START) { gs.addBuff('dodge', 1, { name: '환영 망토', type: 'item' }); } }
    },
    cursed_tome: {
        id: 'cursed_tome', name: '저주받은 마도서', icon: '📕', rarity: 'uncommon',
        desc: '카드 드로우 시: 30% 확률로 잔향 10 충전, 체력 1 감소.',
        passive(gs, trigger) {
            if (trigger === Trigger.CARD_DRAW && Math.random() < 0.3) {
                gs.addEcho(10, { name: '저주받은 마도서', type: 'item' });
                gs.player.hp = Math.max(1, gs.player.hp - 1);
                gs.markDirty?.('hud');
            }
        }
    },
    ancient_rune: {
        id: 'ancient_rune', name: '고대의 룬석', icon: '🗿', rarity: 'uncommon',
        desc: '보스전 시작 시 최대 체력이 20% 증가합니다.',
        passive(gs, trigger) { if (trigger === Trigger.BOSS_START) { gs.player.maxHp = Math.floor(gs.player.maxHp * 1.2); gs.player.hp = Math.min(gs.player.hp + 20, gs.player.maxHp); gs.addLog(LogUtils.formatItem('고대의 룬석', '체력 강화'), 'item'); gs.markDirty?.('hud'); } }
    },
    echo_chain_ring: {
        id: 'echo_chain_ring', name: '연쇄의 반지', icon: '🔗', rarity: 'uncommon',
        desc: '연쇄가 2 이상이라면, 공격의 피해가 5 증가합니다.',
        passive(gs, trigger, data) { if (trigger === Trigger.DEAL_DAMAGE && gs.player.echoChain >= 2) return (data || 0) + 5; }
    },
    bone_charm: {
        id: 'bone_charm', name: '뼈 부적', icon: '🦴', rarity: 'uncommon',
        desc: '적을 처치할 때마다 회복 5.',
        passive(gs, trigger) { if (trigger === Trigger.ENEMY_KILL) { gs.heal(5, { name: '뼈 부적', type: 'item' }); } }
    },
    poison_vial: {
        id: 'poison_vial', name: '독 약병', icon: '🧪', rarity: 'uncommon',
        desc: '전투 시작 시 모든 적에게 독 2턴 부여.',
        passive(gs, trigger) { if (trigger === Trigger.COMBAT_START) { gs.combat.enemies.forEach((_, i) => gs.applyEnemyStatus('poisoned', 2, i, { name: '독 약병', type: 'item' })); } }
    },
    shadow_mask: {
        id: 'shadow_mask', name: '그림자 가면', icon: '🎭', rarity: 'uncommon',
        desc: '카드를 3장 연속으로 사용할 때마다 방어막를 8 얻습니다.',
        passive(gs, trigger) { if (trigger === Trigger.CARD_PLAY) { gs._maskCount = (gs._maskCount || 0) + 1; if (gs._maskCount >= 3) { gs.addShield(8, { name: '그림자 가면', type: 'item' }); gs._maskCount = 0; } } }
    },
    // ══════════════ RARE (금색) ══════════════
    resonance_stone: {
        id: 'resonance_stone', name: '공명석', icon: '💎', rarity: 'rare',
        desc: '잔향 연쇄가 3 이상이라면, 카드 소멸이 버리기로 전환됩니다.',
        passive(gs, trigger) {
            if (trigger === Trigger.CARD_EXHAUST && gs.player.echoChain >= 3) {
                gs.addLog('💎 공명석: 소멸을 버리기로 전환!', 'echo');
                return true;
            }
        }
    },
    silence_ring: {
        id: 'silence_ring', name: '침묵의 반지', icon: '💍', rarity: 'rare',
        desc: '체력이 30% 미만이라면, 모든 카드의 비용이 2 감소합니다.',
        passive(gs, trigger) { if (trigger === Trigger.TURN_START) { const low = gs.player.hp < gs.player.maxHp * CONSTANTS.PLAYER.LOW_HP_RATIO; if (low) { gs.player.costDiscount = Math.max(gs.player.costDiscount || 0, 2); gs.addLog('💍 침묵의 반지: 비용 -2!', 'echo'); } } }
    },
    echo_amplifier: {
        id: 'echo_amplifier', name: '잔향 증폭기', icon: '📡', rarity: 'rare',
        desc: '잔향 연쇄의 피해가 30% 증가합니다.',
        passive(gs, trigger, data) { if (trigger === Trigger.CHAIN_DMG) return Math.floor(data * 1.3); }
    },
    temporal_lens: {
        id: 'temporal_lens', name: '시간의 렌즈', icon: '🔍', rarity: 'rare',
        desc: '매 3턴마다 사용하는 카드 1장의 비용을 0으로 만듭니다.',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START) {
                gs._temporalTurn = (gs._temporalTurn || 0) + 1;
                if (gs._temporalTurn % 3 === 0) {
                    gs.player._freeCardUses = (gs.player._freeCardUses || 0) + 1;
                    gs.addLog('🔍 시간의 렌즈: 이번 턴 카드 1장 무료!', 'echo');
                }
            }
        }
    },
    echo_mirror: {
        id: 'echo_mirror', name: '잔향의 거울', icon: '🪞', rarity: 'rare',
        desc: '공명 폭발 발동 시 주는 피해가 50% 증가합니다.',
        passive(gs, trigger, data) { if (trigger === Trigger.RESONANCE_BURST) return Math.floor((data || 0) * 1.5); }
    },
    void_crystal: {
        id: 'void_crystal', name: '공허의 수정', icon: '💠', rarity: 'rare',
        desc: '피해를 받을 때 15% 확률로 해당 피해를 완전히 무효화합니다.',
        passive(gs, trigger, data) { if (trigger === Trigger.DAMAGE_TAKEN && data > 0 && Math.random() < 0.15) { gs.addLog('💠 공허의 수정: 피해 무효화!', 'echo'); return true; } }
    },
    bloodsoaked_robe: {
        id: 'bloodsoaked_robe', name: '피에 물든 로브', icon: '🩸', rarity: 'rare',
        desc: '체력이 50% 미만이라면, 주는 모든 피해가 20% 증가합니다.',
        passive(gs, trigger, data) {
            if (trigger === Trigger.DEAL_DAMAGE && gs.player.hp < gs.player.maxHp * CONSTANTS.PLAYER.MID_HP_RATIO) {
                return Math.floor((data || 0) * 1.2);
            }
        }
    },
    echo_gauntlet: {
        id: 'echo_gauntlet', name: '잔향의 건틀릿', icon: '🥊', rarity: 'rare',
        desc: '연쇄가 5에 도달하면, 즉시 적에게 기절 1턴을 부여합니다.',
        passive(gs, trigger) {
            if (trigger === Trigger.CHAIN_REACH_5) {
                const aliveIdx = gs.combat.enemies.findIndex(e => e.hp > 0);
                if (aliveIdx >= 0) {
                    gs.applyEnemyStatus('stunned', 1, aliveIdx);
                    gs.addLog('🥊 잔향의 건틀릿: 적 기절!', 'echo');
                }
            }
        }
    },
    war_drum: {
        id: 'war_drum', name: '전쟁의 북', icon: '🥁', rarity: 'rare',
        desc: '전투 시작 시 에너지를 1 얻습니다. (해당 전투 한정)',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START && !gs._warDrumActive) {
                gs._warDrumBaseMax = gs.player.maxEnergy;
                gs.player.maxEnergy += 1;
                gs.player.energy = Math.min(gs.player.energy + 1, gs.player.maxEnergy);
                gs._warDrumActive = true;
                gs.addLog('🥁 전쟁의 북: 에너지 +1!', 'echo');
                gs.markDirty?.('hud');
            }
            if ((trigger === Trigger.COMBAT_END || trigger === 'death') && gs._warDrumActive) {
                gs.player.maxEnergy = gs._warDrumBaseMax ?? Math.max(1, gs.player.maxEnergy - 1);
                gs._warDrumActive = false;
                gs._warDrumBaseMax = undefined;
            }
        }
    },
    // ── 에너지 증감 유물 ──
    energy_core: {
        id: 'energy_core', name: '에너지 핵', icon: '⚡', rarity: 'uncommon',
        desc: '전투를 완료할 때마다 최대 에너지가 1 영구적으로 증가합니다. (최대 5)',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_END) {
                if (gs.player.maxEnergy < CONSTANTS.PLAYER.MAX_ENERGY_CAP) {
                    gs.player.maxEnergy++;
                    gs.player.energy = gs.player.maxEnergy;
                    gs.addLog('⚡ 에너지 핵: 최대 에너지 +1 영구 증가!', 'echo');
                    if (typeof updateUI === 'function') updateUI();
                }
            }
        }
    },
    echo_battery: {
        id: 'echo_battery', name: '잔향 전지', icon: '🔋', rarity: 'common',
        desc: '카드를 버릴 때마다 에너지를 1 얻습니다. (턴당 1회 한정)',
        passive(gs, trigger) {
            if (trigger === Trigger.CARD_DISCARD && !gs._batteryUsedTurn) { gs.player.energy = Math.min(gs.player.maxEnergy, gs.player.energy + 1); gs._batteryUsedTurn = true; gs.addLog('🔋 잔향 전지: 에너지 +1 얻음!', 'echo'); if (typeof updateUI === 'function') updateUI(); }
            if (trigger === Trigger.TURN_START) gs._batteryUsedTurn = false;
        }
    },
    cursed_capacitor: {
        id: 'cursed_capacitor', name: '저주받은 축전기', icon: '🌩️', rarity: 'uncommon',
        desc: '매 턴 시작 시 에너지를 1 추가로 얻지만, 체력을 3 잃습니다.',
        passive(gs, trigger) { if (trigger === Trigger.TURN_START) { gs.player.energy = Math.min(gs.player.maxEnergy, gs.player.energy + 1); gs.player.hp = Math.max(1, gs.player.hp - 3); gs.addLog('🌩️ 저주받은 축전기: 에너지 +1 / 체력 -3', 'echo'); if (typeof updateUI === 'function') updateUI(); } }
    },
    void_battery: {
        id: 'void_battery', name: '공허의 전지', icon: '🔌', rarity: 'rare',
        desc: '잔향이 50 이상이라면, 매 턴 시작 시 에너지를 1 추가로 얻습니다.',
        passive(gs, trigger) { if (trigger === Trigger.TURN_START && gs.player.echo >= 50) { gs.player.energy = Math.min(gs.player.maxEnergy + 1, gs.player.energy + 1); gs.addLog('🔌 공허의 전지: 에너지 +1!', 'echo'); if (typeof updateUI === 'function') updateUI(); } }
    },
    surge_crystal: {
        id: 'surge_crystal', name: '쇄도의 수정', icon: '💫', rarity: 'legendary',
        desc: '전투 시작: 이번 전투 동안 최대 에너지 +1.',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START && !gs._surgeActive) {
                gs._surgeBaseMax = gs.player.maxEnergy;
                gs.player.maxEnergy += 1;
                gs.player.energy = gs.player.maxEnergy;
                gs._surgeActive = true;
                gs.addLog('💫 쇄도의 수정: 이번 전투 최대 에너지 +1!', 'echo');
                if (typeof updateUI === 'function') updateUI();
            }
            if ((trigger === Trigger.COMBAT_END || trigger === 'death') && gs._surgeActive) {
                gs.player.maxEnergy = gs._surgeBaseMax ?? Math.max(1, gs.player.maxEnergy - 1);
                gs.player.energy = Math.min(gs.player.energy, gs.player.maxEnergy);
                gs._surgeActive = false;
                gs._surgeBaseMax = undefined;
            }
        }
    },
    exhaust_fan: {
        id: 'exhaust_fan', name: '소멸의 부채', icon: '🎐', rarity: 'uncommon',
        desc: '카드가 소멸할 때마다 방어막 3 획득.',
        passive(gs, trigger) { if (trigger === Trigger.CARD_EXHAUST) { gs.addShield(3, { name: '소멸의 부채', type: 'item' }); } }
    },
    energy_battery: {
        id: 'energy_battery', name: '에너지 전지', icon: '⚡', rarity: 'uncommon',
        desc: '에너지 획득 시 20% 확률로 잔향 10 충전.',
        passive(gs, trigger) { if (trigger === Trigger.ENERGY_GAIN) { if (Math.random() < 0.2) { gs.addEcho(10, { name: '에너지 전지', type: 'item' }); } } }
    },
    // ── 추가 유물 팩: Echo / Chain / Blood / Energy ──
    echo_relay: {
        id: 'echo_relay', name: '잔향 릴레이', icon: '📍', rarity: 'common',
        desc: '턴 시작: 잔향 +6.',
        passive(gs, trigger) { if (trigger === Trigger.TURN_START) gs.addEcho(6, { name: '잔향 릴레이', type: 'item' }); }
    },
    echo_accelerator: {
        id: 'echo_accelerator', name: '잔향 가속기', icon: '🏎️', rarity: 'uncommon',
        desc: '카드 드로우 시: 20% 확률로 잔향 +8.',
        passive(gs, trigger) { if (trigger === Trigger.CARD_DRAW && Math.random() < 0.2) gs.addEcho(8, { name: '잔향 가속기', type: 'item' }); }
    },
    echo_condenser: {
        id: 'echo_condenser', name: '잔향 응축기', icon: '🧲', rarity: 'rare',
        desc: '턴 시작: 잔향 80 이상이면 에너지 +1.',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START && (gs.player.echo || 0) >= 80) {
                gs.player.energy = Math.min(gs.player.maxEnergy, gs.player.energy + 1);
            }
        }
    },
    echo_feedback: {
        id: 'echo_feedback', name: '잔향 피드백', icon: '🎚️', rarity: 'rare',
        desc: '공명 폭발 발동 시: 카드 1장 드로우.',
        passive(gs, trigger) { if (trigger === Trigger.RESONANCE_BURST) gs.drawCards?.(1, { name: '잔향 피드백', type: 'item' }); }
    },
    echo_prism: {
        id: 'echo_prism', name: '잔향 프리즘', icon: '🔺', rarity: 'rare',
        desc: '연쇄 피해 +20%.',
        passive(gs, trigger, data) { if (trigger === Trigger.CHAIN_DMG) return Math.floor((data || 0) * 1.2); }
    },
    echo_overcharge: {
        id: 'echo_overcharge', name: '잔향 과충전기', icon: '💥', rarity: 'legendary',
        desc: '잔향 100 도달 시: 이번 전투에서 잔향 최대치 +50.',
        passive(gs, trigger) {
            const threshold = CONSTANTS.ECHO?.BURST_THRESHOLD ?? 100;
            if (trigger === Trigger.TURN_START && (gs.player.echo || 0) >= threshold && !gs._overchargeUsed) {
                gs._overchargeUsed = true;
                gs.player._echoCapPlus = (gs.player._echoCapPlus || 0) + 50;
                gs.addLog?.(LogUtils.formatItem('잔향 과충전기', '잔향 최대치 +50(전투)'), 'item');
            }
            if (trigger === Trigger.COMBAT_END) {
                gs._overchargeUsed = false;
                gs.player._echoCapPlus = 0;
            }
        }
    },
    chain_pin: {
        id: 'chain_pin', name: '연쇄 핀', icon: '📌', rarity: 'common',
        desc: '연쇄 1 이상: 공격 피해 +2.',
        passive(gs, trigger, data) { if (trigger === Trigger.DEAL_DAMAGE && (gs.player.echoChain || 0) >= 1) return (data || 0) + 2; }
    },
    chain_bell: {
        id: 'chain_bell', name: '연쇄 종', icon: '🔔', rarity: 'rare',
        desc: '연쇄 5 도달 시: 에너지 +1. (턴당 1회)',
        passive(gs, trigger) {
            if (trigger === Trigger.CHAIN_REACH_5 && !gs._chainBellUsedTurn) {
                gs._chainBellUsedTurn = true;
                gs.player.energy = Math.min(gs.player.maxEnergy, gs.player.energy + 1);
            }
            if (trigger === Trigger.TURN_START) gs._chainBellUsedTurn = false;
        }
    },
    chain_tuning_fork: {
        id: 'chain_tuning_fork', name: '연쇄 튜닝포크', icon: '🎼', rarity: 'rare',
        desc: '연쇄 피해 +25%.',
        passive(gs, trigger, data) { if (trigger === Trigger.CHAIN_DMG) return Math.floor((data || 0) * 1.25); }
    },
    chain_crown: {
        id: 'chain_crown', name: '연쇄의 왕관', icon: '👑', rarity: 'legendary',
        desc: '연쇄 최대치 +2. 대신 전투 시작 방어막 -5.',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START && !gs._chainCrownActive) {
                gs._chainCrownActive = true;
                gs.player._chainCapPlus = (gs.player._chainCapPlus || 0) + 2;
                gs.player.shield = Math.max(0, (gs.player.shield || 0) - 5);
            }
            if ((trigger === Trigger.COMBAT_END || trigger === 'death') && gs._chainCrownActive) {
                gs.player._chainCapPlus = Math.max(0, (gs.player._chainCapPlus || 0) - 2);
                gs._chainCrownActive = false;
            }
        }
    },
    chain_rewind: {
        id: 'chain_rewind', name: '연쇄 되감기', icon: '⏪', rarity: 'legendary',
        desc: '연쇄 5 도달 시: 소멸 카드 1장을 덱으로 복구. (전투당 1회)',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) gs._rewindUsed = false;
            if (trigger === Trigger.CHAIN_REACH_5 && !gs._rewindUsed) {
                gs._rewindUsed = true;
                const exhausted = gs.player.exhausted || [];
                if (exhausted.length > 0) {
                    const cardId = exhausted.pop();
                    gs.player.deck?.push?.(cardId);
                    gs.addLog?.(LogUtils.formatItem('연쇄 되감기', '소멸 카드 1장 복구'), 'item');
                }
            }
        }
    },
    zero_engine: {
        id: 'zero_engine', name: '제로 엔진', icon: '🛠️', rarity: 'legendary',
        desc: '전투당 1회: 손패 3장의 비용을 0으로 만듭니다.',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) gs._zeroEngineUsed = false;
            if (trigger === Trigger.TURN_START && !gs._zeroEngineUsed) {
                gs._zeroEngineUsed = true;
                gs.player._freeCardUses = (gs.player._freeCardUses || 0) + Math.min(3, gs.player.hand?.length || 0);
                gs.addLog?.(LogUtils.formatItem('제로 엔진', '손패 비용 0(3장)'), 'item');
            }
        }
    },
    blood_bandage: {
        id: 'blood_bandage', name: '피의 붕대', icon: '🩹', rarity: 'common',
        desc: '피해를 받을 때: 체력 1 회복. (턴당 3회)',
        passive(gs, trigger, data) {
            if (trigger === Trigger.TURN_START) gs._bandageCount = 0;
            if (trigger === Trigger.DAMAGE_TAKEN && data > 0 && (gs._bandageCount || 0) < 3) {
                gs._bandageCount++;
                gs.heal(1, { name: '피의 붕대', type: 'item' });
            }
        }
    },
    red_locket: {
        id: 'red_locket', name: '붉은 로켓', icon: '🔻', rarity: 'uncommon',
        desc: '턴 시작: 체력 50% 이하이면 방어막 +6.',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START && gs.player.hp <= gs.player.maxHp * 0.5) {
                gs.addShield(6, { name: '붉은 로켓', type: 'item' });
            }
        }
    },
    scar_seal: {
        id: 'scar_seal', name: '흉터 인장', icon: '🦇', rarity: 'uncommon',
        desc: '피해를 받을 때: 잔향 +10.',
        passive(gs, trigger, data) { if (trigger === Trigger.DAMAGE_TAKEN && data > 0) gs.addEcho(10, { name: '흉터 인장', type: 'item' }); }
    },
    hemoglobin_pump: {
        id: 'hemoglobin_pump', name: '헤모글로빈 펌프', icon: '🫀', rarity: 'rare',
        desc: '체력 40% 이하: 주는 피해 +25%.',
        passive(gs, trigger, data) { if (trigger === Trigger.DEAL_DAMAGE && gs.player.hp <= gs.player.maxHp * 0.4) return Math.floor((data || 0) * 1.25); }
    },
    sanguine_bell: {
        id: 'sanguine_bell', name: '선홍의 종', icon: '🛎️', rarity: 'rare',
        desc: '적 처치 시: 에너지 +1.',
        passive(gs, trigger) { if (trigger === Trigger.ENEMY_KILL) gs.player.energy = Math.min(gs.player.maxEnergy, gs.player.energy + 1); }
    },
    blood_transfusion: {
        id: 'blood_transfusion', name: '피의 수혈', icon: '🧫', rarity: 'rare',
        desc: '턴 시작: 체력 3 감소, 카드 1장 드로우.',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START) {
                gs.player.hp = Math.max(1, gs.player.hp - 3);
                gs.drawCards(1, { name: '피의 수혈', type: 'item' });
            }
        }
    },
    crimson_pact: {
        id: 'crimson_pact', name: '진홍의 서약', icon: '🩸', rarity: 'legendary',
        desc: '전투 시작: 최대 체력의 20%를 잃고, 잃은 만큼 잔향을 얻습니다.',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) {
                const loss = Math.max(1, Math.floor(gs.player.maxHp * 0.2));
                gs.player.hp = Math.max(1, gs.player.hp - loss);
                gs.addEcho(loss, { name: '진홍의 서약', type: 'item' });
            }
        }
    },
    last_stand_totem: {
        id: 'last_stand_totem', name: '최후의 토템', icon: '🗿', rarity: 'legendary',
        desc: '체력 25% 이하: 받는 피해 -30%.',
        passive(gs, trigger, data) {
            if (trigger === Trigger.DAMAGE_TAKEN && data > 0 && gs.player.hp <= gs.player.maxHp * 0.25) {
                return Math.floor(data * 0.7);
            }
        }
    },
    battery_clip: {
        id: 'battery_clip', name: '배터리 클립', icon: '🧲', rarity: 'common',
        desc: '카드 소멸 시: 에너지 +1. (턴당 1회)',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START) gs._clipUsed = false;
            if (trigger === Trigger.CARD_EXHAUST && !gs._clipUsed) {
                gs._clipUsed = true;
                gs.player.energy = Math.min(gs.player.maxEnergy, gs.player.energy + 1);
            }
        }
    },
    spark_coil: {
        id: 'spark_coil', name: '스파크 코일', icon: '🌀', rarity: 'uncommon',
        desc: '턴 시작: 잔향 30 이상이면 에너지 +1.',
        passive(gs, trigger) { if (trigger === Trigger.TURN_START && (gs.player.echo || 0) >= 30) gs.player.energy = Math.min(gs.player.maxEnergy, gs.player.energy + 1); }
    },
    overdraft_cell: {
        id: 'overdraft_cell', name: '초과인출 셀', icon: '🔋', rarity: 'uncommon',
        desc: '에너지를 얻을 때: 잔향 +3.',
        passive(gs, trigger, data) { if (trigger === Trigger.ENERGY_GAIN && (data?.amount || 0) > 0) gs.addEcho(3 * data.amount, { name: '초과인출 셀', type: 'item' }); }
    },
    power_inverter: {
        id: 'power_inverter', name: '전력 인버터', icon: '🔁', rarity: 'rare',
        desc: '공명 폭발 발동 시: 에너지 +1.',
        passive(gs, trigger) { if (trigger === Trigger.RESONANCE_BURST) gs.player.energy = Math.min(gs.player.maxEnergy, gs.player.energy + 1); }
    },
    echo_valve: {
        id: 'echo_valve', name: '잔향 밸브', icon: '🧷', rarity: 'uncommon',
        desc: '잔향 증가 시: 방어막 +2. (턴당 5회)',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START) gs._valveTurnCount = 0;
            if (trigger === Trigger.ECHO_GAIN) {
                gs._valveTurnCount = (gs._valveTurnCount || 0) + 1;
                if (gs._valveTurnCount <= 5) gs.addShield(2, { name: '잔향 밸브', type: 'item' });
            }
        }
    },
    echo_singularity: {
        id: 'echo_singularity', name: '잔향 특이점', icon: '🕳️', rarity: 'legendary',
        desc: '전투 시작: 잔향이 0이면 잔향 +40. 대신 첫 드로우 1장 감소.',
        passive(gs, trigger, data) {
            if (trigger === Trigger.COMBAT_START) {
                gs._singularityDrawPenalty = 1;
                if ((gs.player.echo || 0) <= 0) gs.addEcho(40, { name: '잔향 특이점', type: 'item' });
            }
            if (trigger === Trigger.CARD_DRAW && (gs._singularityDrawPenalty || 0) > 0 && data?.cardId) {
                gs._singularityDrawPenalty--;
                discardDrawnCard(gs, data.cardId, '잔향 특이점');
            }
            if (trigger === Trigger.COMBAT_END) gs._singularityDrawPenalty = 0;
        }
    },
    chain_lanyard: {
        id: 'chain_lanyard', name: '연쇄 끈', icon: '🪢', rarity: 'uncommon',
        desc: '연쇄 증가 시: 잔향 +3.',
        passive(gs, trigger) {
            if (trigger === Trigger.CHAIN_GAIN) gs.addEcho(3, { name: '연쇄 끈', type: 'item' });
        }
    },
    chain_anchor: {
        id: 'chain_anchor', name: '연쇄 닻', icon: '⚓', rarity: 'uncommon',
        desc: '연쇄가 끊길 때: 방어막 +10. (전투당 2회)',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) gs._anchorCount = 0;
            if (trigger === Trigger.CHAIN_BREAK && (gs._anchorCount || 0) < 2) {
                gs._anchorCount++;
                gs.addShield(10, { name: '연쇄 닻', type: 'item' });
            }
        }
    },
    chain_spike: {
        id: 'chain_spike', name: '연쇄 가시', icon: '🪛', rarity: 'rare',
        desc: '연쇄 4 이상: 카드 사용 시 50% 확률로 적 1명 약화 1.',
        passive(gs, trigger) {
            if (trigger === Trigger.CARD_PLAY && (gs.player.echoChain || 0) >= 4 && Math.random() < 0.5) {
                const idx = gs.combat?.enemies?.findIndex?.(e => e.hp > 0) ?? -1;
                if (idx >= 0) gs.applyEnemyStatus('weakened', 1, idx, { name: '연쇄 가시', type: 'item' });
            }
        }
    },
    cheap_token: {
        id: 'cheap_token', name: '검소한 토큰', icon: '🪙', rarity: 'common',
        desc: '비용 0 카드 사용 시: 30% 확률로 방어막 +4.',
        passive(gs, trigger, data) {
            if (trigger === Trigger.CARD_PLAY && getCardCost(data?.cardId) === 0 && Math.random() < 0.3) {
                gs.addShield(4, { name: '검소한 토큰', type: 'item' });
            }
        }
    },
    clockwork_coupon: {
        id: 'clockwork_coupon', name: '태엽 쿠폰', icon: '🎟️', rarity: 'uncommon',
        desc: '카드 3장 사용마다: 다음 카드 비용 -1. (턴당 1회)',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START) {
                gs._couponCount = 0;
                gs._couponReady = false;
            }
            if (trigger === Trigger.CARD_PLAY) {
                gs._couponCount = (gs._couponCount || 0) + 1;
                if (gs._couponCount % 3 === 0) gs._couponReady = true;
            }
            if (trigger === Trigger.BEFORE_CARD_COST && gs._couponReady) {
                gs._couponReady = false;
                return -1;
            }
        }
    },
    frugal_charm: {
        id: 'frugal_charm', name: '절약 부적', icon: '🧿', rarity: 'uncommon',
        desc: '턴 시작: 손패에 비용 0 카드가 있으면 잔향 +8.',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START) {
                const anyZeroCost = (gs.player.hand || []).some((id) => getCardCost(id) === 0);
                if (anyZeroCost) gs.addEcho(8, { name: '절약 부적', type: 'item' });
            }
        }
    },
    tempo_gloves: {
        id: 'tempo_gloves', name: '템포 장갑', icon: '🧤', rarity: 'rare',
        desc: '턴에 카드 4장 이상 사용 시: 카드 1장 드로우. (턴당 1회)',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START) {
                gs._tempoCount = 0;
                gs._tempoProc = false;
            }
            if (trigger === Trigger.CARD_PLAY) {
                gs._tempoCount = (gs._tempoCount || 0) + 1;
                if (gs._tempoCount >= 4 && !gs._tempoProc) {
                    gs._tempoProc = true;
                    gs.drawCards(1, { name: '템포 장갑', type: 'item' });
                }
            }
        }
    },
    swift_sand: {
        id: 'swift_sand', name: '신속한 모래', icon: '⏳', rarity: 'rare',
        desc: '비용 0 카드 사용 시: 다음 공격 피해 +3. (턴당 5회)',
        passive(gs, trigger, data) {
            if (trigger === Trigger.TURN_START) gs._swiftStacks = 0;
            if (trigger === Trigger.CARD_PLAY && getCardCost(data?.cardId) === 0 && (gs._swiftStacks || 0) < 5) {
                gs._swiftStacks = (gs._swiftStacks || 0) + 1;
                gs._swiftNextAtk = (gs._swiftNextAtk || 0) + 3;
            }
            if (trigger === Trigger.DEAL_DAMAGE && gs._swiftNextAtk) {
                const add = gs._swiftNextAtk;
                gs._swiftNextAtk = 0;
                return (data || 0) + add;
            }
        }
    },
    time_slate: {
        id: 'time_slate', name: '시간의 석판', icon: '🪨', rarity: 'rare',
        desc: '턴 종료: 남은 에너지 1당 잔향 +4.',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_END) {
                const energy = gs.player.energy || 0;
                if (energy > 0) gs.addEcho(energy * 4, { name: '시간의 석판', type: 'item' });
            }
        }
    },
    paradox_contract: {
        id: 'paradox_contract', name: '역설 계약', icon: '📜', rarity: 'legendary',
        desc: '전투 시작: 전투 한정 최대 에너지 +1. 대신 첫 턴 받는 피해 +25%.',
        passive(gs, trigger, data) {
            if (trigger === Trigger.COMBAT_START && !gs._paradoxActive) {
                gs._paradoxActive = true;
                gs._paradoxFirstTurn = true;
                gs._paradoxBaseMax = gs.player.maxEnergy;
                gs.player.maxEnergy += 1;
            }
            if (trigger === Trigger.DAMAGE_TAKEN && gs._paradoxFirstTurn && data > 0) return Math.floor(data * 1.25);
            if (trigger === Trigger.TURN_END && gs._paradoxFirstTurn) gs._paradoxFirstTurn = false;
            if ((trigger === Trigger.COMBAT_END || trigger === 'death') && gs._paradoxActive) {
                gs.player.maxEnergy = gs._paradoxBaseMax ?? Math.max(1, gs.player.maxEnergy - 1);
                gs.player.energy = Math.min(gs.player.energy, gs.player.maxEnergy);
                gs._paradoxFirstTurn = false;
                gs._paradoxActive = false;
                gs._paradoxBaseMax = undefined;
            }
        }
    },
    generator_core: {
        id: 'generator_core', name: '발전 코어', icon: '⚙️', rarity: 'rare',
        desc: '전투 시작: 에너지 +1. 대신 첫 드로우 카드 1장 소멸.',
        passive(gs, trigger, data) {
            if (trigger === Trigger.COMBAT_START) {
                gs._genCorePending = true;
                gs.player.energy = Math.min(gs.player.maxEnergy, gs.player.energy + 1);
            }
            if (trigger === Trigger.CARD_DRAW && gs._genCorePending && data?.cardId) {
                gs._genCorePending = false;
                exhaustDrawnCard(gs, data.cardId, '발전 코어');
            }
            if (trigger === Trigger.COMBAT_END) gs._genCorePending = false;
        }
    },
    supercapacitor: {
        id: 'supercapacitor', name: '초전도 축전기', icon: '🧯', rarity: 'rare',
        desc: '턴 종료: 남은 에너지 2당 방어막 +6.',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_END) {
                const energy = gs.player.energy || 0;
                const stacks = Math.floor(energy / 2);
                if (stacks > 0) gs.addShield(stacks * 6, { name: '초전도 축전기', type: 'item' });
            }
        }
    },
    unstable_reactor: {
        id: 'unstable_reactor', name: '불안정 반응로', icon: '☢️', rarity: 'legendary',
        desc: '턴 시작: 에너지 +1. 대신 20% 확률로 기절 1턴.',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START) {
                gs.player.energy = Math.min(gs.player.maxEnergy, gs.player.energy + 1);
                if (Math.random() < 0.2) gs.applyPlayerStatus('stunned', 1, { name: '불안정 반응로', type: 'item' });
            }
        }
    },
    infinite_grid: {
        id: 'infinite_grid', name: '무한 그리드', icon: '♾️', rarity: 'legendary',
        desc: '전투당 1회: 에너지가 0이 되면 즉시 에너지 +3.',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) gs._gridUsed = false;
            if (trigger === Trigger.ENERGY_EMPTY && !gs._gridUsed) {
                gs._gridUsed = true;
                gs.player.energy = Math.min(gs.player.maxEnergy, gs.player.energy + 3);
                gs.markDirty?.('hud');
            }
        }
    },
    boss_void_engine: {
        id: 'boss_void_engine', name: '보스 유물: 공허 엔진', icon: '🕷️', rarity: 'boss',
        desc: '전투 시작: 잔향 +60. 대신 전투 종료: 체력 6 감소.',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) gs.addEcho(60, { name: '공허 엔진', type: 'item' });
            if (trigger === Trigger.COMBAT_END) gs.player.hp = Math.max(1, gs.player.hp - 6);
        }
    },
    boss_time_tax: {
        id: 'boss_time_tax', name: '보스 유물: 시간세', icon: '🧾', rarity: 'boss',
        desc: '턴 시작: 카드 1장 추가 드로우. 대신 3턴마다 기절 1턴.',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START) {
                gs._taxTurn = (gs._taxTurn || 0) + 1;
                gs.drawCards(1, { name: '시간세', type: 'item' });
                if (gs._taxTurn % 3 === 0) gs.applyPlayerStatus('stunned', 1, { name: '시간세', type: 'item' });
            }
            if (trigger === Trigger.COMBAT_END) gs._taxTurn = 0;
        }
    },
    boss_blood_furnace: {
        id: 'boss_blood_furnace', name: '보스 유물: 혈로', icon: '🔥', rarity: 'boss',
        desc: '피격 시 다음 공격 피해 +8(턴당 3회). 대신 회복량 -50%.',
        passive(gs, trigger, data) {
            if (trigger === Trigger.TURN_START) gs._furnaceCount = 0;
            if (trigger === Trigger.DAMAGE_TAKEN && data > 0 && (gs._furnaceCount || 0) < 3) {
                gs._furnaceCount = (gs._furnaceCount || 0) + 1;
                gs._furnaceNext = (gs._furnaceNext || 0) + 8;
            }
            if (trigger === Trigger.DEAL_DAMAGE && gs._furnaceNext) {
                const add = gs._furnaceNext;
                gs._furnaceNext = 0;
                return (data || 0) + add;
            }
            if (trigger === Trigger.HEAL_AMOUNT && typeof data === 'number') return Math.floor(data * 0.5);
        }
    },
    boss_chain_circuit: {
        id: 'boss_chain_circuit', name: '보스 유물: 연쇄 회로', icon: '🧠', rarity: 'boss',
        desc: '연쇄 최대치 +3. 대신 연쇄가 끊기면 체력 5 감소.',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START && !gs._bossChainCircuitActive) {
                gs._bossChainCircuitActive = true;
                gs.player._chainCapPlus = (gs.player._chainCapPlus || 0) + 3;
            }
            if (trigger === Trigger.CHAIN_BREAK) gs.player.hp = Math.max(1, gs.player.hp - 5);
            if ((trigger === Trigger.COMBAT_END || trigger === 'death') && gs._bossChainCircuitActive) {
                gs.player._chainCapPlus = Math.max(0, (gs.player._chainCapPlus || 0) - 3);
                gs._bossChainCircuitActive = false;
            }
        }
    },
    boss_free_market: {
        id: 'boss_free_market', name: '보스 유물: 자유시장', icon: '🛒', rarity: 'boss',
        desc: '비용 0 카드 사용 시 에너지 +1(턴당 2회). 대신 전투 시작 첫 비용 2+ 드로우 카드를 소멸.',
        passive(gs, trigger, data) {
            if (trigger === Trigger.COMBAT_START) gs._marketPending = true;
            if (trigger === Trigger.CARD_DRAW && gs._marketPending && data?.cardId && getCardCost(data.cardId) >= 2) {
                gs._marketPending = false;
                exhaustDrawnCard(gs, data.cardId, '자유시장');
            }
            if (trigger === Trigger.TURN_START) gs._marketUsed = 0;
            if (trigger === Trigger.CARD_PLAY && getCardCost(data?.cardId) === 0) {
                gs._marketUsed = (gs._marketUsed || 0) + 1;
                if (gs._marketUsed <= 2) gs.player.energy = Math.min(gs.player.maxEnergy, gs.player.energy + 1);
            }
            if (trigger === Trigger.COMBAT_END) gs._marketPending = false;
        }
    },
    boss_abyss_contract: {
        id: 'boss_abyss_contract', name: '보스 유물: 심연 계약', icon: '🖋️', rarity: 'boss',
        desc: '전투 시작: 모든 적 약화 1. 대신 플레이어 취약 1.',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) {
                gs.combat?.enemies?.forEach?.((_, i) => gs.applyEnemyStatus('weakened', 1, i, { name: '심연 계약', type: 'item' }));
                gs.applyPlayerStatus('vulnerable', 1, { name: '심연 계약', type: 'item' });
            }
        }
    },
    boss_echo_reflector: {
        id: 'boss_echo_reflector', name: '보스 유물: 반향 반사경', icon: '🪞', rarity: 'boss',
        desc: '공명 폭발 피해 +100%. 대신 발동 후 턴 종료 시 에너지 0.',
        passive(gs, trigger, data) {
            if (trigger === Trigger.RESONANCE_BURST) {
                gs._reflectorZero = true;
                return Math.floor((data || 0) * 2.0);
            }
            if (trigger === Trigger.TURN_END && gs._reflectorZero) {
                gs._reflectorZero = false;
                gs.player.energy = 0;
                gs.markDirty?.('hud');
            }
        }
    },
    boss_soul_mirror: {
        id: 'boss_soul_mirror', name: '보스 유물: 영혼 거울', icon: '🫥', rarity: 'boss',
        desc: '전투당 1회 사망 직전 체력 30%로 생존. 대신 최대 체력 -15%.',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START && !gs._soulMirrorPenaltyApplied) {
                gs._soulMirrorPenaltyApplied = true;
                gs.player.maxHp = Math.max(1, Math.floor(gs.player.maxHp * 0.85));
                gs.player.hp = Math.min(gs.player.hp, gs.player.maxHp);
            }
            if (trigger === Trigger.COMBAT_START) gs._soulMirrorUsed = false;
            if (trigger === Trigger.PRE_DEATH && !gs._soulMirrorUsed) {
                gs._soulMirrorUsed = true;
                gs.player.hp = Math.max(1, Math.floor(gs.player.maxHp * 0.3));
                return true;
            }
            if (trigger === Trigger.COMBAT_END) {
                gs._soulMirrorUsed = false;
            }
        }
    },
    boss_overflow_turbine: {
        id: 'boss_overflow_turbine', name: '보스 유물: 오버플로 터빈', icon: '🌀', rarity: 'boss',
        desc: '턴 시작: 에너지 +1. 대신 턴 종료: 남은 에너지 0.',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START) gs.player.energy = Math.min(gs.player.maxEnergy, gs.player.energy + 1);
            if (trigger === Trigger.TURN_END) gs.player.energy = 0;
        }
    },
    boss_black_lotus: {
        id: 'boss_black_lotus', name: '보스 유물: 흑연꽃', icon: '🪷', rarity: 'boss',
        desc: '카드 5장 사용마다 카드 2장 드로우. 대신 최대 손패 -1.',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) {
                gs._lotusCount = 0;
                gs.player._handCapMinus = (gs.player._handCapMinus || 0) + 1;
            }
            if (trigger === Trigger.CARD_PLAY) {
                gs._lotusCount = (gs._lotusCount || 0) + 1;
                if (gs._lotusCount % 5 === 0) gs.drawCards(2, { name: '흑연꽃', type: 'item' });
            }
            if (trigger === Trigger.COMBAT_END) {
                gs.player._handCapMinus = Math.max(0, Number(gs.player._handCapMinus || 0) - 1);
                gs._lotusCount = 0;
            }
        }
    },
    boss_iron_vow: {
        id: 'boss_iron_vow', name: '보스 유물: 철의 맹세', icon: '🛡️', rarity: 'boss',
        desc: '방어막 획득량 +40%. 대신 주는 피해 -15%.',
        passive(gs, trigger, data) {
            if (trigger === Trigger.SHIELD_GAIN && typeof data === 'number') return Math.floor(data * 1.4);
            if (trigger === Trigger.DEAL_DAMAGE) return Math.floor((data || 0) * 0.85);
        }
    },
    boss_last_symphony: {
        id: 'boss_last_symphony', name: '보스 유물: 최후의 교향곡', icon: '🎻', rarity: 'boss',
        desc: '잔향 100 도달 시 모든 적 30 피해+기절(전투당 1회). 대신 잔향 획득 -20%.',
        passive(gs, trigger, data) {
            const threshold = CONSTANTS.ECHO?.BURST_THRESHOLD ?? 100;
            if (trigger === Trigger.COMBAT_START) gs._symphonyUsed = false;
            if (trigger === Trigger.TURN_START && (gs.player.echo || 0) >= threshold && !gs._symphonyUsed) {
                gs._symphonyUsed = true;
                gs.dealDamageAll?.(30, true);
                gs.combat?.enemies?.forEach?.((_, i) => gs.applyEnemyStatus('stunned', 1, i, { name: '최후의 교향곡', type: 'item' }));
            }
            if (trigger === Trigger.ECHO_GAIN && (data?.amount || 0) > 0) return Math.floor(data.amount * 0.8);
            if (trigger === Trigger.COMBAT_END) gs._symphonyUsed = false;
        }
    },
    // ══════════════ SET ITEMS — 조각 세트 (2/3개 효과) ══════════════
    // [세트 A] 심연의 삼위일체
    void_eye: {
        id: 'void_eye', name: '공허의 눈', icon: '🌑', rarity: 'uncommon',
        desc: '적을 공격할 때마다 15% 확률로 적에게 약화를 부여합니다. [세트:심연]',
        passive(gs, trigger, data) {
            const card = CARDS[data?.cardId];
            if (trigger === Trigger.CARD_PLAY && card?.type === 'ATTACK' && Math.random() < 0.15) {
                const idx = gs.combat.enemies.findIndex(e => e.hp > 0);
                if (idx >= 0) {
                    gs.applyEnemyStatus('weakened', 1, idx);
                    gs.addLog('🌑 공허의 눈: 약화 부여!', 'echo');
                }
            }
        }
    },
    void_fang: {
        id: 'void_fang', name: '공허의 송곳니', icon: '🦷', rarity: 'uncommon',
        desc: '공격 카드를 사용할 때마다 잔향을 8 충전합니다. [세트:심연]',
        passive(gs, trigger, data) { if (trigger === Trigger.CARD_PLAY && data && CARDS[data.cardId]?.type === 'ATTACK') { gs.addEcho(8); gs.addLog('🦷 공허의 송곳니: 잔향 +8', 'echo'); } }
    },
    void_crown: {
        id: 'void_crown', name: '공허의 왕관', icon: '👁️', rarity: 'rare',
        desc: '카드 사용 시: 카드 비용이 0이면 잔향 10 추가 충전.',
        passive(gs, trigger, data) {
            if (trigger !== Trigger.CARD_PLAY) return;
            const playedCost = Number.isFinite(Number(data?.cost))
                ? Number(data.cost)
                : getCardCost(data?.cardId);
            if (playedCost === 0) {
                gs.addEcho(10, { name: '공허의 왕관', type: 'item' });
            }
        }
    },
    // [세트 B] 잔향의 삼각
    echo_pendant: {
        id: 'echo_pendant', name: '잔향의 펜던트', icon: '💜', rarity: 'uncommon',
        desc: '매 턴 시작 시 잔향을 12 충전합니다. [세트:잔향]',
        passive(gs, trigger) { if (trigger === Trigger.TURN_START) { gs.addEcho(12); gs.addLog('💜 잔향의 펜던트: 잔향 +12', 'echo'); } }
    },
    echo_bracer: {
        id: 'echo_bracer', name: '잔향의 팔찌', icon: '🔮', rarity: 'uncommon',
        desc: '잔향 효과가 발동할 때마다 회복 3. (전투당 최대 20 회복) [세트:잔향]',
        passive(gs, trigger) {
            if (trigger === Trigger.ECHO_SKILL) {
                gs.combat._bracerHeal = (gs.combat._bracerHeal || 0);
                if (gs.combat._bracerHeal < 20) {
                    gs.heal(3, { name: '잔향의 팔찌', type: 'item' });
                    gs.combat._bracerHeal += 3;
                }
            }
        }
    },
    echo_sigil: {
        id: 'echo_sigil', name: '잔향의 인장', icon: '⚜️', rarity: 'rare',
        desc: '공명 폭발 발동 시 에너지를 2 얻습니다. [세트:잔향]',
        passive(gs, trigger) { if (trigger === Trigger.RESONANCE_BURST) { gs.player.energy = Math.min(gs.player.maxEnergy + 2, gs.player.energy + 2); gs.markDirty?.('hud'); gs.addLog('⚜️ 잔향의 인장: 에너지 +2 얻음!', 'echo'); } }
    },
    // [세트 C] 혈맹의 인장
    blood_seal: {
        id: 'blood_seal', name: '혈인', icon: '🩸', rarity: 'common',
        desc: '피해를 받을 때마다 방어막를 3 얻습니다. [세트:혈맹]',
        passive(gs, trigger, data) { if (trigger === Trigger.DAMAGE_TAKEN && data > 0) { gs.addShield(3, { name: '혈인', type: 'item' }); } }
    },
    blood_oath: {
        id: 'blood_oath', name: '혈맹의 서', icon: '📜', rarity: 'uncommon',
        desc: '카드 사용 시: 체력 50% 이하일 때 피해 +6. [세트:혈맹]',
        passive(gs, trigger, data) { if (trigger === Trigger.DEAL_DAMAGE && gs.player.hp <= gs.player.maxHp * 0.5) return (data || 0) + 6; }
    },
    blood_crown: {
        id: 'blood_crown', name: '혈맹의 왕관', icon: '💉', rarity: 'rare',
        desc: '적 처치 시: 체력 8 회복. 잔향 20 충전. [세트:혈맹]',
        passive(gs, trigger) { if (trigger === Trigger.ENEMY_KILL) { gs.heal(8, { name: '혈맹의 왕관', type: 'item' }); gs.addEcho(20, { name: '혈맹의 왕관', type: 'item' }); } }
    },

    // ══════════════ LEGENDARY (보라/무지개) ══════════════
    echo_heart: {
        id: 'echo_heart', name: '잔향의 심장', icon: '❤️‍🔥', rarity: 'legendary',
        desc: '패시브: 사망 시 1회 부활. (체력 50% 복원)',
        passive(gs, trigger) { if (trigger === Trigger.PRE_DEATH && !gs._heartUsed) { gs._heartUsed = true; gs.player.hp = Math.floor(gs.player.maxHp * CONSTANTS.PLAYER.MID_HP_RATIO); gs.addLog('❤️‍🔥 잔향의 심장: 부활!', 'heal'); return true; } }
    },
    void_throne: {
        id: 'void_throne', name: '공허의 왕좌', icon: '👑', rarity: 'legendary',
        desc: '카드 사용 시: 5장마다 모든 적에게 피해 15.',
        passive(gs, trigger) { if (trigger === Trigger.CARD_PLAY) { gs._throneCount = (gs._throneCount || 0) + 1; if (gs._throneCount % 5 === 0) { gs.dealDamageAll(15); gs.addLog('👑 공허의 왕좌: 모든 적 피해 15!', 'echo'); } } }
    },
    echo_genesis: {
        id: 'echo_genesis', name: '잔향의 기원', icon: '🌟', rarity: 'legendary',
        desc: '잔향 100 도달 시: 손패 최대 5장의 비용 0. (전투당 1회)',
        passive(gs, trigger) { const threshold = CONSTANTS.ECHO?.BURST_THRESHOLD ?? 100; if (trigger === Trigger.TURN_START && gs.player.echo >= threshold && !gs._genesisUsed) { gs.player._freeCardUses = Math.max(gs.player._freeCardUses || 0, Math.min(5, gs.player.hand.length)); gs._genesisUsed = true; gs.addLog('🌟 잔향의 기원: 손패 카드 비용 0!', 'echo'); } if (trigger === Trigger.COMBAT_END) gs._genesisUsed = false; }
    },
    abyss_codex: {
        id: 'abyss_codex', name: '심연의 비전서', icon: '📖', rarity: 'legendary',
        desc: '전투 시작: 덱에서 무작위 희귀 카드 1장 드로우.',
        passive(gs, trigger) { if (trigger === Trigger.COMBAT_START) { const source = (gs.player.drawPile && gs.player.drawPile.length > 0) ? gs.player.drawPile : gs.player.deck; const rares = source.filter(id => CARDS[id]?.rarity === 'rare'); if (rares.length > 0) { const c = rares[Math.floor(Math.random() * rares.length)]; const idx = source.indexOf(c); source.splice(idx, 1); if (source === gs.player.drawPile) { const dIdx = gs.player.deck.indexOf(c); if (dIdx !== -1) gs.player.deck.splice(dIdx, 1); } gs.player.hand.push(c); gs.addLog(`📖 심연의 비전서: ${CARDS[c]?.name} 뽑음!`, 'echo'); } } }
    },

    // ?????????????? ?? ?? ??/?? (items_additions.js) ??????????????
    // ──────────── COMMON ────────────

    // 아이디어: "첫 턴 버프" 계열
    morning_dew: {
        id: 'morning_dew', name: '아침 이슬', icon: '🌿', rarity: 'common',
        desc: '전투 첫 턴에만: 방어막 +8.',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) gs._morningDewFirst = true;
            if (trigger === Trigger.TURN_START && gs._morningDewFirst) {
                gs._morningDewFirst = false;
                gs.addShield(8, { name: '아침 이슬', type: 'item' });
            }
        }
    },

    // 아이디어: "덱 크기 연동"
    thin_codex: {
        id: 'thin_codex', name: '얇은 문서', icon: '📄', rarity: 'common',
        desc: '전투 시작: 덱이 10장 이하이면 카드 1장 드로우.',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START && (gs.player.deck?.length || 0) <= 10) {
                gs.drawCards(1, { name: '얇은 문서', type: 'item' });
            }
        }
    },

    // 아이디어: "피해 누적 카운터"
    tally_stone: {
        id: 'tally_stone', name: '집계석', icon: '🪨', rarity: 'common',
        desc: '피해를 입을 때마다 집계 +1. 집계가 5에 도달하면 방어막 12 획득 후 초기화.',
        passive(gs, trigger, data) {
            if (trigger === Trigger.COMBAT_START) gs._tallyCount = 0;
            if (trigger === Trigger.DAMAGE_TAKEN && data > 0) {
                gs._tallyCount = (gs._tallyCount || 0) + 1;
                if (gs._tallyCount >= 5) {
                    gs._tallyCount = 0;
                    gs.addShield(12, { name: '집계석', type: 'item' });
                }
            }
        }
    },

    // ──────────── UNCOMMON ────────────

    // 아이디어: "패 크기 연동"
    wide_sleeve: {
        id: 'wide_sleeve', name: '넓은 소매', icon: '👘', rarity: 'uncommon',
        desc: '턴 시작: 손패 5장 이상이면 잔향 +10.',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START && (gs.player.hand?.length || 0) >= 5) {
                gs.addEcho(10, { name: '넓은 소매', type: 'item' });
            }
        }
    },

    // 아이디어: "방어 → 공격 전환"
    iron_paradox: {
        id: 'iron_paradox', name: '철의 역설', icon: '⚔️', rarity: 'uncommon',
        desc: '방어막이 10 이상인 상태에서 공격 시: 피해 +4.',
        passive(gs, trigger, data) {
            if (trigger === Trigger.DEAL_DAMAGE && (gs.player.shield || 0) >= 10) {
                return (data || 0) + 4;
            }
        }
    },

    // 아이디어: "저비용 콤보"
    pocket_watch: {
        id: 'pocket_watch', name: '회중시계', icon: '⌚', rarity: 'uncommon',
        desc: '비용 1 이하 카드를 연속 2장 사용 시: 잔향 +12. (턴당 2회)',
        passive(gs, trigger, data) {
            if (trigger === Trigger.TURN_START) {
                gs._watchStreak = 0;
                gs._watchProcs = 0;
            }
            if (trigger === Trigger.CARD_PLAY) {
                const cost = getCardCost(data?.cardId);
                if (cost <= 1) {
                    gs._watchStreak = (gs._watchStreak || 0) + 1;
                    if (gs._watchStreak >= 2 && (gs._watchProcs || 0) < 2) {
                        gs._watchStreak = 0;
                        gs._watchProcs++;
                        gs.addEcho(12, { name: '회중시계', type: 'item' });
                    }
                } else {
                    gs._watchStreak = 0;
                }
            }
        }
    },

    // 아이디어: "소멸 덱 빌드"
    void_jar: {
        id: 'void_jar', name: '공허의 단지', icon: '🏺', rarity: 'uncommon',
        desc: '전투 중 소멸한 카드 1장당 공격 피해 +1을 누적합니다. (최대 +8, 전투 한정)',
        passive(gs, trigger, data) {
            if (trigger === Trigger.COMBAT_START) gs._jarStacks = 0;
            if (trigger === Trigger.CARD_EXHAUST) {
                gs._jarStacks = Math.min(8, (gs._jarStacks || 0) + 1);
            }
            if (trigger === Trigger.DEAL_DAMAGE && (gs._jarStacks || 0) > 0) {
                return (data || 0) + gs._jarStacks;
            }
        }
    },

    // 아이디어: "독 시너지"
    toxic_spine: {
        id: 'toxic_spine', name: '독침', icon: '🌵', rarity: 'uncommon',
        desc: '카드 드로우 시: 독 상태인 첫 번째 적에게 독 1턴 부여.',
        passive(gs, trigger) {
            if (trigger === Trigger.CARD_DRAW) {
                const idx = gs.combat?.enemies?.findIndex?.(e => e.hp > 0 && (e.statusEffects?.poisoned || 0) > 0);
                if (idx >= 0) gs.applyEnemyStatus('poisoned', 1, idx, { name: '독침', type: 'item' });
            }
        }
    },

    // ──────────── RARE ────────────

    // 아이디어: "방어막 → 잔향 변환"
    shield_capacitor: {
        id: 'shield_capacitor', name: '방어 축전기', icon: '🛡️', rarity: 'rare',
        desc: '턴 종료: 방어막 5당 잔향 +4.',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_END) {
                const stacks = Math.floor((gs.player.shield || 0) / 5);
                if (stacks > 0) gs.addEcho(stacks * 4, { name: '방어 축전기', type: 'item' });
            }
        }
    },

    // 아이디어: "멀티 적 연동"
    crowd_catalyst: {
        id: 'crowd_catalyst', name: '군중 촉매제', icon: '🎯', rarity: 'rare',
        desc: '전투 시작 적이 2명 이상이면: 잔향 +25, 에너지 +1.',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) {
                const alive = (gs.combat?.enemies || []).filter(e => e.hp > 0).length;
                if (alive >= 2) {
                    gs.addEcho(25, { name: '군중 촉매제', type: 'item' });
                    gs.player.energy = Math.min(gs.player.maxEnergy, gs.player.energy + 1);
                    gs.addLog?.('🎯 군중 촉매제: 다수 적 보너스!', 'item');
                }
            }
        }
    },

    // 아이디어: "반전 트리거"
    mirror_shield: {
        id: 'mirror_shield', name: '반사 방패', icon: '🪟', rarity: 'rare',
        desc: '방어막이 0이 될 때: 파괴된 방어막의 30%를 잔향으로 충전.',
        passive(gs, trigger, data) {
            // data = 직전 방어막 값
            if (trigger === Trigger.SHIELD_BREAK && (data || 0) > 0) {
                const echo = Math.floor(data * 0.3);
                if (echo > 0) gs.addEcho(echo, { name: '반사 방패', type: 'item' });
            }
        }
    },

    // 아이디어: "핸드 사이즈 제한 보상"
    minimalist_lens: {
        id: 'minimalist_lens', name: '극소주의 렌즈', icon: '🔬', rarity: 'rare',
        desc: '손패 3장 이하로 턴을 시작하면: 주는 피해 +15%.',
        passive(gs, trigger, data) {
            if (trigger === Trigger.COMBAT_START) gs._miniBonus = false;
            if (trigger === Trigger.TURN_START) {
                gs._miniBonus = (gs.player.hand?.length || 0) <= 3;
            }
            if (trigger === Trigger.DEAL_DAMAGE && gs._miniBonus) {
                return Math.floor((data || 0) * 1.15);
            }
        }
    },

    // 아이디어: "연속 공명 폭발 보상"
    resonance_memory: {
        id: 'resonance_memory', name: '공명 기억', icon: '🧿', rarity: 'rare',
        desc: '공명 폭발 연속 2회 발동 시: 카드 2장 드로우. (전투당 3회)',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) { gs._resMem = 0; gs._resMemProcs = 0; }
            if (trigger === Trigger.RESONANCE_BURST) {
                gs._resMem = (gs._resMem || 0) + 1;
                if (gs._resMem >= 2 && (gs._resMemProcs || 0) < 3) {
                    gs._resMem = 0;
                    gs._resMemProcs++;
                    gs.drawCards(2, { name: '공명 기억', type: 'item' });
                }
            }
            if (trigger === Trigger.TURN_START) gs._resMem = 0; // 턴이 바뀌면 연속 카운트 초기화
        }
    },

    // ──────────── LEGENDARY ────────────

    // 아이디어: "방어 특화 최후 보루"
    fortress_soul: {
        id: 'fortress_soul', name: '요새의 혼', icon: '🏰', rarity: 'legendary',
        desc: '방어막이 20 이상일 때 공격을 받으면: 방어막을 소모해 추가 피해를 입히지 않음. (전투당 3회)',
        passive(gs, trigger, data) {
            if (trigger === Trigger.COMBAT_START) gs._fortressCount = 0;
            if (trigger === Trigger.DAMAGE_TAKEN && data > 0
                && (gs.player.shield || 0) >= 20
                && (gs._fortressCount || 0) < 3) {
                gs._fortressCount++;
                gs.addLog?.('🏰 요새의 혼: 방어막으로 피해 흡수!', 'item');
                return 0; // 피해 무효
            }
        }
    },

    // 아이디어: "덱 변환 - 전투 중 카드 변형"
    alchemist_stone: {
        id: 'alchemist_stone', name: '연금술사의 돌', icon: '🧪', rarity: 'legendary',
        desc: '매 3턴마다: 손패의 비용이 가장 높은 카드를 소멸하고 잔향 +30, 카드 1장 드로우.',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) gs._alchemyTurn = 0;
            if (trigger === Trigger.TURN_START) {
                gs._alchemyTurn = (gs._alchemyTurn || 0) + 1;
                if (gs._alchemyTurn % 3 === 0 && gs.player.hand?.length > 0) {
                    // 비용 최고 카드 선택
                    let maxCost = -1, maxIdx = -1;
                    gs.player.hand.forEach((id, i) => {
                        const c = getCardCost(id);
                        if (c > maxCost) { maxCost = c; maxIdx = i; }
                    });
                    if (maxIdx >= 0) {
                        const [cardId] = gs.player.hand.splice(maxIdx, 1);
                        if (!Array.isArray(gs.player.exhausted)) gs.player.exhausted = [];
                        gs.player.exhausted.push(cardId);
                        gs.markDirty?.('hand');
                        const exhaustResult = gs.triggerItems?.(Trigger.CARD_EXHAUST, { cardId });
                        if (exhaustResult === true) {
                            const exIdx = gs.player.exhausted.lastIndexOf(cardId);
                            if (exIdx >= 0) gs.player.exhausted.splice(exIdx, 1);
                            if (!Array.isArray(gs.player.graveyard)) gs.player.graveyard = [];
                            gs.player.graveyard.push(cardId);
                        }
                        gs.addEcho(30, { name: '연금술사의 돌', type: 'item' });
                        gs.drawCards(1, { name: '연금술사의 돌', type: 'item' });
                    }
                }
            }
        }
    },

    // 아이디어: "에너지 저장 메커니즘"
    capacitor_throne: {
        id: 'capacitor_throne', name: '축전의 왕좌', icon: '🪑', rarity: 'legendary',
        desc: '턴 종료: 남은 에너지를 최대 3까지 저축. 다음 턴 시작 시 저축한 에너지를 돌려받음.',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) gs._savedEnergy = 0;
            if (trigger === Trigger.TURN_END) {
                gs._savedEnergy = Math.min(3, gs.player.energy || 0);
                gs.addLog?.(`🪑 축전의 왕좌: 에너지 ${gs._savedEnergy} 저축`, 'item');
            }
            if (trigger === Trigger.TURN_START && (gs._savedEnergy || 0) > 0) {
                gs.player.energy = Math.min(gs.player.maxEnergy, (gs.player.energy || 0) + gs._savedEnergy);
                gs.addLog?.(`🪑 축전의 왕좌: 에너지 +${gs._savedEnergy} 환급`, 'item');
                gs._savedEnergy = 0;
            }
        }
    },

    // 아이디어: "적 상태이상 시너지 - 혼돈형 유물"
    chaos_prism: {
        id: 'chaos_prism', name: '혼돈의 프리즘', icon: '🌈', rarity: 'legendary',
        desc: '카드 사용 시: 적이 3종 이상의 상태이상을 보유 중이면 주는 피해 +50%.',
        passive(gs, trigger, data) {
            if (trigger === Trigger.DEAL_DAMAGE) {
                const selected = Number(gs._selectedTarget);
                const selectedAlive = Number.isInteger(selected) && selected >= 0 && (gs.combat?.enemies?.[selected]?.hp || 0) > 0;
                const target = selectedAlive
                    ? gs.combat?.enemies?.[selected]
                    : gs.combat?.enemies?.find?.(e => e.hp > 0);
                if (!target) return;
                const statusCount = Object.values(target.statusEffects || {}).filter(v => v > 0).length;
                if (statusCount >= 3) return Math.floor((data || 0) * 1.5);
            }
        }
    },

    // ════════════════════════════════════════════════════════
    //  보스 유물 추가
    // ════════════════════════════════════════════════════════

    boss_twin_fang: {
        id: 'boss_twin_fang', name: '보스 유물: 쌍독니', icon: '🐍', rarity: 'boss',
        desc: '공격 카드 사용 시: 모든 적에게 독 1턴 부여. 대신 방어 카드 사용 시 받는 피해 +10% (해당 턴).',
        passive(gs, trigger, data) {
            if (trigger === Trigger.TURN_START) gs._fangPenalty = false;
            if (trigger === Trigger.CARD_PLAY) {
                const card = CARDS[data?.cardId];
                if (card?.type === 'ATTACK') {
                    gs.combat?.enemies?.forEach?.((_, i) => gs.applyEnemyStatus('poisoned', 1, i, { name: '쌍독니', type: 'item' }));
                }
                if (card?.type === 'SKILL' || card?.type === 'DEFEND') {
                    gs._fangPenalty = true;
                }
            }
            if (trigger === Trigger.DAMAGE_TAKEN && gs._fangPenalty) {
                return Math.floor((data || 0) * 1.1);
            }
        }
    },

    boss_void_parliament: {
        id: 'boss_void_parliament', name: '보스 유물: 공허 의회', icon: '🏛️', rarity: 'boss',
        desc: '턴 시작: 손패의 모든 카드 비용 -1. 대신 턴 종료 후 손패에 저주 카드 1장 추가.',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START) {
                gs.player.costDiscount = (gs.player.costDiscount || 0) + 1;
                gs.addLog?.('🏛️ 공허 의회: 이번 턴 전체 비용 -1', 'item');
            }
            if (trigger === Trigger.TURN_END) {
                gs.player.costDiscount = Math.max(0, (gs.player.costDiscount || 0) - 1);
                // 저주 카드 'curse_void' 존재 시 손패에 추가
                if (gs.player.hand && CARDS['curse_void']) {
                    gs.player.hand.push('curse_void');
                    gs.markDirty?.('hand');
                    gs.addLog?.('🏛️ 공허 의회: 저주 카드 추가됨', 'item');
                }
            }
        }
    },

    boss_fracture_bell: {
        id: 'boss_fracture_bell', name: '보스 유물: 균열의 종', icon: '🔔', rarity: 'boss',
        desc: '공명 폭발마다 피해 +20, 추가 잔향 +20 충전. 대신 최대 체력 -20.',
        passive(gs, trigger, data) {
            if (trigger === Trigger.COMBAT_START && !gs._fractureBellApplied) {
                gs._fractureBellApplied = true;
                gs.player.maxHp = Math.max(1, gs.player.maxHp - 20);
                gs.player.hp = Math.min(gs.player.hp, gs.player.maxHp);
                gs.markDirty?.('hud');
            }
            if (trigger === Trigger.RESONANCE_BURST) {
                gs.addEcho(20, { name: '균열의 종', type: 'item' });
                return (data || 0) + 20;
            }
        }
    },

    // ──────────── [세트 D] 폭풍의 세 검 ────────────
    // 2개 보유: 카드 사용 직후 잔향 +4
    // 3개 보유: 연쇄 3 이상이면 공격 피해 +10%

    storm_needle: {
        id: 'storm_needle', name: '폭풍의 바늘', icon: '⚡', rarity: 'uncommon',
        desc: '카드를 2장 연속 사용 시: 적 1명에게 3 피해. [세트:폭풍]',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START) gs._stormNeedleStreak = 0;
            if (trigger === Trigger.CARD_PLAY) {
                gs._stormNeedleStreak = (gs._stormNeedleStreak || 0) + 1;
                if (gs._stormNeedleStreak % 2 === 0) {
                    const idx = gs.combat?.enemies?.findIndex?.(e => e.hp > 0) ?? -1;
                    if (idx >= 0) gs.dealDamage?.(3, idx, true, { name: '폭풍의 바늘', type: 'item' });
                }
            }
        }
    },

    storm_crest: {
        id: 'storm_crest', name: '폭풍의 문장', icon: '🌩️', rarity: 'uncommon',
        desc: '턴 시작: 연쇄 2 이상이면 에너지 +1. [세트:폭풍]',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START && (gs.player.echoChain || 0) >= 2) {
                gs.player.energy = Math.min(gs.player.maxEnergy, gs.player.energy + 1);
                gs.addLog?.('🌩️ 폭풍의 문장: 에너지 +1', 'item');
            }
        }
    },

    storm_herald: {
        id: 'storm_herald', name: '폭풍의 전령', icon: '🦅', rarity: 'rare',
        desc: '공명 폭발 발동 시: 모든 적에게 기절 1턴 부여 시도. [세트:폭풍]',
        passive(gs, trigger, data) {
            // 단독 효과
            if (trigger === Trigger.RESONANCE_BURST) {
                gs.combat?.enemies?.forEach?.((_, i) => gs.applyEnemyStatus('stunned', 1, i, { name: '폭풍의 전령', type: 'item' }));
            }

            // 세트 시너지: 2개 보유 판정
            const setCount = ['storm_needle', 'storm_crest', 'storm_herald']
                .filter(id => gs.player.items?.includes?.(id)).length;

            if (setCount >= 2 && trigger === Trigger.CARD_PLAY) {
                gs.addEcho(4, { name: '폭풍 세트', type: 'item' });
            }
            if (setCount >= 3 && trigger === Trigger.DEAL_DAMAGE && (gs.player.echoChain || 0) >= 3) {
                return Math.floor((data || 0) * 1.1);
            }
        }
    },

    // ──────────── [세트 E] 기계의 심장 ────────────
    // 2개 보유: 소멸마다 에너지 +1 (전투당 4회)
    // 3개 보유: 매 턴 소멸 1장당 피해 +5 누적

    gear_cog: {
        id: 'gear_cog', name: '톱니바퀴', icon: '⚙️', rarity: 'common',
        desc: '카드 소멸 시: 잔향 +8. [세트:기계]',
        passive(gs, trigger) {
            if (trigger === Trigger.CARD_EXHAUST) gs.addEcho(8, { name: '톱니바퀴', type: 'item' });
        }
    },

    piston_drive: {
        id: 'piston_drive', name: '피스톤 구동기', icon: '🔩', rarity: 'uncommon',
        desc: '소멸한 카드가 있는 턴: 공격 피해 +3. [세트:기계]',
        passive(gs, trigger, data) {
            if (trigger === Trigger.TURN_START) gs._pistonExhausted = false;
            if (trigger === Trigger.CARD_EXHAUST) gs._pistonExhausted = true;
            if (trigger === Trigger.DEAL_DAMAGE && gs._pistonExhausted) {
                return (data || 0) + 3;
            }
        }
    },

    circuit_board: {
        id: 'circuit_board', name: '회로 기판', icon: '🖥️', rarity: 'rare',
        desc: '전투 시작: 소멸 덱에 카드가 있으면 에너지 +1. [세트:기계]',
        passive(gs, trigger, data) {
            if (trigger === Trigger.COMBAT_START) {
                gs._circuitEnergyUsed = 0;
                gs._circuitDmgBonus = 0;
                if ((gs.player.exhausted?.length || 0) > 0) {
                    gs.player.energy = Math.min(gs.player.maxEnergy, gs.player.energy + 1);
                    gs.addLog?.('🖥️ 회로 기판: 에너지 +1', 'item');
                }
            }

            const setCount = ['gear_cog', 'piston_drive', 'circuit_board']
                .filter(id => gs.player.items?.includes?.(id)).length;

            if (setCount >= 2 && trigger === Trigger.CARD_EXHAUST && (gs._circuitEnergyUsed || 0) < 4) {
                gs._circuitEnergyUsed++;
                gs.player.energy = Math.min(gs.player.maxEnergy, gs.player.energy + 1);
                gs.addLog?.('🖥️ 기계 세트: 소멸 에너지 +1', 'item');
            }

            if (setCount >= 3) {
                if (trigger === Trigger.TURN_START) gs._circuitDmgBonus = (gs.player.exhausted?.length || 0) * 5;
                if (trigger === Trigger.DEAL_DAMAGE && (gs._circuitDmgBonus || 0) > 0) {
                    return (data || 0) + gs._circuitDmgBonus;
                }
            }
        }
    },

    // ──────────── [세트 F] 달의 삼위 ────────────
    // 2개 보유: 회복 시 방어막 +2
    // 3개 보유: 턴 시작 방어막 15 이상이면 체력 3 회복

    moon_veil: {
        id: 'moon_veil', name: '달의 장막', icon: '🌙', rarity: 'common',
        desc: '전투 시작: 방어막 6 획득. [세트:달]',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) gs.addShield(6, { name: '달의 장막', type: 'item' });
        }
    },

    moon_ward: {
        id: 'moon_ward', name: '달의 결계', icon: '🌕', rarity: 'uncommon',
        desc: '피해를 받을 때: 방어막이 0이어도 체력 손실을 1 줄입니다. (최소 0) [세트:달]',
        passive(gs, trigger, data) {
            if (trigger === Trigger.DAMAGE_TAKEN && data > 0) return Math.max(0, data - 1);
        }
    },

    moon_crest: {
        id: 'moon_crest', name: '달의 문장', icon: '🌛', rarity: 'rare',
        desc: '매 턴 종료: 방어막 3 획득. [세트:달]',
        passive(gs, trigger, data) {
            if (trigger === Trigger.TURN_END) gs.addShield(3, { name: '달의 문장', type: 'item' });

            const setCount = ['moon_veil', 'moon_ward', 'moon_crest']
                .filter(id => gs.player.items?.includes?.(id)).length;

            if (setCount >= 2 && trigger === Trigger.HEAL_AMOUNT && typeof data === 'number' && data > 0) {
                // 실제 회복 후 방어막 추가 → HEAL 이후 SHIELD 트리거로 처리
                gs.addShield(2, { name: '달 세트', type: 'item' });
            }

            if (setCount >= 3 && trigger === Trigger.TURN_START && (gs.player.shield || 0) >= 15) {
                gs.heal(3, { name: '달 세트', type: 'item' });
            }
        }
    },

    // ──────────── [세트 G] 황혼의 쌍인 (2개 세트) ────────────
    // 2개 보유: 독 중첩이 있는 적 공격 시 피해 +8

    dusk_fang: {
        id: 'dusk_fang', name: '황혼의 독니', icon: '🌆', rarity: 'uncommon',
        desc: '전투 시작: 모든 적에게 독 3턴 부여. [세트:황혼]',
        passive(gs, trigger, data) {
            if (trigger === Trigger.COMBAT_START) {
                gs.combat?.enemies?.forEach?.((_, i) => gs.applyEnemyStatus('poisoned', 3, i, { name: '황혼의 독니', type: 'item' }));
            }
            const setCount = ['dusk_fang', 'dusk_mark']
                .filter(id => gs.player.items?.includes?.(id)).length;

            if (setCount >= 2 && trigger === Trigger.DEAL_DAMAGE) {
                // deal_damage의 payload는 수치형이므로 선택 대상 인덱스를 우선 사용
                const selected = Number(gs._selectedTarget);
                const targetIdx = Number.isInteger(selected) && selected >= 0 && (gs.combat?.enemies?.[selected]?.hp || 0) > 0
                    ? selected
                    : (gs.combat?.enemies?.findIndex?.(e => e.hp > 0) ?? -1);
                const target = gs.combat?.enemies?.[targetIdx];
                if ((target?.statusEffects?.poisoned || 0) > 0) {
                    return (data || 0) + 8;
                }
            }
        }
    },

    dusk_mark: {
        id: 'dusk_mark', name: '황혼의 낙인', icon: '🌇', rarity: 'uncommon',
        desc: '약화된 적을 공격할 때: 약화 1 추가 부여. [세트:황혼]',
        passive(gs, trigger, data) {
            if (trigger === Trigger.DEAL_DAMAGE) {
                const selected = Number(gs._selectedTarget);
                const targetIdx = Number.isInteger(selected) && selected >= 0 && (gs.combat?.enemies?.[selected]?.hp || 0) > 0
                    ? selected
                    : (gs.combat?.enemies?.findIndex?.(e => e.hp > 0) ?? -1);
                if (targetIdx < 0) return;
                if ((gs.combat?.enemies?.[targetIdx]?.statusEffects?.weakened || 0) > 0) {
                    gs.applyEnemyStatus('weakened', 1, targetIdx, { name: '황혼의 낙인', type: 'item' });
                }
            }
        }
    },
    // ──────────── 특수 유물 (이벤트 전용) ────────────
    oath_of_abyss: {
        id: 'oath_of_abyss', name: '심연의 서약', icon: '🜏', rarity: 'legendary',
        desc: '주는 피해 +40%. 대신 받는 피해 +25%.',
        special: true, specialOffer: true, obtainableFrom: ['special_event'],
        passive(gs, trigger, data) {
            if (trigger === Trigger.DEAL_DAMAGE && typeof data === 'number') {
                return Math.max(1, Math.floor(data * 1.4));
            }
            if (trigger === Trigger.DAMAGE_TAKEN && typeof data === 'number' && data > 0) {
                return Math.max(0, Math.ceil(data * 1.25));
            }
        }
    },
    reactive_reactor: {
        id: 'reactive_reactor', name: '반응성 원자로', icon: '☢️', rarity: 'legendary',
        desc: '턴 시작: 체력 -4, 에너지 +1, 잔향 +12.',
        special: true, specialOffer: true, obtainableFrom: ['special_event'],
        passive(gs, trigger) {
            if (trigger !== Trigger.TURN_START) return;
            gs.player.hp = Math.max(1, (gs.player.hp || 1) - 4);
            gs.player.energy = Math.min(gs.player.maxEnergy, (gs.player.energy || 0) + 1);
            gs.addEcho(12, { name: '반응성 원자로', type: 'item' });
            gs.markDirty?.('hud');
        }
    },
    executioners_tithe: {
        id: 'executioners_tithe', name: '집행자의 십일조', icon: '🩸', rarity: 'rare',
        desc: '전투 시작: 체력 10% 손실. 적 처치 시: 체력 8 회복, 골드 12 획득.',
        special: true, specialOffer: true, obtainableFrom: ['special_event'],
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) {
                const loss = Math.max(1, Math.floor((gs.player.maxHp || 1) * 0.1));
                gs.player.hp = Math.max(1, (gs.player.hp || 1) - loss);
                gs.markDirty?.('hud');
                return;
            }
            if (trigger === Trigger.ENEMY_KILL) {
                gs.heal(8, { name: '집행자의 십일조', type: 'item' });
                gs.addGold(12, { name: '집행자의 십일조', type: 'item' });
            }
        }
    },
    sealed_lotus: {
        id: 'sealed_lotus', name: '봉인된 연화', icon: '🪷', rarity: 'uncommon',
        desc: '아무 능력이 없다. 전투 종료 3회 후 개화한다.',
        special: true, specialOffer: true, obtainableFrom: ['special_event'],
        passive(gs, trigger) {
            if (trigger !== Trigger.COMBAT_END) return;
            advanceSpecialRelicAwakening(gs, {
                dormantId: 'sealed_lotus',
                awakenedId: 'lotus_reborn',
                awakenedName: '윤회의 연화',
                requiredCombats: 3,
                sourceName: '봉인된 연화',
            });
        }
    },
    lotus_reborn: {
        id: 'lotus_reborn', name: '윤회의 연화', icon: '🌺', rarity: 'legendary',
        desc: '전투 시작: 카드 2장 드로우, 잔향 +25. 턴 시작: 체력 -1, 방어막 +6.',
        special: true, specialOffer: false, obtainableFrom: ['special_event'],
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) {
                gs.drawCards?.(2, { name: '윤회의 연화', type: 'item' });
                gs.addEcho(25, { name: '윤회의 연화', type: 'item' });
                return;
            }
            if (trigger === Trigger.TURN_START) {
                gs.player.hp = Math.max(1, (gs.player.hp || 1) - 1);
                gs.addShield(6, { name: '윤회의 연화', type: 'item' });
            }
        }
    },
    mute_chrysalis: {
        id: 'mute_chrysalis', name: '침묵의 번데기', icon: '🥚', rarity: 'rare',
        desc: '턴 시작: 방어막 3 상실. 전투 종료 4회 후 개화한다.',
        special: true, specialOffer: true, obtainableFrom: ['special_event'],
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START) {
                gs.player.shield = Math.max(0, (gs.player.shield || 0) - 3);
            }
            if (trigger === Trigger.COMBAT_END) {
                advanceSpecialRelicAwakening(gs, {
                    dormantId: 'mute_chrysalis',
                    awakenedId: 'thunder_chrysalis',
                    awakenedName: '천둥의 번데기',
                    requiredCombats: 4,
                    sourceName: '침묵의 번데기',
                });
            }
        }
    },
    thunder_chrysalis: {
        id: 'thunder_chrysalis', name: '천둥의 번데기', icon: '⚡', rarity: 'legendary',
        desc: '전투 시작: 회피 1, 잔향 +20. 턴마다 첫 카드 사용 시 35% 확률로 에너지 +1.',
        special: true, specialOffer: false, obtainableFrom: ['special_event'],
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) {
                gs.addBuff('dodge', 1, { name: '천둥의 번데기', type: 'item' });
                gs.addEcho(20, { name: '천둥의 번데기', type: 'item' });
                gs._thunderChrysalisProc = false;
                return;
            }
            if (trigger === Trigger.TURN_START) {
                gs._thunderChrysalisProc = false;
                return;
            }
            if (trigger === Trigger.CARD_PLAY && !gs._thunderChrysalisProc && Math.random() < 0.35) {
                gs._thunderChrysalisProc = true;
                gs.player.energy = Math.min(gs.player.maxEnergy, (gs.player.energy || 0) + 1);
                gs.addLog?.('⚡ 천둥의 번데기: 에너지 +1', 'item');
                gs.markDirty?.('hud');
            }
        }
    },
    cinder_seed: {
        id: 'cinder_seed', name: '잿빛 씨앗', icon: '🌱', rarity: 'uncommon',
        desc: '전투 시작: 체력 -3. 전투 종료 5회 후 개화한다.',
        special: true, specialOffer: true, obtainableFrom: ['special_event'],
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) {
                gs.player.hp = Math.max(1, (gs.player.hp || 1) - 3);
                gs.markDirty?.('hud');
                return;
            }
            if (trigger === Trigger.COMBAT_END) {
                advanceSpecialRelicAwakening(gs, {
                    dormantId: 'cinder_seed',
                    awakenedId: 'cinder_crown',
                    awakenedName: '재의 왕관',
                    requiredCombats: 5,
                    sourceName: '잿빛 씨앗',
                });
            }
        }
    },
    cinder_crown: {
        id: 'cinder_crown', name: '재의 왕관', icon: '👑', rarity: 'legendary',
        desc: '주는 피해 +12. 전투 종료 시 체력 6 회복.',
        special: true, specialOffer: false, obtainableFrom: ['special_event'],
        passive(gs, trigger, data) {
            if (trigger === Trigger.DEAL_DAMAGE && typeof data === 'number') {
                return (data || 0) + 12;
            }
            if (trigger === Trigger.COMBAT_END) {
                gs.heal(6, { name: '재의 왕관', type: 'item' });
            }
        }
    },

    // ──────────── [세트 H] 역병의 결사 ────────────
    // 2개 보유: 독 피해 시 방어막 +1
    // 3개 보유: 독 피해량 +20%

    poison_gland_flask: {
        id: 'poison_gland_flask', name: '독샘 호리병', icon: '🧪', rarity: 'uncommon',
        desc: '독 부여 시: 부여하는 독 수치 +1. [세트:역병]',
        passive(gs, trigger, data) {
            if (trigger === Trigger.ENEMY_STATUS_APPLY && data?.status === 'poisoned') {
                return (data.duration || 0) + 1;
            }
        }
    },
    thornvine_heart: {
        id: 'thornvine_heart', name: '가시넝쿨 심장', icon: '🌿', rarity: 'uncommon',
        desc: '회복 시: 잃은 체력의 10%만큼 추가 회복. [세트:역병]',
        passive(gs, trigger, data) {
            if (trigger === Trigger.HEAL_AMOUNT && typeof data === 'number' && data > 0) {
                const missingHp = (gs.player.maxHp || 0) - (gs.player.hp || 0);
                const bonus = Math.floor(missingHp * 0.1);
                return data + bonus;
            }
        }
    },
    plague_doctor_scalpel: {
        id: 'plague_doctor_scalpel', name: '역병 의사의 메스', icon: '🔪', rarity: 'rare',
        desc: '적에게 독 부여 시: 방어막 +3. [세트:역병]',
        passive(gs, trigger, data) {
            if (trigger === Trigger.ENEMY_STATUS_APPLY && data?.status === 'poisoned') {
                gs.addShield(3, { name: '역병 의사의 메스', type: 'item' });
            }
        }
    },
    decaying_shroud: {
        id: 'decaying_shroud', name: '부패한 수의', icon: '🧥', rarity: 'rare',
        desc: '턴 시작 시 체력이 50% 이하이면: 잃은 체력의 15%만큼 방어막 획득. [세트:역병]',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START && (gs.player.hp || 0) <= (gs.player.maxHp || 0) * 0.5) {
                const missingHp = (gs.player.maxHp || 0) - (gs.player.hp || 0);
                const shield = Math.floor(missingHp * 0.15);
                if (shield > 0) gs.addShield(shield, { name: '부패한 수의', type: 'item' });
            }
        }
    },

    // ──────────── [세트 I] 독사의 시선 ────────────
    serpent_fang_dagger: {
        id: 'serpent_fang_dagger', name: '독사의 송곳니', icon: '🗡️', rarity: 'common',
        desc: '전투 시작: 무작위 적에게 독 4 부여. [세트:독사]',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) {
                const enemies = gs.combat?.enemies || [];
                const alive = enemies.map((_, i) => i).filter(i => enemies[i].hp > 0);
                if (alive.length > 0) {
                    const target = alive[Math.floor(Math.random() * alive.length)];
                    gs.applyEnemyStatus('poisoned', 4, target, { name: '독사의 송곳니', type: 'item' });
                }
            }
        }
    },
    acidic_vial: {
        id: 'acidic_vial', name: '산성 유리병', icon: '🧪', rarity: 'uncommon',
        desc: '독 상태인 적 공격 시: 20% 확률로 독 수치 +1. [세트:독사]',
        passive(gs, trigger, data) {
            if (trigger === Trigger.DEAL_DAMAGE) {
                const selected = Number(gs._selectedTarget);
                const targetIdx = Number.isInteger(selected) && selected >= 0 && (gs.combat?.enemies?.[selected]?.hp || 0) > 0
                    ? selected
                    : (gs.combat?.enemies?.findIndex?.(e => e.hp > 0) ?? -1);
                const target = gs.combat?.enemies?.[targetIdx];
                if ((target?.statusEffects?.poisoned || 0) > 0 && Math.random() < 0.2) {
                    gs.applyEnemyStatus('poisoned', 1, targetIdx, { name: '산성 유리병', type: 'item' });
                }
            }
        }
    },
    cobra_scale_charm: {
        id: 'cobra_scale_charm', name: '코브라 비늘', icon: '🐍', rarity: 'uncommon',
        desc: '독 수치가 감소할 때: 잔향 +15 (턴당 2회). [세트:독사]',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START) gs._cobraCount = 0;
            if (trigger === Trigger.POISON_DAMAGE && (gs._cobraCount || 0) < 2) {
                gs._cobraCount = (gs._cobraCount || 0) + 1;
                gs.addEcho(15, { name: '코브라 비늘', type: 'item' });
            }
        }
    },

    // ──────────── [세트 J] 생명의 성배 ────────────
    monks_rosary: {
        id: 'monks_rosary', name: '수도사의 묵주', icon: '📿', rarity: 'common',
        desc: '매 턴 시작 시: 체력 3 회복. [세트:성배]',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START) gs.heal(3, { name: '수도사의 묵주', type: 'item' });
        }
    },
    fountain_essence: {
        id: 'fountain_essence', name: '샘물의 정수', icon: '💧', rarity: 'uncommon',
        desc: '회복 효과 +25%. [세트:성배]',
        passive(gs, trigger, data) {
            if (trigger === Trigger.HEAL_AMOUNT && typeof data === 'number') {
                return Math.floor(data * 1.25);
            }
        }
    },
    life_bloom_seed: {
        id: 'life_bloom_seed', name: '생명 개화의 씨앗', icon: '🌱', rarity: 'rare',
        desc: '전투 종료 시: 체력 10 회복. [세트:성배]',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_END) gs.heal(10, { name: '생명 개화의 씨앗', type: 'item' });
        }
    },

    // ──────────── [세트 K] 거인의 인내 ────────────
    titans_belt: {
        id: 'titans_belt', name: '거인의 벨트', icon: '🥋', rarity: 'common',
        desc: '최대 체력 +15. [세트:거인]',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START && !gs._titansBeltActive) {
                gs._titansBeltBaseMax = gs.player.maxHp;
                gs.player.maxHp += 15;
                gs.player.hp = Math.min(gs.player.maxHp, gs.player.hp + 15);
                gs._titansBeltActive = true;
                gs.addLog?.('🥋 거인의 벨트: 최대 체력 +15', 'item');
                gs.markDirty?.('hud');
            }
            if ((trigger === Trigger.COMBAT_END || trigger === 'death') && gs._titansBeltActive) {
                gs.player.maxHp = gs._titansBeltBaseMax ?? Math.max(1, gs.player.maxHp - 15);
                gs.player.hp = Math.min(gs.player.hp, gs.player.maxHp);
                gs._titansBeltActive = false;
                gs._titansBeltBaseMax = undefined;
            }
        }
    },
    endurance_medal: {
        id: 'endurance_medal', name: '인내의 훈장', icon: '🎖️', rarity: 'uncommon',
        desc: '체력 30% 이하일 때: 받는 피해 -5. [세트:거인]',
        passive(gs, trigger, data) {
            if (trigger === Trigger.DAMAGE_TAKEN && data > 0 && gs.player.hp <= gs.player.maxHp * 0.3) {
                return Math.max(0, data - 5);
            }
        }
    },
    ancient_heart_stone: {
        id: 'ancient_heart_stone', name: '고대 심장석', icon: '💎', rarity: 'rare',
        desc: '층 이동 시: 최대 체력 +1 영구 증가. [세트:거인]',
        passive(gs, trigger) {
            if (trigger === Trigger.FLOOR_START) {
                gs.player.maxHp += 1;
                gs.player.hp += 1;
                gs.addLog?.('💎 고대 심장석: 최대 체력 +1 영구 증가', 'item');
                gs.markDirty?.('hud');
            }
        }
    },

    // ──────────── [세트 L] 철옹성 ────────────
    bastion_shield_plate: {
        id: 'bastion_shield_plate', name: '요새의 방패판', icon: '🛡️', rarity: 'common',
        desc: '턴 종료 시: 방어막 5 획득. [세트:철옹성]',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_END) gs.addShield(5, { name: '요새의 방패판', type: 'item' });
        }
    },
    spiked_buckler: {
        id: 'spiked_buckler', name: '가시 박힌 버클러', icon: '🛡️', rarity: 'uncommon',
        desc: '방어막 보유 중 피격 시: 적에게 가시 피해 6. [세트:철옹성]',
        passive(gs, trigger, data) {
            if (trigger === Trigger.DAMAGE_TAKEN && data > 0 && (gs.player.shield || 0) > 0) {
                const targetIdx = gs.combat?.enemies?.findIndex(e => e.hp > 0) ?? -1;
                if (targetIdx >= 0) {
                    gs.addLog?.('🛡️ 가시 박힌 버클러: 반격!', 'damage');
                    if (typeof gs.dealDamage === 'function') {
                        gs.dealDamage(6, targetIdx, true, { name: '가시 박힌 버클러', type: 'item' });
                    }
                }
            }
        }
    },
    fortified_gauntlet: {
        id: 'fortified_gauntlet', name: '강화된 건틀릿', icon: '🧤', rarity: 'rare',
        desc: '방어막 획득 시: 15% 확률로 획득량 2배. [세트:철옹성]',
        passive(gs, trigger, data) {
            if (trigger === Trigger.SHIELD_GAIN && typeof data === 'number' && data > 0 && Math.random() < 0.15) {
                gs.addLog?.('🧤 강화된 건틀릿: 방어막 증폭!', 'item');
                return data * 2;
            }
        }
    },
};
