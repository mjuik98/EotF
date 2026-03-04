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
    gs.triggerItems?.(Trigger.CARD_EXHAUST, { cardId });
    if (sourceName) gs.addLog?.(LogUtils.formatItem(sourceName, `${CARDS?.[cardId]?.name || cardId} 소멸`), 'item');
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
        desc: '전투 시작 시 모든 적에게 독 2중첩을 부여합니다.',
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
        desc: '잔향 연쇄가 3 이상이라면, 카드가 소멸하는 것을 방지합니다.',
        passive(gs, trigger) { if (trigger === Trigger.CARD_DISCARD && gs.player.echoChain >= 3) gs.addLog('💎 공명석: 카드 소멸 방지!', 'echo'); }
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
            if (trigger === Trigger.CARD_PLAY && gs.player.echoChain >= CONSTANTS.COMBAT.CHAIN_BURST_THRESHOLD) {
                const aliveIdx = gs.combat.enemies.findIndex(e => e.hp > 0);
                if (aliveIdx >= 0) {
                    gs.applyEnemyStatus('stunned', 1, aliveIdx);
                    gs.addLog('🥊 잔향의 건틀릿: 적 기절!', 'echo');
                    gs.player.echoChain = 0;
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
            if (trigger === Trigger.COMBAT_START && !gs.meta._energyCoreGranted) {
                if (gs.player.maxEnergy < CONSTANTS.PLAYER.MAX_ENERGY_CAP) {
                    gs.player.maxEnergy++;
                    gs.player.energy = gs.player.maxEnergy;
                    gs.meta._energyCoreGranted = true;
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
        passive(gs, trigger) { if (trigger === Trigger.TURN_START) { gs.player.energy = Math.min(gs.player.maxEnergy + 1, gs.player.energy + 1); gs.player.hp = Math.max(1, gs.player.hp - 3); gs.addLog('🌩️ 저주받은 축전기: 에너지 +1 / 체력 -3', 'echo'); if (typeof updateUI === 'function') updateUI(); } }
    },
    void_battery: {
        id: 'void_battery', name: '공허의 전지', icon: '🔌', rarity: 'rare',
        desc: '잔향이 50 이상이라면, 매 턴 시작 시 에너지를 1 추가로 얻습니다.',
        passive(gs, trigger) { if (trigger === Trigger.TURN_START && gs.player.echo >= 50) { gs.player.energy = Math.min(gs.player.maxEnergy + 1, gs.player.energy + 1); gs.addLog('🔌 공허의 전지: 에너지 +1!', 'echo'); if (typeof updateUI === 'function') updateUI(); } }
    },
    surge_crystal: {
        id: 'surge_crystal', name: '쇄도의 수정', icon: '💫', rarity: 'legendary',
        desc: '전투 시작: 에너지 1 획득. (전투당 1회)',
        passive(gs, trigger) { if (trigger === Trigger.COMBAT_START && !gs._surgeGranted) { gs.player.maxEnergy++; gs.player.energy = gs.player.maxEnergy; gs._surgeGranted = true; gs.addLog('💫 쇄도의 수정: 최대 에너지 +1 영구 증가!', 'echo'); if (typeof updateUI === 'function') updateUI(); } }
    },
    exhaust_fan: {
        id: 'exhaust_fan', name: '소멸의 부채', icon: '🎐', rarity: 'uncommon',
        desc: '카드가 소멸할 때마다 방어막 3 획득.',
        passive(gs, trigger) { if (trigger === Trigger.CARD_EXHAUST) { gs.addShield(3, { name: '소멸의 부채', type: 'item' }); } }
    },
    energy_battery: {
        id: 'energy_battery', name: '에너지 전지', icon: '🔋', rarity: 'uncommon',
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
            if (trigger === Trigger.COMBAT_START) {
                gs.player._chainCapPlus = (gs.player._chainCapPlus || 0) + 2;
                gs.player.shield = Math.max(0, (gs.player.shield || 0) - 5);
            }
            if (trigger === Trigger.COMBAT_END) gs.player._chainCapPlus = 0;
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
            if (trigger === Trigger.COMBAT_START) {
                gs._paradoxFirstTurn = true;
                gs._paradoxBaseMax = gs.player.maxEnergy;
                gs.player.maxEnergy += 1;
            }
            if (trigger === Trigger.DAMAGE_TAKEN && gs._paradoxFirstTurn && data > 0) return Math.floor(data * 1.25);
            if (trigger === Trigger.TURN_END && gs._paradoxFirstTurn) gs._paradoxFirstTurn = false;
            if (trigger === Trigger.COMBAT_END) gs.player.maxEnergy = gs._paradoxBaseMax ?? gs.player.maxEnergy;
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
            if (trigger === Trigger.COMBAT_START) gs.player._chainCapPlus = (gs.player._chainCapPlus || 0) + 3;
            if (trigger === Trigger.CHAIN_BREAK) gs.player.hp = Math.max(1, gs.player.hp - 5);
            if (trigger === Trigger.COMBAT_END) gs.player._chainCapPlus = 0;
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
        passive(gs, trigger) { if (trigger === Trigger.CARD_PLAY && Math.random() < 0.15) { const idx = gs.combat.enemies.findIndex(e => e.hp > 0); if (idx >= 0) { gs.applyEnemyStatus('weakened', 1, idx); gs.addLog('🌑 공허의 눈: 약화 부여!', 'echo'); } } }
    },
    void_fang: {
        id: 'void_fang', name: '공허의 송곳니', icon: '🦷', rarity: 'uncommon',
        desc: '공격 카드를 사용할 때마다 잔향을 8 충전합니다. [세트:심연]',
        passive(gs, trigger, data) { if (trigger === Trigger.CARD_PLAY && data && CARDS[data.cardId]?.type === 'ATTACK') { gs.addEcho(8); gs.addLog('🦷 공허의 송곳니: 잔향 +8', 'echo'); } }
    },
    void_crown: {
        id: 'void_crown', name: '공허의 왕관', icon: '👁️', rarity: 'rare',
        desc: '카드 사용 시: 카드 비용이 0이면 잔향 10 추가 충전.',
        passive(gs, trigger) { if (trigger === Trigger.TURN_START) { const low = gs.player.hp < gs.player.maxHp * CONSTANTS.PLAYER.HIGH_HP_RATIO; if (low && !gs._crownActive) { gs.player.costDiscount = (gs.player.costDiscount || 0) + 1; gs._crownActive = true; gs.addLog('👁️ 공허의 왕관: 모든 카드 비용 -1!', 'echo'); } else if (!low && gs._crownActive) { gs.player.costDiscount = Math.max(0, (gs.player.costDiscount || 0) - 1); gs._crownActive = false; } } }
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
        passive(gs, trigger, data) { if (trigger === Trigger.DEAL_DAMAGE && gs.player.hp <= 50) return (data || 0) + 6; }
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
        passive(gs, trigger) { if (trigger === Trigger.TURN_START && gs.player.echo >= CONSTANTS.ECHO.BURST_THRESHOLD && !gs._genesisUsed) { gs.player._freeCardUses = Math.max(gs.player._freeCardUses || 0, Math.min(5, gs.player.hand.length)); gs._genesisUsed = true; gs.addLog('🌟 잔향의 기원: 손패 카드 비용 0!', 'echo'); } if (trigger === Trigger.COMBAT_END) gs._genesisUsed = false; }
    },
    abyss_codex: {
        id: 'abyss_codex', name: '심연의 비전서', icon: '📖', rarity: 'legendary',
        desc: '전투 시작: 덱에서 무작위 희귀 카드 1장 드로우.',
        passive(gs, trigger) { if (trigger === Trigger.COMBAT_START) { const source = (gs.player.drawPile && gs.player.drawPile.length > 0) ? gs.player.drawPile : gs.player.deck; const rares = source.filter(id => CARDS[id]?.rarity === 'rare'); if (rares.length > 0) { const c = rares[Math.floor(Math.random() * rares.length)]; const idx = source.indexOf(c); source.splice(idx, 1); if (source === gs.player.drawPile) { const dIdx = gs.player.deck.indexOf(c); if (dIdx !== -1) gs.player.deck.splice(dIdx, 1); } gs.player.hand.push(c); gs.addLog(`📖 심연의 비전서: ${CARDS[c]?.name} 뽑음!`, 'echo'); } } }
    },
};
