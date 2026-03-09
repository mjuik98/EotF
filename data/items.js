/**
 * items.js — 아이템/유물 데이터
 */
import { LogUtils } from '../game/utils/log_utils.js';
import { CARDS } from './cards.js';
import { Trigger } from '../game/data/triggers.js';
import { CONSTANTS } from '../game/data/constants.js';
import { registerItemFound } from '../game/systems/codex_records_system.js';

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
    registerItemFound(gs, awakenedId);
    gs.addLog?.(`🌌 ${sourceName} 개화: ${awakenedName || awakenedId}`, 'item');
    return true;
}

const COMMON_ITEMS = {
    // ══════════════ [ 대분류: 일반 유물 ] ══════════════
    void_compass: {
        id: 'void_compass', name: '공허의 나침반', icon: '🧭', rarity: 'common',
        desc: '전투 시작: 카드 1장 드로우',
        passive(gs, trigger) { if (trigger === Trigger.COMBAT_START) { gs.drawCards(1, { name: '공허의 나침반', type: 'item' }); } }
    },
    void_shard: {
        id: 'void_shard', name: '공허의 파편', icon: '🔷', rarity: 'common',
        desc: '전투 종료: 잔향 20 충전',
        passive(gs, trigger) { if (trigger === Trigger.COMBAT_END) { gs.addEcho(20, { name: '공허의 파편', type: 'item' }); } }
    },
    cracked_amulet: {
        id: 'cracked_amulet', name: '부서진 목걸이', icon: '📿', rarity: 'common',
        desc: '매 턴: 체력 2 회복',
        passive(gs, trigger) { if (trigger === Trigger.TURN_START) { gs.heal(2, { name: '부서진 목걸이', type: 'item' }); } }
    },
    worn_pouch: {
        id: 'worn_pouch', name: '낡은 주머니', icon: '💰', rarity: 'common',
        desc: '전투 시작: 골드 5 획득',
        passive(gs, trigger) { if (trigger === Trigger.COMBAT_START) { gs.addGold(5, { name: '낡은 주머니', type: 'item' }); } }
    },
    dull_blade: {
        id: 'dull_blade', name: '무딘 검', icon: '🗡️', rarity: 'common',
        desc: '카드 사용 시 10% 확률로 잔향 10 충전',
        passive(gs, trigger) { if (trigger === Trigger.CARD_PLAY && Math.random() < 0.1) { gs.addEcho(10, { name: '무딘 검', type: 'item' }); } }
    },
    travelers_map: {
        id: 'travelers_map', name: '여행자의 지도', icon: '🗺️', rarity: 'common',
        desc: '층 이동 시 체력 3 회복',
        passive(gs, trigger) { if (trigger === Trigger.FLOOR_START) { gs.heal(3, { name: '여행자의 지도', type: 'item' }); } }
    },
    rift_talisman: {
        id: 'rift_talisman', name: '균열의 부적', icon: '🧿', rarity: 'common',
        desc: '전투 시작: 방어막 5',
        passive(gs, trigger) { if (trigger === Trigger.COMBAT_START) { gs.addShield(5, { name: '균열의 부적', type: 'item' }); } }
    },
    blood_shard: {
        id: 'blood_shard', name: '핏빛 파편', icon: '🩸', rarity: 'common',
        desc: '적 처치 시 잔향 10 충전',
        passive(gs, trigger) { if (trigger === Trigger.ENEMY_KILL) { gs.addEcho(10, { name: '핏빛 파편', type: 'item' }); } }
    },
    morning_dew: {
        id: 'morning_dew', name: '아침 이슬', icon: '💧', rarity: 'common',
        desc: '전투 첫 번째 턴: 방어막 8',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) gs._morningDewFirst = true;
            if (trigger === Trigger.TURN_START && gs._morningDewFirst) {
                gs._morningDewFirst = false;
                gs.addShield(8, { name: '아침 이슬', type: 'item' });
            }
        }
    },
    thin_codex: {
        id: 'thin_codex', name: '얇은 문서', icon: '📄', rarity: 'common',
        desc: '전투 시작: 덱 10장 이하 시 카드 1장 드로우',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START && (gs.player.deck?.length || 0) <= 10) {
                gs.drawCards(1, { name: '얇은 문서', type: 'item' });
            }
        }
    },
    tally_stone: {
        id: 'tally_stone', name: '집계석', icon: '🧮', rarity: 'common',
        desc: '타격 시 집계 +1. 5회 누적 시 방어막 12 획득 및 초기화',
        passive(gs, trigger) {
            if (trigger === Trigger.DEAL_DAMAGE) {
                gs._tallyCount = (gs._tallyCount || 0) + 1;
                if (gs._tallyCount >= 5) {
                    gs._tallyCount = 0;
                    gs.addShield(12, { name: '집계석', type: 'item' });
                    gs.addLog('🧮 집계석: 방어막 12 생성!', 'item');
                }
            }
        }
    },
    echo_bell: {
        id: 'echo_bell', name: '잔향의 종', icon: 'Bell', rarity: 'common',
        desc: '카드 10장 사용 시마다 잔향 15 충전',
        passive(gs, trigger) {
            if (trigger === Trigger.CARD_PLAY) {
                gs._bellCount = (gs._bellCount || 0) + 1;
                if (gs._bellCount % 10 === 0) {
                    gs.addEcho(15, { name: '잔향의 종', type: 'item' });
                }
            }
        }
    },
    lucky_coin: {
        id: 'lucky_coin', name: '행운의 주화', icon: '🪙', rarity: 'common',
        desc: '매 턴 5% 확률로 에너지 1 회복',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START && Math.random() < 0.05) {
                gs.player.energy = Math.min(gs.player.maxEnergy, gs.player.energy + 1);
                gs.addLog?.('🪙 행운의 주화: 에너지 회복!', 'item');
            }
        }
    },
    rusty_key: {
        id: 'rusty_key', name: '녹슨 열쇠', icon: '🔑', rarity: 'common',
        desc: '상점 방문 시: 유물 가격 10% 할인가 적용.',
        passive(gs, trigger, data) {
            if (trigger === Trigger.SHOP_PRICE_MOD && data?.type === 'relic') {
                return 0.9;
            }
        }
    },

    // 세트: 고대인의 유산
    ancient_handle: {
        id: 'ancient_handle', name: '고대인의 자루', icon: '柄', rarity: 'common',
        desc: '[고대인의 유산] 전투 시작 시: 방어막 3 획득.',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) gs.addShield(3, { name: '고대인의 자루', type: 'item' });
        }
    },
    ancient_leather: {
        id: 'ancient_leather', name: '고대인의 가죽', icon: '革', rarity: 'common',
        desc: '[고대인의 유산] 최대 체력 +2.',
        onAcquire(gs) { gs.player.maxHp += 2; gs.player.hp += 2; },
        passive() {}
    },
};

const UNCOMMON_ITEMS = {
    // ══════════════ [ 대분류: 특별 유물 ] ══════════════
    magnifying_glass: {
        id: 'magnifying_glass', name: '돋보기', icon: '🔍', rarity: 'uncommon',
        desc: '매 턴 시작 시: 적의 다음 행동을 더 자세히 분석 (의도 공격력 10% 감소).',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START) {
                gs.enemies?.forEach(e => {
                    if (e.intent?.type === 'attack') e.intent.value = Math.max(0, Math.floor(e.intent.value * 0.9));
                });
            }
        }
    },
    golden_feather: {
        id: 'golden_feather', name: '황금 깃털', icon: '🪶', rarity: 'uncommon',
        desc: '매 전투 시작 시: 회피 1을 획득.',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) gs.addBuff('evasion', 1, { name: '황금 깃털', type: 'item' });
        }
    },
    heavy_anvil: {
        id: 'heavy_anvil', name: '무거운 모루', icon: '⚙️', rarity: 'uncommon',
        desc: '휴식 지점에서 카드 강화 시: 무작위 카드 1장을 추가로 강화.',
        passive(gs, trigger, data) {
            if (trigger === Trigger.REST_UPGRADE) {
                const upgradeable = gs.player.deck.filter(c => !CARDS[c]?.upgraded);
                if (upgradeable.length > 0) {
                    const target = upgradeable[Math.floor(Math.random() * upgradeable.length)];
                    gs.upgradeCard(target);
                    gs.addLog?.(`⚙️ 무거운 모루: ${CARDS[target]?.name || target} 추가 강화!`, 'item');
                }
            }
        }
    },
    liquid_memory: {
        id: 'liquid_memory', name: '액체 기억', icon: '🧪', rarity: 'uncommon',
        desc: '전투 중 처음 소모한 카드를 덱 맨 위로 되돌림 (전투당 1회).',
        passive(gs, trigger, data) {
            if (trigger === Trigger.CARD_EXHAUST && !gs._liquidMemoryUsed) {
                gs._liquidMemoryUsed = true;
                const idx = gs.player.exhausted.lastIndexOf(data.cardId);
                if (idx >= 0) {
                    gs.player.exhausted.splice(idx, 1);
                    gs.player.deck.push(data.cardId);
                    gs.addLog?.(`🧪 액체 기억: ${CARDS[data.cardId]?.name}를 복구했습니다.`, 'item');
                }
            }
            if (trigger === Trigger.COMBAT_START) gs._liquidMemoryUsed = false;
        }
    },
    balanced_scale: {
        id: 'balanced_scale', name: '균형의 저울', icon: '⚖️', rarity: 'uncommon',
        desc: '턴 종료 시 에너지가 0이라면, 다음 턴 드로우 +1.',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_END && gs.player.energy === 0) gs._scaleActive = true;
            if (trigger === Trigger.TURN_START && gs._scaleActive) {
                gs._scaleActive = false;
                gs.player.drawCount += 1;
                gs._scaleDrawReset = true;
                gs.addLog?.('⚖️ 균형의 저울: 추가 드로우!', 'item');
            }
            if (trigger === Trigger.TURN_END && gs._scaleDrawReset) {
                gs.player.drawCount = Math.max(1, gs.player.drawCount - 1);
                gs._scaleDrawReset = false;
            }
        }
    },
    vampiric_fang: {
        id: 'vampiric_fang', name: '흡혈귀의 송곳니', icon: '🧛', rarity: 'uncommon',
        desc: '공격으로 적 처치 시: 체력 3 회복.',
        passive(gs, trigger) {
            if (trigger === Trigger.ENEMY_KILL) gs.heal(3, { name: '흡혈귀의 송곳니', type: 'item' });
        }
    },
    crystal_ball: {
        id: 'crystal_ball', name: '수정구슬', icon: '🔮', rarity: 'uncommon',
        desc: '전투 시작 시: 무작위 카드 3장의 비용을 이번 전투 동안 1 감소.',
        passive(gs, trigger, data) {
            if (trigger === Trigger.COMBAT_START && gs.player.deck?.length > 0) {
                gs._crystalDiscounted = new Set();
                const deck = [...gs.player.deck];
                const picks = new Set();
                while (picks.size < Math.min(3, deck.length)) {
                    picks.add(Math.floor(Math.random() * deck.length));
                }
                picks.forEach(r => {
                    const cardId = deck[r];
                    gs._crystalDiscounted.add(cardId);
                    gs.addLog?.(`🔮 수정구슬: ${CARDS[cardId]?.name} 비용 -1`, 'item');
                });
            }
            if (trigger === Trigger.BEFORE_CARD_COST && gs._crystalDiscounted?.has(data?.cardId)) {
                return Math.max(0, (data?.cost ?? 0) - 1);
            }
            if (trigger === Trigger.COMBAT_END) {
                gs._crystalDiscounted = null;
            }
        }
    },
    merchants_pendant: {
        id: 'merchants_pendant', name: '상인의 펜던트', icon: '📿', rarity: 'uncommon',
        desc: '상점에서 물건을 구매할 때마다 최대 체력 +1.',
        passive(gs, trigger) {
            if (trigger === Trigger.SHOP_BUY) {
                gs.player.maxHp += 1;
                gs.player.hp += 1;
                gs.addLog?.('📿 상인의 펜던트: 건강해진 느낌!', 'item');
            }
        }
    },
    adrenaline_shot: {
        id: 'adrenaline_shot', name: '아드레날린 주사', icon: '💉', rarity: 'uncommon',
        desc: '체력이 25% 이하일 때: 주는 피해 25% 증가.',
        passive(gs, trigger, data) {
            if (trigger === Trigger.DEAL_DAMAGE && gs.player.hp <= gs.player.maxHp * 0.25) {
                return typeof data === 'number' ? Math.floor(data * 1.25) : data;
            }
        }
    },

    // 세트: 고대인의 유산
    ancient_blade: {
        id: 'ancient_blade', name: '고대인의 칼날', icon: '刃', rarity: 'uncommon',
        desc: '[고대인의 유산] 공격 피해 +1.',
        passive(gs, trigger, data) {
            if (trigger === Trigger.DEAL_DAMAGE && typeof data === 'number') return data + 1;
        }
    },
    ancient_scroll: {
        id: 'ancient_scroll', name: '고대인의 두루마리', icon: '卷', rarity: 'uncommon',
        desc: '[고대인의 유산] 매 전투 시작 시: 무작위 카드 1장 획득.',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) {
                const allKeys = Object.keys(CARDS);
                const randomCard = allKeys[Math.floor(Math.random() * allKeys.length)];
                gs.player.hand.push(randomCard);
                gs.addLog?.(`📜 고대인의 두루마리: ${CARDS[randomCard]?.name} 획득!`, 'item');
            }
        }
    },
};

const RARE_ITEMS = {
    // ══════════════ [ 대분류: 희귀 유물 ] ══════════════
    everlasting_oil: {
        id: 'everlasting_oil', name: '꺼지지 않는 기름', icon: '🕯️', rarity: 'rare',
        desc: '매 턴 시작 시: 무작위 카드 1장의 비용을 이번 턴 동안 0으로 만듭니다.',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START && gs.player.hand?.length > 0) {
                const h = gs.player.hand;
                const r = Math.floor(Math.random() * h.length);
                gs._oilTarget = h[r];
                gs.addLog?.(`🕯️ 꺼지지 않는 기름: ${CARDS[h[r]]?.name} 비용이 0이 되었습니다!`, 'item');
            }
        }
    },
    phoenix_feather: {
        id: 'phoenix_feather', name: '불사조의 깃털', icon: '🔥', rarity: 'rare',
        desc: '사망 시: 체력을 50% 회복하고 부활합니다 (전체 게임 중 1회).',
        passive(gs, trigger) {
            if (trigger === Trigger.PRE_DEATH && !gs._phoenixUsed) {
                gs._phoenixUsed = true;
                gs.player.hp = Math.floor(gs.player.maxHp * 0.5);
                gs.addLog?.('🔥 불사조의 깃털: 죽음에서 돌아왔습니다!', 'item');
                return { cancelDeath: true };
            }
        }
    },
    dimension_pocket: {
        id: 'dimension_pocket', name: '차원 주머니', icon: '🎒', rarity: 'rare',
        desc: '최대 에너지 +1. 매 턴 시작 시 저주 카드 1장을 덱에 섞어넣습니다.',
        onAcquire(gs) { gs.player.maxEnergy += 1; },
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START) {
                gs.player.deck.push('curse_noise');
                gs.addLog?.('🎒 차원 주머니: 공간의 뒤틀림으로 노이즈가 유입됩니다.', 'echo');
            }
        }
    },
    mana_battery: {
        id: 'mana_battery', name: '마력 배터리', icon: '🔋', rarity: 'rare',
        desc: '턴 종료 시: 남은 에너지를 다음 턴으로 이월합니다 (최대 3).',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_END) gs._manaStored = Math.min(3, gs.player.energy);
            if (trigger === Trigger.TURN_START && gs._manaStored) {
                gs.player.energy += gs._manaStored;
                gs.addLog?.(`🔋 마력 배터리: 에너지 ${gs._manaStored} 이월 완료.`, 'item');
                gs._manaStored = 0;
            }
        }
    },
    bloody_contract: {
        id: 'bloody_contract', name: '핏빛 계약', icon: '📜', rarity: 'rare',
        desc: '전투 시작 시: 체력을 6 소모하고 카드 2장을 추가로 드로우합니다.',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) {
                gs.player.hp = Math.max(1, gs.player.hp - 6);
                gs.drawCards(2, { name: '핏빛 계약', type: 'item' });
                gs.addLog?.('📜 핏빛 계약: 대가를 치르고 힘을 얻습니다.', 'item');
            }
        }
    },
    soul_magnet: {
        id: 'soul_magnet', name: '영혼 자석', icon: '🧲', rarity: 'rare',
        desc: '적 처치 시: 최대 체력 +2.',
        passive(gs, trigger) {
            if (trigger === Trigger.ENEMY_KILL) {
                gs.player.maxHp += 2;
                gs.player.hp += 2;
                gs.addLog?.('🧲 영혼 자석: 생명력이 강화되었습니다.', 'item');
            }
        }
    },
    clockwork_butterfly: {
        id: 'clockwork_butterfly', name: '태엽 나비', icon: '🦋', rarity: 'rare',
        desc: '3턴마다 추가 턴을 얻습니다 (추가 턴에는 드로우되지 않음).',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START) {
                gs._butterflyCount = (gs._butterflyCount || 0) + 1;
                if (gs._butterflyCount >= 3) {
                    gs._butterflyCount = 0;
                    gs.addLog?.('🦋 태엽 나비: 가속된 시간속으로!', 'item');
                }
            }
        }
    },

    // 세트: 심연의 삼위일체
    abyssal_eye: {
        id: 'abyssal_eye', name: '심연의 눈', icon: '👁️', rarity: 'rare',
        desc: '[심연의 삼위일체] 적의 방어도를 무시하고 피해를 줍니다.',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) gs._ignoreShield = false;
            if (trigger === Trigger.DEAL_DAMAGE) gs._ignoreShield = true;
            if (trigger === Trigger.COMBAT_END) gs._ignoreShield = false;
        }
    },
    abyssal_hand: {
        id: 'abyssal_hand', name: '심연의 손', icon: '🤚', rarity: 'rare',
        desc: '[심연의 삼위일체] 매 턴 처음 사용하는 카드를 2번 발동합니다.',
        passive(gs, trigger, data) {
            if (trigger === Trigger.TURN_START) gs._abyssalUsed = false;
            if (trigger === Trigger.CARD_PLAY && !gs._abyssalUsed) {
                gs._abyssalUsed = true;
                return { doubleCast: true };
            }
        }
    },
    abyssal_heart: {
        id: 'abyssal_heart', name: '심연의 심장', icon: '🖤', rarity: 'rare',
        desc: '[심연의 삼위일체] 체력이 50% 이하일 때, 매 턴 에너지 +1.',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START && gs.player.hp <= gs.player.maxHp * 0.5) {
                gs.player.energy += 1;
                gs.addLog?.('🖤 심연의 심장: 고동소리가 빨라집니다.', 'item');
            }
        }
    },
};

const LEGENDARY_ITEMS = {
    // ══════════════ [ 대분류: 전설 유물 ] ══════════════
    eternity_core: {
        id: 'eternity_core', name: '영겁의 핵심', icon: '💎', rarity: 'legendary',
        desc: '매 턴 시작 시: 에너지를 1 추가로 얻고 카드 1장을 추가로 드로우합니다.',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START) {
                gs.player.energy += 1;
                gs.player.drawCount += 1;
                gs._eternityActive = true;
                gs.addLog?.('💎 영겁의 핵심: 시간이 가속됩니다.', 'item');
            }
            if (trigger === Trigger.TURN_END && gs._eternityActive) {
                gs.player.drawCount = Math.max(1, gs.player.drawCount - 1);
                gs._eternityActive = false;
            }
        }
    },
    god_slayer_blade: {
        id: 'god_slayer_blade', name: '신살의 검', icon: '🗡️', rarity: 'legendary',
        desc: '엘리트 및 보스에게 주는 피해가 50% 증가합니다.',
        passive(gs, trigger, data) {
            if (trigger === Trigger.DAMAGE_CALC && (gs.enemies?.some(e => e.isElite || e.isBoss))) {
                return data * 1.5;
            }
        }
    },
    infinite_loop: {
        id: 'infinite_loop', name: '무한의 루프', icon: '🌀', rarity: 'legendary',
        desc: '카드를 3장 사용할 때마다, 무작위 카드 1장을 소멸시키고 그 복사본 2장을 손패로 가져옵니다.',
        passive(gs, trigger, data) {
            if (trigger === Trigger.CARD_PLAY) {
                gs._loopCount = (gs._loopCount || 0) + 1;
                if (gs._loopCount % 3 === 0 && gs.player.hand?.length > 0) {
                    const h = gs.player.hand;
                    const r = Math.floor(Math.random() * h.length);
                    const card = h.splice(r, 1)[0];
                    gs.player.hand.push(card, card);
                    gs.addLog?.(`🌀 무한의 루프: ${CARDS[card]?.name} 자가 증식!`, 'item');
                }
            }
        }
    },
};

const BOSS_ITEMS = {
    // ══════════════ [ 대분류: 보스 유물 ] ══════════════
    titan_heart: {
        id: 'titan_heart', name: '티탄의 심장', icon: '❤️', rarity: 'boss',
        desc: '최대 체력이 50 증가하지만, 더 이상 일반적인 방법으로 체력을 회복할 수 없습니다.',
        onAcquire(gs) { gs.player.maxHp += 50; gs.player.hp += 50; },
        passive(gs, trigger) {
            if (trigger === Trigger.HEAL) return 0;
        }
    },
    eye_of_storm: {
        id: 'eye_of_storm', name: '폭풍의 눈', icon: '🌀', rarity: 'boss',
        desc: '매 턴 시작 시: 모든 적에게 취약 1을 부여합니다. 최대 에너지가 1 증가합니다.',
        onAcquire(gs) { gs.player.maxEnergy += 1; },
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START) {
                gs.enemies?.forEach(e => gs.addBuff('vulnerable', 1, { target: e }));
                gs.addLog?.('🌀 폭풍의 눈: 폭풍이 몰아칩니다.', 'item');
            }
        }
    },
};

const SPECIAL_ITEMS = {
    // ══════════════ [ 대분류: 특수/이벤트 유물 ] ══════════════
    eternal_fragment: {
        id: 'eternal_fragment', name: '영원의 파편', icon: '💎', rarity: 'special',
        desc: '최대 체력 +20, 최대 에너지 +1, 드로우 +1',
        onAcquire(gs) {
            gs.player.maxHp += 20;
            gs.player.hp += 20;
        },
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START) {
                gs.player.maxEnergy += 1;
                gs.player.drawCount += 1;
            }
            if (trigger === Trigger.COMBAT_END) {
                gs.player.maxEnergy = Math.max(1, gs.player.maxEnergy - 1);
                gs.player.drawCount = Math.max(1, gs.player.drawCount - 1);
            }
        }
    },
    dimension_key: {
        id: 'dimension_key', name: '차원 열쇠', icon: '🔑', rarity: 'special',
        desc: '전투 종료 시: 카드 보상 선택지 +1.',
        passive(gs, trigger, data) {
            if (trigger === Trigger.REWARD_GENERATE && data?.type === 'card') {
                return (data.count || 3) + 1;
            }
        }
    },
    glitch_circuit: {
        id: 'glitch_circuit', name: '글리치 회로', icon: '📼', rarity: 'special',
        desc: '턴 시작: 무작위 카드 1장의 비용 0, 다른 1장의 비용 +1.',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START && gs.player.hand?.length >= 2) {
                const h = gs.player.hand;
                const r1 = Math.floor(Math.random() * h.length);
                let r2 = Math.floor(Math.random() * h.length);
                while (r1 === r2) r2 = Math.floor(Math.random() * h.length);
                gs._glitch0 = h[r1];
                gs._glitchPlus = h[r2];
                gs.addLog?.('📼 글리치 회로: 데이터 간섭 발생!', 'item');
            }
        }
    },
    ancient_battery: {
        id: 'ancient_battery', name: '고대 배터리', icon: '🔋', rarity: 'special',
        desc: '매 턴 첫 번째 소모품 사용 시: 에너지를 소모하지 않음.',
        passive(gs, trigger, data) {
            if (trigger === Trigger.TURN_START) gs._batteryUsed = false;
            if (trigger === Trigger.ITEM_USE && !gs._batteryUsed) {
                gs._batteryUsed = true;
                return { costFree: true };
            }
        }
    },
};

export const ITEMS = {
    ...COMMON_ITEMS,
    ...UNCOMMON_ITEMS,
    ...RARE_ITEMS,
    ...LEGENDARY_ITEMS,
    ...BOSS_ITEMS,
    ...SPECIAL_ITEMS
};
