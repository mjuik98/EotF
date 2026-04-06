/**
 * events_data.js — 이벤트, 스토리 프래그먼트, 사망 명언
 */
import { LogUtils } from '../game/utils/log_utils.js';
import { CARDS } from './cards.js';
import { ITEMS } from './items.js';
import { echoResonanceEvent } from './events/echo_resonance_event.js';
import { forgeEvent } from './events/forge_event.js';
import { merchantLostEvent } from './events/merchant_lost_event.js';
import { shrineEvent } from './events/shrine_event.js';
import { addPlayerItemAndRegisterState } from './runtime_player_state_support.js';
import { pickMissingItemFromBestOwnedSet } from '../game/shared/progression/set_bonus_queries.js';

const MAP_NODE_TYPE_LABELS = {
    combat: '전투',
    elite: '정예 전투',
    event: '이벤트',
    shop: '상점',
    rest: '휴식처',
    mini_boss: '중간 보스',
    boss: '보스',
};

function pickRandom(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)] || null;
}

function getUpcomingMutableNodes(gs, depth = 1) {
    if (!gs || !Array.isArray(gs.mapNodes)) return [];
    const currentFloor = Number(gs.currentFloor);
    if (!Number.isFinite(currentFloor)) return [];
    const targetFloor = currentFloor + Math.max(1, Math.floor(Number(depth) || 1));

    return gs.mapNodes.filter((node) => {
        if (!node || node.floor !== targetFloor || node.visited) return false;
        return node.type !== 'boss' && node.type !== 'mini_boss';
    });
}

function rewriteUpcomingNodeType(gs, {
    toType,
    preferFrom = [],
    fallbackFrom = ['combat', 'event', 'shop', 'rest', 'elite'],
    excludeIds = null,
    depth = 1,
} = {}) {
    if (!toType) return null;

    const blocked = excludeIds instanceof Set ? excludeIds : new Set();
    const nodes = getUpcomingMutableNodes(gs, depth)
        .filter((node) => !blocked.has(node.id) && node.type !== toType);
    if (!nodes.length) return null;

    const preferSet = new Set(preferFrom);
    const fallbackSet = new Set(fallbackFrom);
    let pool = preferSet.size ? nodes.filter((node) => preferSet.has(node.type)) : [];
    if (!pool.length) {
        pool = fallbackSet.size ? nodes.filter((node) => fallbackSet.has(node.type)) : nodes;
    }
    if (!pool.length) return null;

    const targetNode = pickRandom(pool);
    if (!targetNode) return null;

    const fromType = targetNode.type;
    targetNode.type = toType;
    return { node: targetNode, from: fromType, to: toType };
}

function formatNodeRef(node) {
    if (!node) return '다음 층';
    const slotMap = ['A', 'B', 'C', 'D', 'E', 'F'];
    const slot = slotMap[node.pos] || String((Number(node.pos) || 0) + 1);
    return `${node.floor}층 ${slot} 구역`;
}

function formatNodeType(type) {
    return MAP_NODE_TYPE_LABELS[type] || type || '미확인';
}

function isItemObtainableFrom(item, source = 'event') {
    const routes = item?.obtainableFrom;
    if (!Array.isArray(routes) || routes.length === 0) return true;
    return routes.includes(source);
}

function hasRelicUnlockState(meta, itemId, classId = '') {
    const shared = meta?.contentUnlocks?.relics?.[itemId];
    if (shared?.unlocked) return true;
    if (!classId) return false;
    return !!meta?.contentUnlocks?.relicsByClass?.[String(classId)]?.[itemId]?.unlocked;
}

function isEventRelicAvailable(gs, item) {
    if (!item?.id) return false;
    if (item.requiresUnlock !== true) return true;
    return hasRelicUnlockState(gs?.meta, item.id, gs?.player?.class);
}

function pickObtainableItem(gs, {
    source = 'event',
    specialOfferOnly = false,
    excludeOwned = false,
} = {}) {
    const owned = new Set(excludeOwned ? (gs?.player?.items || []) : []);
    const pool = Object.values(ITEMS).filter((item) => {
        if (!item || !item.id) return false;
        if (!isItemObtainableFrom(item, source)) return false;
        if (specialOfferOnly && item.specialOffer !== true) return false;
        if (excludeOwned && owned.has(item.id)) return false;
        if (!isEventRelicAvailable(gs, item)) return false;
        return true;
    });
    return pickRandom(pool) || null;
}

function hasAvailableSpecialOfferItem(gs) {
    return !!pickObtainableItem(gs, {
        source: 'special_event',
        specialOfferOnly: true,
        excludeOwned: true,
    });
}

function notifyItemAcquired(item, services = {}) {
    services.playItemGet?.();
    services.showItemToast?.(item);
}

function pickBestIncompleteSetReward(gs) {
    return pickMissingItemFromBestOwnedSet(gs, ITEMS);
}

function ensureWorldMemory(gs) {
    if (!gs.worldMemory || typeof gs.worldMemory !== 'object') {
        gs.worldMemory = {};
    }
    return gs.worldMemory;
}

function markWorldMemory(gs, key, value = 1) {
    ensureWorldMemory(gs)[key] = value;
}

export const EVENTS = [
    {
        id: 'wanderer', layer: 1, title: '방랑자의 흔적', eyebrow: 'LAYER 1 · 우발적 이벤트',
        desc: '나뭇가지에 가방 하나가 걸려 있다. 누군가 두고 간 것인지, 아니면 던져버린 것인지. 혹은 — 당신이 먼저 이 길을 걸었는지.',
        choices: [
            {
                text: '🎒 손이 먼저 움직인다',
                effect(gs) {
                    gs.addGold(20);
                    gs.addLog(LogUtils.formatStatChange('플레이어', '골드', 20), 'heal');
                    return '낡은 동전들이 쏟아진다. 누군가의 마지막 재산이었을 것이다. 지금은 당신의 것이다.';
                }
            },
            {
                text: '🚶 못 본 척 지나간다',
                effect(gs) {
                    gs.addEcho(15);
                    gs.addLog(LogUtils.formatEcho('잔향 +15'), 'echo');
                    return '가방은 당신을 보았다. 당신은 가방을 보지 않았다. 그 선택이 잔향으로 쌓인다.';
                }
            },
        ]
    },
    {
        id: 'echo_shrine', layer: 1, title: '잔향의 제단', eyebrow: 'LAYER 1 · 우발적 이벤트',
        desc: '제단이 빛난다. 기억의 색깔로. 당신이 이 앞에 선 것이 처음이 아니라는 사실을, 제단은 알고 있다.',
        choices: [
            {
                text: '✨ 제단이 원하는 것을 준다 (체력 -10, 잔향 +50)',
                effect(gs) {
                    gs.player.hp = Math.max(1, gs.player.hp - 10);
                    gs.addEcho(50);
                    return '제단은 당신의 살 한 점을 먹었다. 대가는 공정하다. 잔향은 거짓말하지 않는다.';
                }
            },
            {
                text: '🚶 외면한다',
                effect(gs) {
                    return '제단이 침묵한다. 무언가를 기다리는 침묵이다. 다음 루프엔 바칠 수 있을까.';
                }
            }
        ]
    },
    shrineEvent,
    merchantLostEvent,
    {
        id: 'merchant_caravan', layer: 2, title: '돌아온 상단', eyebrow: 'LAYER 2 · 연속 이벤트',
        desc: '익숙한 목소리가 당신을 불렀다. 길 잃은 상인이 작은 상단을 이끌고 서 있다. "지난번의 빚은 길로 갚겠다." 상자와 지도 중 하나를 내민다.',
        isAvailable(gs) {
            const memory = gs?.worldMemory || {};
            return Number(memory.savedMerchant || 0) > 0 && !memory.merchantCaravanMet;
        },
        choices: [
            {
                text: '📦 보급 상자를 받는다 (체력 8 회복, 골드 25)',
                effect(gs) {
                    markWorldMemory(gs, 'merchantCaravanMet');
                    gs.heal?.(8);
                    gs.addGold?.(25);
                    return '상단은 약품과 동전을 남기고 사라졌다. 당신을 기억하는 세계가 있다는 사실이 조금 불편하다.';
                }
            },
            {
                text: '🗺 안전한 길을 묻는다 (체력 8 회복, 다음 층 상점으로 변경)',
                effect(gs) {
                    markWorldMemory(gs, 'merchantCaravanMet');
                    gs.heal?.(8);
                    const rewritten = rewriteUpcomingNodeType(gs, {
                        toType: 'shop',
                        preferFrom: ['combat', 'event'],
                    });
                    if (!rewritten) {
                        return '상인은 길을 짚어 줬지만, 바꿀 수 있는 갈래는 없었다. 그래도 숨을 돌릴 시간은 벌었다.';
                    }
                    return `${formatNodeRef(rewritten.node)}의 길이 ${formatNodeType(rewritten.to)}으로 바뀌었다. 상단은 더 이상 우연이 아니라고 말하는 듯하다.`;
                }
            },
        ]
    },
    {
        id: 'merchant_collectors', layer: 2, title: '채권 수금인', eyebrow: 'LAYER 2 · 연속 이벤트',
        desc: '검은 장부를 든 수금인이 길을 막는다. "상인의 빚은 돌아옵니다." 그는 당신이 외면했던 표정을 정확히 기억하고 있다.',
        isAvailable(gs) {
            const memory = gs?.worldMemory || {};
            return !!memory.stoleFromMerchant && !memory.merchantDebtResolved;
        },
        choices: [
            {
                text: '💸 빚을 갚는다 (골드 -25)',
                effect(gs) {
                    if (Number(gs?.player?.gold || 0) < 25) {
                        return { resultText: '갚을 만큼의 금이 없다. 수금인은 침묵 속에서 손을 뻗는다.', isFail: true };
                    }
                    gs.player.gold -= 25;
                    markWorldMemory(gs, 'merchantDebtResolved');
                    return '장부에 붉은 선이 그어진다. 빚은 사라졌지만, 기억은 사라지지 않는다.';
                }
            },
            {
                text: '🏃 흔적을 남긴 채 달아난다 (체력 -12)',
                effect(gs) {
                    markWorldMemory(gs, 'merchantDebtResolved');
                    gs.player.hp = Math.max(1, Number(gs?.player?.hp || 0) - 12);
                    return '칼끝이 스치고 지나간다. 간신히 벗어났지만, 이번에는 몸이 값을 치렀다.';
                }
            },
        ]
    },
    {
        id: 'ancient_echo_memorial', layer: 2, title: '태고의 추모석', eyebrow: 'LAYER 2 · 기억 이벤트',
        desc: '검은 석판에 태고의 잔향이 눌어붙어 있다. 한 번 쓰러뜨린 목소리가 다시 귓가를 긁는다. 세계가 패배를 기억하는 방식은 늘 불쾌하다.',
        isAvailable(gs) {
            const memory = gs?.worldMemory || {};
            return Number(memory.killed_ancient_echo || 0) > 0 && !memory.ancientEchoMemorialSeen;
        },
        choices: [
            {
                text: '🌑 잔향을 받아들인다 (잔향 +40)',
                effect(gs) {
                    markWorldMemory(gs, 'ancientEchoMemorialSeen');
                    gs.addEcho?.(40);
                    return '태고의 잔향이 다시 스며든다. 승리는 끝났지만, 울림은 아직 끝나지 않았다.';
                }
            },
            {
                text: '🪨 파편을 주워 담는다 (골드 +30)',
                effect(gs) {
                    markWorldMemory(gs, 'ancientEchoMemorialSeen');
                    gs.addGold?.(30);
                    return '깨진 추모석 조각 사이에 아직 값이 남아 있었다. 세계는 기억마저 거래품으로 남겨 둔다.';
                }
            },
        ]
    },
    {
        id: 'memory_broker', layer: 2, title: '기억 밀거래상', eyebrow: 'LAYER 2 · 교차 기억 이벤트',
        desc: '상인의 인장과 태고의 잔향이 한 자리에 겹친다. 얼굴을 가린 거래상이 웃는다. "기억이 두 겹이면 길값도 바뀌지." 그는 봉인 좌표를 판다.',
        isAvailable(gs) {
            const memory = gs?.worldMemory || {};
            return Number(memory.savedMerchant || 0) > 0
                && Number(memory.killed_ancient_echo || 0) > 0
                && !memory.memoryBrokerMet;
        },
        choices: [
            {
                text: '🗺 봉인 좌표를 산다 (골드 -25, 다음 층 이벤트로 변경)',
                effect(gs) {
                    if (Number(gs?.player?.gold || 0) < 25) {
                        return { resultText: '거래를 마무리할 금이 부족하다. 밀거래상은 좌표 대신 침묵만 남긴다.', isFail: true };
                    }
                    gs.player.gold -= 25;
                    markWorldMemory(gs, 'memoryBrokerMet');
                    const rerouted = rewriteUpcomingNodeType(gs, {
                        toType: 'event',
                        preferFrom: ['combat', 'rest'],
                    });
                    if (!rerouted) {
                        return '좌표는 손에 들어왔지만, 지금 바꿀 수 있는 갈래는 없었다. 다음 루프에 더 선명해질지도 모른다.';
                    }
                    return `${formatNodeRef(rerouted.node)}의 경로가 ${formatNodeType(rerouted.to)}로 바뀌었다. 밀거래상은 이미 다음 기억으로 사라졌다.`;
                }
            },
            {
                text: '💉 기억을 담보로 돈을 받는다 (체력 -8, 골드 +40)',
                effect(gs) {
                    markWorldMemory(gs, 'memoryBrokerMet');
                    gs.player.hp = Math.max(1, Number(gs?.player?.hp || 0) - 8);
                    gs.addGold?.(40);
                    return '팔뚝에 차가운 감각이 남는다. 무엇을 맡겼는지는 기억나지 않지만, 대가만큼은 손에 남았다.';
                }
            },
        ]
    },
    echoResonanceEvent,
    forgeEvent,
    {
        id: 'echo_scale', layer: 1, title: '기억의 저울', eyebrow: 'LAYER 1 · 우발적 이벤트',
        desc: '허공에 녹슨 저울 하나가 떠 있다. 한쪽 접시에는 황금이 쌓여 있고, 다른 쪽은 비어 있다. 저울대에는 "기억은 금보다 무겁고, 생명은 그보다 소중하다"는 문구가 새겨져 있다.',
        choices: [
            {
                text: '❤️ 생명의 무게 (골드 10 → 체력 15)',
                effect(gs) {
                    if (gs.player.hp >= gs.player.maxHp) return '당신의 생명은 이미 가득 차 있다. 저울이 불균형하게 흔들리다 멈춘다.';
                    if (gs.player.gold >= 10) {
                        gs.player.gold -= 10;
                        gs.heal(15);
                        return '금화가 사라지고 빈 접시에 온기가 차오른다. 치유의 기억이 몸을 감싼다.';
                    }
                    return '저울은 빈 손을 허락하지 않는다. 차가운 금속성 소리만 들릴 뿐이다.';
                }
            },
            {
                text: '⚡ 잔향의 평형 (골드 8 → 잔향 30)',
                effect(gs) {
                    if (gs.player.gold >= 8) {
                        gs.player.gold -= 8;
                        gs.addEcho(30);
                        return '금화를 올리자 저울이 수평을 이룬다. 그 찰나의 평형 속에서 순수한 잔향이 흘러나온다.';
                    }
                    return { resultText: '대가가 부족하다. 저울은 요지부동이다.', isFail: true };
                }
            },
            {
                text: '📜 지식의 등가교환 (골드 15 → 랜덤 카드 추가)',
                effect(gs, services = {}) {
                    if (gs.player.gold >= 15) {
                        gs.player.gold -= 15;
                        const c = gs.getRandomCard();
                        gs.player.deck.push(c);
                        services.playItemGet?.();
                        return {
                            resultText: `금화 한 자루가 사라지고, 대신 빛바랜 ${CARDS[c]?.name} 카드가 나타났다. 공정한 거래였다.`,
                            acquiredCard: c
                        };
                    }
                    return '저울 너머로 환상적인 지식이 보이지만, 당신이 가진 금만큼은 아니다.';
                }
            },
            {
                text: '🚶 조용히 지나간다',
                effect() {
                    return '저울은 끝내 기울지 않았다. 당신도 아무것도 올리지 않은 채 발걸음을 옮겼다.';
                }
            },
        ]
    },
    {
        id: 'silent_pool', layer: 1, title: '침묵의 웅덩이', eyebrow: 'LAYER 2 · 신비한 이벤트',
        desc: '잔향이 고여 웅덩이가 됐다. 수면이 거울처럼 당신을 비추는데 — 반사된 얼굴이 이쪽을 먼저 보고 있었다.',
        choices: [
            {
                text: '🍵 들이킨다 (체력 -10, 덱에 비범 카드 추가)',
                effect(gs) {
                    gs.player.hp = Math.max(1, gs.player.hp - 10);
                    const c = gs.getRandomCard('uncommon');
                    gs.player.deck.push(c);
                    return {
                        resultText: `목구멍이 서늘하다. 온전한 기억이 아닌, 파편화된 기술이 뇌리에 박힌다. ${CARDS[c]?.name}을(를) 배웠다.`,
                        acquiredCard: c
                    };
                }
            },
            {
                text: '🌊 삼켜진다 (체력 -20, 덱에 레어 카드 추가)',
                effect(gs) {
                    gs.player.hp = Math.max(1, gs.player.hp - 20);
                    const c = gs.getRandomCard('rare');
                    gs.player.deck.push(c);
                    return {
                        resultText: `${CARDS[c]?.name}. 혀가 타는 것 같다. 하지만 손에 카드가 있다. 누군가의 기억을 마신 것이다.`,
                        acquiredCard: c
                    };
                }
            },
            {
                text: '🔮 관찰만 한다 (잔향 +30)',
                effect(gs) {
                    gs.addEcho(30);
                    return '마시지 않았다. 바라보기만 했다. 잔향이 눈을 통해 스며든다. 이쪽이 더 안전한지는 모르겠다.';
                }
            },
        ]
    },
    {
        id: 'lost_memory', layer: 2, title: '잃어버린 기억', eyebrow: 'LAYER 2 · 연속 이벤트',
        desc: '기억의 조각이 허공에 떠 있다. 누구의 것인지 알 수 없다. 하지만 손을 뻗으면 닿는다. 그것이 이미 답인지도 모른다.',
        choices: [
            {
                text: '🧠 남의 기억을 집어삼킨다 (골드 +25, 잔향 +20)',
                effect(gs) {
                    gs.addGold(25);
                    gs.addEcho(20);
                    return '남의 기억이 당신 안으로 들어온다. 낯선데 익숙하다. 이 모순에 이제 놀라지 않는다는 것이 더 이상하다.';
                }
            },
            {
                text: '💭 놓아준다 (체력 +15)',
                effect(gs) {
                    gs.heal(15);
                    return '기억을 보내줬다. 바람이 됐다. 몸이 가벼워진다. 기억을 쥐는 것보다 놓는 것이 때로 더 많은 것을 남긴다.';
                }
            },
        ]
    },
    {
        id: 'void_crack', layer: 2, title: '허공의 균열', eyebrow: 'LAYER 2 · 위험한 이벤트',
        desc: '공간이 찢겨 있다. 균열 너머로 무언가가 있다. 빛인지 어둠인지 판단이 서지 않는다. 당신이 이미 저편에서 이쪽을 보고 있는 것 같기도 하다.',
        choices: [
            {
                text: '🌀 균열이 삼키는 대로 둔다 (체력 -20, 아이템 1개)',
                effect(gs, services = {}) {
                    const picked = pickObtainableItem(gs, { source: 'event' }) || pickRandom(Object.values(ITEMS));
                    if (!picked) {
                        return { resultText: '균열 너머에 닿을 수 있는 것이 없었다. 공허만 남아 있다.', isFail: true };
                    }
                    gs.player.hp = Math.max(1, gs.player.hp - 20);
                    addPlayerItemAndRegisterState(gs, picked.id, picked);
                    notifyItemAcquired(picked, services);
                    return `${picked.name}. 저편에 있었다. 몸이 떨린다. 균열은 통과할 때보다 통과하고 난 뒤가 더 무섭다.`;
                }
            },
            {
                text: '🚶 아직은 아니다',
                effect(gs) {
                    return '돌아섰다. 균열이 천천히 닫혔다. 아니, 당신을 기다리고 있는 것일 수도 있다.';
                }
            },
        ]
    },
    {
        id: 'sealed_reliquary', layer: 2, title: '봉인된 성유물고', eyebrow: 'LAYER 2 · 특수 유물 이벤트',
        isAvailable(gs) {
            return hasAvailableSpecialOfferItem(gs);
        },
        desc: '검은 석관들이 원형으로 배치되어 있다. 봉인마다 다른 심장이 뛴다. 강한 힘이 잠들어 있지만, 꺼내는 순간 대가도 함께 깨어날 것이다.',
        choices: [
            {
                text: '🗝️ 봉인을 연다 (체력 -12, 특수 유물 1개 획득)',
                effect(gs, services = {}) {
                    const relic = pickObtainableItem(gs, {
                        source: 'special_event',
                        specialOfferOnly: true,
                        excludeOwned: true,
                    });
                    if (!relic) {
                        return { resultText: '열 수 있는 특수 유물이 더는 없다. 봉인들은 조용히 식어 있다.', isFail: true };
                    }

                    gs.player.hp = Math.max(1, gs.player.hp - 12);
                    addPlayerItemAndRegisterState(gs, relic.id, relic);
                    notifyItemAcquired(relic, services);

                    return `${relic.name}을(를) 손에 넣었다. 힘은 선명하고, 대가도 분명하다.`;
                }
            },
            {
                text: '📜 봉인식을 기록한다 (골드 +30, 잔향 +35)',
                effect(gs) {
                    gs.addGold(30);
                    gs.addEcho(35);
                    return '유물은 건드리지 않았다. 대신 봉인식을 베껴 적었다. 위험은 줄었고, 통찰은 남았다.';
                }
            },
            {
                text: '🚶 뒤돌아선다',
                effect() {
                    return '석관의 심장 소리를 등지고 걸어 나왔다. 오늘은 생존이 탐욕보다 앞섰다.';
                }
            },
        ]
    },
    {
        id: 'attunement_cache', layer: 2, title: '공명 보관고', eyebrow: 'LAYER 2 · 세트 추적 이벤트',
        isAvailable(gs) {
            return !!pickBestIncompleteSetReward(gs);
        },
        desc: '공명 조각이 정갈하게 쌓인 보관고다. 이미 지닌 유물과 같은 파장을 내는 파편들이 어둠 속에서 당신을 부른다.',
        choices: [
            {
                text: '✨ 공명을 맞춘다 (세트 구성품 1개 획득)',
                effect(gs, services = {}) {
                    const reward = pickBestIncompleteSetReward(gs);
                    if (!reward?.item) {
                        return { resultText: '맞출 수 있는 공명이 없다. 보관고는 끝내 잠잠했다.', isFail: true };
                    }

                    addPlayerItemAndRegisterState(gs, reward.item.id, reward.item);
                    notifyItemAcquired(reward.item, services);
                    return `${reward.setName}의 조각이 손에 붙는다. 이제 ${reward.nextOwnedCount}/${reward.total}. 보관고는 당신이 무엇을 모으는지 정확히 알고 있었다.`;
                }
            },
            {
                text: '💠 잔향만 챙긴다 (잔향 +30)',
                effect(gs) {
                    gs.addEcho?.(30);
                    return '파편은 내려놓고 공명만 챙겼다. 완성은 미뤄졌지만, 다음 선택을 비출 빛은 남았다.';
                }
            },
        ]
    },
    {
        id: 'survivor_cairn', layer: 1, title: '생환자의 케언', eyebrow: 'LAYER 1 · 탐색 이벤트',
        desc: '돌무더기 아래에 누군가의 귀환 기록이 남아 있다. 길을 잃지 않기 위해, 누군가는 마지막 좌표를 여기 숨겨 두었다.',
        choices: [
            {
                text: '🪨 희미한 좌표를 따른다 (체력 10 회복, 다음 층 휴식처 확보)',
                effect(gs) {
                    gs.heal?.(10);
                    const rewritten = rewriteUpcomingNodeType(gs, {
                        toType: 'rest',
                        preferFrom: ['combat', 'event', 'shop'],
                    });
                    if (!rewritten) {
                        return '상처는 조금 아물었지만, 바꿀 수 있는 갈래는 더 남아 있지 않았다.';
                    }
                    return `${formatNodeRef(rewritten.node)}의 길이 ${formatNodeType(rewritten.to)}으로 바뀌었다. 다른 누군가의 귀환 기록이 이번엔 당신을 살린다.`;
                }
            },
            {
                text: '📜 기록만 읽고 지나간다 (골드 +20)',
                effect(gs) {
                    gs.addGold?.(20);
                    return '좌표는 외우지 않았다. 대신 케언 아래 숨겨진 금속 패를 챙겼다. 살아남은 자의 작은 사례비다.';
                }
            },
        ]
    },
    {
        id: 'cartographer', layer: 1, title: '지도 제작자의 잔향', eyebrow: 'LAYER 1 · 탐색 이벤트',
        desc: '낡은 양피지가 허공을 떠돌고 있다. 잔향 에너지를 먹은 선들이 살아 움직인다. 지도가 당신을 따라 변하는 것인지, 당신이 지도를 따라 변한 것인지. 둘 다일 수도 있다.',
        choices: [
            {
                text: '🧩 눈에 새긴다 (20골드 획득, 잔향 +15)',
                effect(gs) {
                    gs.addGold(20);
                    gs.addEcho(15);
                    markWorldMemory(gs, 'cartographerMarked');
                    const rerouted = rewriteUpcomingNodeType(gs, {
                        toType: 'event',
                        preferFrom: ['combat'],
                        fallbackFrom: ['rest', 'shop', 'elite'],
                    });
                    if (!rerouted) {
                        return '선들이 뇌리에 박혔다. 이 길을 걸은 자가 남긴 것인지, 내가 이미 걸었던 것인지. 이번엔 지도가 조용히 접혔다.';
                    }
                    return `선들이 뇌리에 박혔다. ${formatNodeRef(rerouted.node)}의 경로가 ${formatNodeType(rerouted.from)}에서 ${formatNodeType(rerouted.to)}로 다시 그려졌다.`;
                }
            },
            {
                text: '👁️ 지도가 원하는 대로 얽힌다 (골드 15 소모, 잔향 +40)',
                effect(gs) {
                    if (gs.player.gold < 15) {
                        return { resultText: '동기화에 필요한 것이 없다. 지도가 당신을 거부한다. 아직은.', isFail: true };
                    }
                    gs.player.gold -= 15;
                    gs.addEcho(40);
                    markWorldMemory(gs, 'cartographerMarked');
                    const touched = new Set();
                    const dangerShift = rewriteUpcomingNodeType(gs, {
                        toType: 'elite',
                        preferFrom: ['combat', 'event', 'rest', 'shop'],
                        excludeIds: touched,
                    });
                    if (dangerShift?.node?.id) touched.add(dangerShift.node.id);

                    const rewardShift = rewriteUpcomingNodeType(gs, {
                        toType: 'shop',
                        preferFrom: ['combat', 'event', 'rest'],
                        fallbackFrom: ['elite'],
                        excludeIds: touched,
                    });

                    if (dangerShift && rewardShift) {
                        return `지도의 잔향과 당신의 것이 뒤섞인다. ${formatNodeRef(dangerShift.node)}는 ${formatNodeType(dangerShift.to)}로, ${formatNodeRef(rewardShift.node)}는 ${formatNodeType(rewardShift.to)}으로 뒤틀렸다.`;
                    }
                    if (dangerShift) {
                        return `지도의 잔향과 당신의 것이 뒤섞인다. ${formatNodeRef(dangerShift.node)}에서 위험 신호가 증폭되어 ${formatNodeType(dangerShift.to)}가 떠올랐다.`;
                    }
                    if (rewardShift) {
                        return `지도의 잔향과 당신의 것이 뒤섞인다. ${formatNodeRef(rewardShift.node)}에 거래의 잔향이 맺혀 ${formatNodeType(rewardShift.to)}이 열렸다.`;
                    }
                    return '지도의 잔향과 당신의 것이 뒤섞인다. 감각은 또렷했지만 이번엔 경로가 크게 흔들리진 않았다.';
                }
            },
            {
                text: '🚶 못 본 척 지나간다',
                effect() {
                    return '양피지를 접어 시야 밖으로 밀어냈다. 지도는 남았고, 선택만 미뤄졌다.';
                }
            }
        ]
    },
    {
        id: 'lookout', layer: 1, title: '감시자의 망루', eyebrow: 'LAYER 1 · 탐색 이벤트',
        desc: '정체불명의 구조물 꼭대기에 올라섰다. 아래가 보인다. 다음 구역의 잔향 흐름이 한눈에 들어온다. 여기서 오래 있으면 — 내려가고 싶지 않아질 것 같다.',
        choices: [
            {
                text: '🔍 적들이 보이는 대로 기억한다 (잔향 +20)',
                effect(gs) {
                    gs.addEcho(20);
                    markWorldMemory(gs, 'lookoutWatched');
                    const softened = rewriteUpcomingNodeType(gs, {
                        toType: 'combat',
                        preferFrom: ['elite'],
                        fallbackFrom: [],
                    });
                    if (!softened) {
                        return '움직임이 보인다. 패턴이 보인다. 다음 교전의 빈틈만 정확하게 새겨 넣었다.';
                    }
                    return `움직임이 보인다. 패턴이 보인다. ${formatNodeRef(softened.node)}의 위협 징후를 벗겨내 ${formatNodeType(softened.to)}로 낮췄다.`;
                }
            },
            {
                text: '💤 고요에 삼켜진다 (체력 +20)',
                effect(gs) {
                    gs.heal(20);
                    markWorldMemory(gs, 'lookoutWatched');
                    const refuge = rewriteUpcomingNodeType(gs, {
                        toType: 'rest',
                        preferFrom: ['combat', 'event'],
                        fallbackFrom: ['elite', 'shop'],
                    });
                    if (!refuge) {
                        return '망루가 조용하다. 바람만 있다. 몸은 회복됐고, 지형은 그대로 남았다.';
                    }
                    return `망루가 조용하다. 바람이 ${formatNodeRef(refuge.node)}에 머물며 ${formatNodeType(refuge.to)} 하나를 남겼다.`;
                }
            },
            {
                text: '🚶 내려간다',
                effect() {
                    return '난간에서 손을 떼고 계단을 내려왔다. 높이는 사라졌지만 시야는 남아 있었다.';
                }
            }
        ]
    },
    {
        id: 'route_triangulation', layer: 1, title: '항로 삼각측량', eyebrow: 'LAYER 1 · 장기 세계 이벤트',
        isAvailable(gs) {
            const memory = gs?.worldMemory || {};
            return Number(memory.cartographerMarked || 0) > 0
                && Number(memory.lookoutWatched || 0) > 0
                && Number(memory.routeTriangulated || 0) <= 0;
        },
        desc: '지도 제작자의 선과 감시자의 시야가 한 점에서 겹친다. 지금 좌표를 고정하면, 다음 항로는 더 이상 우연으로 남지 않는다.',
        choices: [
            {
                text: '🧭 교차 좌표를 고정한다 (골드 20 소모, 잔향 +35)',
                effect(gs) {
                    if ((gs?.player?.gold || 0) < 20) {
                        return { resultText: '좌표를 붙들 고정추가 부족하다. 항로가 다시 흐려진다.', isFail: true };
                    }
                    gs.player.gold -= 20;
                    gs.addEcho(35);
                    markWorldMemory(gs, 'routeTriangulated');

                    const touched = new Set();
                    const eliteRoute = rewriteUpcomingNodeType(gs, {
                        toType: 'elite',
                        preferFrom: ['combat', 'event', 'rest', 'shop'],
                        excludeIds: touched,
                    });
                    if (eliteRoute?.node?.id) touched.add(eliteRoute.node.id);
                    const shopRoute = rewriteUpcomingNodeType(gs, {
                        toType: 'shop',
                        preferFrom: ['combat', 'event', 'rest'],
                        fallbackFrom: ['elite'],
                        excludeIds: touched,
                    });

                    if (eliteRoute && shopRoute) {
                        return `교차 좌표를 못 박았다. ${formatNodeRef(eliteRoute.node)}는 ${formatNodeType(eliteRoute.to)}로, ${formatNodeRef(shopRoute.node)}는 ${formatNodeType(shopRoute.to)}으로 재정렬됐다.`;
                    }
                    if (eliteRoute) {
                        return `교차 좌표를 못 박았다. ${formatNodeRef(eliteRoute.node)}가 ${formatNodeType(eliteRoute.to)}로 응결했다.`;
                    }
                    if (shopRoute) {
                        return `교차 좌표를 못 박았다. ${formatNodeRef(shopRoute.node)}에 ${formatNodeType(shopRoute.to)}이 열렸다.`;
                    }
                    return '교차 좌표를 고정했지만 이번 층의 항로는 이미 굳어 있었다. 다음 루프가 이 흔적을 기억할 것이다.';
                }
            },
            {
                text: '🚶 좌표를 흘려보낸다',
                effect() {
                    return '정밀한 항로를 손에 넣을 기회였지만, 이번에는 우연을 그대로 두었다.';
                }
            },
        ]
    },
    {
        id: 'surveyors_requiem', layer: 2, title: '측량사의 진혼', eyebrow: 'LAYER 2 · 장기 세계 이벤트',
        isAvailable(gs) {
            const memory = gs?.worldMemory || {};
            return Number(memory.routeTriangulated || 0) > 0
                && Number(memory.killed_silent_tyrant || 0) > 0
                && Number(memory.surveyorsRequiemSeen || 0) <= 0;
        },
        desc: '침묵의 군주가 쓰러진 뒤, 항로 위에 남은 조사품들이 조용히 빛난다. 누군가는 끝까지 기록하려 했고, 그 기록은 이제 당신의 몫이 되었다.',
        choices: [
            {
                text: '📓 조사품을 회수한다',
                effect(gs, services = {}) {
                    markWorldMemory(gs, 'surveyorsRequiemSeen');
                    if (typeof gs?.addGold === 'function') gs.addGold(25);
                    else if (gs?.player) gs.player.gold = (gs.player.gold || 0) + 25;
                    const journal = ITEMS.field_journal;
                    const unlocked = hasRelicUnlockState(gs?.meta, 'field_journal', gs?.player?.class);
                    const obtainable = unlocked && journal && !(gs?.player?.items || []).includes('field_journal');
                    if (obtainable) {
                        addPlayerItemAndRegisterState(gs, journal.id, journal);
                        notifyItemAcquired(journal, services);
                        return '흩어진 조사 기록을 묶어 현장 기록장을 회수했다. 회수품을 정리해 골드도 챙겼고, 빈칸이 메워지며 다음 항로가 또렷해진다.';
                    }
                    return '흩어진 조사 기록을 모두 회수했다. 기록은 이미 손에 있었지만 회수품 정산은 남았다. 측량사의 집념이 세계에 새겨졌다.';
                }
            },
            {
                text: '🕯️ 이름만 남긴 채 떠난다',
                effect(gs) {
                    markWorldMemory(gs, 'surveyorsRequiemSeen');
                    gs.addEcho?.(20);
                    return '남겨진 이름들을 조용히 읽고 자리를 떠났다. 기록은 가져가지 않았지만, 진혼의 잔향은 몸에 남았다.';
                }
            },
        ]
    }
];

export const STORY_FRAGMENTS = [
    {
        id: 1, run: 1, title: '첫 번째 잔향',
        text: '"눈을 뜬다. 검의 무게는 기억하는데, 왜 검을 쥐었는지는 기억나지 않는다. 이 장소가 낯선 것인지, 내가 낯선 것인지."'
    },
    {
        id: 2, run: 2, title: '기억하는 자들',
        text: '"타락한 기사가 나를 알아보았다. \'또 왔군\'. 그는 이미 내 이름을 알고 있었다. 나는 그의 이름을 아직 모른다. 이것이 공평한가."'
    },
    {
        id: 3, run: 3, title: '막으려 했던 것',
        text: '"대침묵 이전, 나는 신들의 전쟁을 막으려 했다. 그 방법이 더 많은 것을 요구했다. 그 많은 것이 무엇이었는지, 아직 다 기억하지 못했다."'
    },
    {
        id: 4, run: 4, title: '속삭이는 잔향',
        text: '"잔향이 속삭인다. 충분히 쌓이면 루프를 끊을 수 있다고. 하지만 끊은 뒤에 무엇이 남는지는 말하지 않는다. 그것이 더 두렵다."'
    },
    {
        id: 5, run: 5, title: '두 가지 선택',
        text: '"상인의 눈빛을 기억한다. 내가 도왔을 때와 빼앗았을 때. 세계는 두 선택 모두를 갖고 있다. 나는 하나만 갖고 있다."'
    },
    {
        id: 6, run: 6, title: '자초한 루프',
        text: '"신의 무덤에서 비문을 읽었다. \'잔향자여, 루프를 만든 것은 너다.\' 알고 있었다. 다만 기억하고 싶지 않았던 것이다."'
    },
    {
        id: 7, run: 7, title: '진실의 대가',
        text: '"에코의 핵심에 닿으면 모든 것이 보인다고 한다. 두렵지 않다. 두려운 것은 — 진실을 보고도 계속 싸우고 싶어질까 하는 것이다."'
    },
    {
        id: 8, run: 8, title: '잊혀진 이름',
        text: '"나는 루프를 시작할 때 누군가를 구하려 했다. 그 이름이 생각나지 않는다. 기억을 이렇게 많이 쌓았는데, 정작 처음의 이유는 없다."'
    },
    {
        id: 9, run: 9, title: '세계의 의지',
        text: '"기억했다. 사람이 아니었다. 세계였다. 그런데 세계는 — 구원받겠다고 한 적이 없다. 구원은 항상 구하는 쪽의 이야기다."'
    },
    {
        id: 10, run: 10, title: '최후의 선택',
        text: '"이제 안다. 루프를 끊는다는 것은 끝이 아닐 수 있다. 하지만 계속한다는 것도 시작이 아닐 수 있다. 선택의 시간이다. 처음이자 마지막으로."'
    }
];
