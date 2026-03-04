/**
 * events_data.js — 이벤트, 스토리 프래그먼트, 사망 명언
 */
import { LogUtils } from '../game/utils/log_utils.js';
import { CARDS } from './cards.js';
import { ITEMS } from './items.js';
import { AudioEngine } from '../engine/audio.js';

const MAP_NODE_TYPE_LABELS = {
    combat: '전투',
    elite: '정예 전투',
    event: '이벤트',
    shop: '상점',
    rest: '휴식처',
    mini_boss: '미니 보스',
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
        return true;
    });
    return pickRandom(pool) || null;
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
    {
        id: 'shrine', layer: 1, title: '잔향의 사당', eyebrow: 'LAYER 1 · 우발적 이벤트',
        desc: '사당 앞에 잔향이 고여 있다. 오래된 것들이 기도하다 흘린 에너지가 이곳에 남아 있다. 신은 없다. 잔향만 있다.',
        choices: [
            {
                text: '❤️ 피를 바친다 (체력 -10 → 잔향 +50)',
                effect(gs) {
                    gs.player.hp = Math.max(1, gs.player.hp - 10);
                    gs.addEcho(50);
                    return '피가 제단석에 닿는 순간, 잔향이 타오른다. 몸이 더 가벼워진 건지 가벼워진 척하는 건지.';
                }
            },
            {
                text: '💰 동전을 떨어뜨린다 (15골드 → 체력 +20)',
                effect(gs) {
                    if (gs.player.hp >= gs.player.maxHp) return '상처가 없다. 신도 쓸모없는 것은 받지 않는다.';
                    if (gs.player.gold >= 15) {
                        gs.player.gold -= 15;
                        gs.heal(20);
                        return '동전이 빛으로 변했다. 치유가 스며든다. 돈으로 살 수 있는 것들이 있다는 사실이 위안이 되기도, 불편하기도 하다.';
                    }
                    return '기억이 얕다. 사당은 빈 손을 원하지 않는다.';
                }
            },
            {
                text: '🚶 등을 보인다',
                effect(gs) {
                    return '사당을 등졌다. 뒤에서 무언가 보는 느낌이 있었지만, 돌아보지 않았다.';
                }
            },
        ]
    },
    {
        id: 'merchant_lost', layer: 2, title: '길 잃은 상인', eyebrow: 'LAYER 2 · 연속 이벤트',
        desc: '상인이 주저앉아 있다. 잔향 에너지에 방향을 잃었다. 눈이 흐리다. 당신을 보자 입술이 떨렸다 — 두려움인지, 안도인지.',
        choices: [
            {
                text: '🤝 손을 내민다',
                effect(gs) {
                    gs.worldMemory.savedMerchant = (gs.worldMemory.savedMerchant || 0) + 1;
                    gs.heal(15);
                    gs.addLog(LogUtils.formatHeal('상인', 15), 'heal');
                    return '상인은 치료약을 내밀었다. 말은 없었다. 이 표정을 어디선가 본 것 같다 — 당신이 구해준 것이 이번이 처음이 아닌 것처럼.';
                }
            },
            {
                text: '💰 빼앗는다',
                effect(gs) {
                    gs.addGold(30);
                    gs.worldMemory.stoleFromMerchant = true;
                    gs.addLog(LogUtils.formatStatChange('약탈', '골드', 30), 'damage');
                    return '동전 서른 닢. 상인은 저항하지 않았다. 세계는 이 선택을 기억한다. 당신도 기억하게 될 것이다.';
                }
            },
        ]
    },
    {
        id: 'echo_resonance', layer: 1, title: '잔향 공명', eyebrow: 'LAYER 1 · 우발적 이벤트',
        desc: '공기가 진동한다. 누군가 이 길을 걸었다 — 아마 당신 자신이. 에너지는 발걸음을 기억하고, 기억은 에너지가 된다.',
        choices: [
            {
                text: '⚡ 흡수당한다',
                effect(gs) {
                    gs.addEcho(60);
                    return '잔향이 흉곽을 가득 채운다. 다른 루프의 기억들이 잠깐 스쳐 지나갔다. 보이지 않아서 다행이다.';
                }
            },
            {
                text: '🃏 에너지가 카드를 원한다',
                effect(gs) {
                    const c = gs.getRandomCard('rare');
                    gs.player.deck.push(c);
                    return `에너지가 응결한다. 기억이 기술이 된다 — ${CARDS[c]?.name}. 배운 적 없는데 손이 먼저 안다.`;
                }
            },
        ]
    },
    {
        id: 'forge', layer: 1, title: '잔향의 대장간', eyebrow: 'LAYER 1 · 우발적 이벤트',
        desc: '대장간은 아무도 없는데 불이 켜져 있다. 잔향 에너지로 달구어진 화로가 무언가를 기다린다. 아니면 — 당신을 기억하고 있다.',
        choices: [
            {
                text: '⚒️ 화로가 원하는 것을 준다',
                effect(gs) {
                    const upgradable = gs.player.deck.filter(id => window.DATA?.upgradeMap?.[id]);
                    if (!upgradable.length) return '화로가 식는다. 더 나아질 것이 없다는 뜻인지, 아직 때가 아니라는 뜻인지.';

                    const target = upgradable[Math.floor(Math.random() * upgradable.length)];
                    const upgraded = window.DATA.upgradeMap[target];
                    const idx = gs.player.deck.indexOf(target);
                    if (idx !== -1) gs.player.deck[idx] = upgraded;

                    const originName = window.DATA.cards[target]?.name || '알 수 없음';
                    const newName = window.DATA.cards[upgraded]?.name || '알 수 없음';
                    return `${originName}이 불 속에서 다시 태어났다. ${newName}. 같은 카드가 아니다.`;
                }
            },
            {
                text: '🔥 흡수당한다',
                effect(gs) {
                    gs.addEcho(40);
                    return '화로 앞에 서자 잔향이 스며든다. 뜨겁지 않다. 익숙한 온도다.';
                }
            },
            {
                text: '🚶 보지 않은 척 지나간다',
                effect(gs) {
                    return '화로를 지나치며 장갑끈만 고쳐 맸다. 오늘은 강철보다 침묵을 택했다.';
                }
            },
        ]
    },
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
                    return '대가가 부족하다. 저울은 요지부동이다.';
                }
            },
            {
                text: '📜 지식의 등가교환 (골드 15 → 랜덤 카드 추가)',
                effect(gs) {
                    if (gs.player.gold >= 15) {
                        gs.player.gold -= 15;
                        const c = gs.getRandomCard();
                        gs.player.deck.push(c);
                        AudioEngine.playItemGet();
                        return `금화 한 자루가 사라지고, 대신 빛바랜 ${CARDS[c]?.name} 카드가 나타났다. 공정한 거래였다.`;
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
                text: '🍵 들이킨다 (HP -10, 덱에 비범 카드 추가)',
                effect(gs) {
                    gs.player.hp = Math.max(1, gs.player.hp - 10);
                    const c = gs.getRandomCard('uncommon');
                    gs.player.deck.push(c);
                    return `목구멍이 서늘하다. 온전한 기억이 아닌, 파편화된 기술이 뇌리에 박힌다. ${CARDS[c]?.name}을(를) 배웠다.`;
                }
            },
            {
                text: '🌊 삼켜진다 (HP -20, 덱에 레어 카드 추가)',
                effect(gs) {
                    gs.player.hp = Math.max(1, gs.player.hp - 20);
                    const c = gs.getRandomCard('rare');
                    gs.player.deck.push(c);
                    return `${CARDS[c]?.name}. 혀가 타는 것 같다. 하지만 손에 카드가 있다. 누군가의 기억을 마신 것이다.`;
                }
            },
            {
                text: '🔮 관찰만 한다 (Echo +30)',
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
                effect(gs) {
                    const picked = pickObtainableItem(gs, { source: 'event' }) || pickRandom(Object.values(ITEMS));
                    if (!picked) return '균열 너머에 닿을 수 있는 것이 없었다. 공허만 남아 있다.';
                    gs.player.hp = Math.max(1, gs.player.hp - 20);
                    gs.player.items.push(picked.id);
                    gs.meta?.codex?.items?.add?.(picked.id);
                    AudioEngine.playItemGet();
                    if (typeof window !== 'undefined' && window.showItemToast) window.showItemToast(picked);
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
        desc: '검은 석관들이 원형으로 배치되어 있다. 봉인마다 다른 심장이 뛴다. 강한 힘이 잠들어 있지만, 꺼내는 순간 대가도 함께 깨어날 것이다.',
        choices: [
            {
                text: '🗝️ 봉인을 연다 (체력 -12, 특수 유물 1개 획득)',
                effect(gs) {
                    const relic = pickObtainableItem(gs, {
                        source: 'special_event',
                        specialOfferOnly: true,
                        excludeOwned: true,
                    });
                    if (!relic) return '열 수 있는 특수 유물이 더는 없다. 봉인들은 조용히 식어 있다.';

                    gs.player.hp = Math.max(1, gs.player.hp - 12);
                    gs.player.items.push(relic.id);
                    gs.meta?.codex?.items?.add?.(relic.id);
                    AudioEngine.playItemGet();
                    if (typeof window !== 'undefined' && window.showItemToast) window.showItemToast(relic);

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
        id: 'cartographer', layer: 1, title: '지도 제작자의 잔향', eyebrow: 'LAYER 1 · 탐색 이벤트',
        desc: '낡은 양피지가 허공을 떠돌고 있다. 잔향 에너지를 먹은 선들이 살아 움직인다. 지도가 당신을 따라 변하는 것인지, 당신이 지도를 따라 변한 것인지. 둘 다일 수도 있다.',
        choices: [
            {
                text: '🧩 눈에 새긴다 (20골드 획득, 잔향 +15)',
                effect(gs) {
                    gs.addGold(20);
                    gs.addEcho(15);
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
                    if (gs.player.gold < 15) return '동기화에 필요한 것이 없다. 지도가 당신을 거부한다. 아직은.';
                    gs.player.gold -= 15;
                    gs.addEcho(40);
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
                text: '💤 고요에 삼켜진다 (HP +20)',
                effect(gs) {
                    gs.heal(20);
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

export const DEATH_QUOTES = [
    '"죽음도 잔향을 남긴다. 특히 억울한 것은."',
    '"처음이 아니다. 그것이 위안인지 저주인지, 이번엔 판단이 서지 않는다."',
    '"다르게 선택할 수 있었다. 그 생각이 다음 루프까지 간다."',
    '"잔향은 사라지지 않는다. 형태가 바뀔 뿐이다. 나처럼."',
    '"세계는 이 죽음을 기억한다. 나는 잊고 싶었는데."',
    '"두려움이 없다. 이미 수백 번 죽었으니. 그게 두렵다."',
    '"아직 기억하지 못한 이름이 있다. 죽기 전에 찾고 싶었다."',
    '"다시. 처음이 아닌 처음부터."',
];
