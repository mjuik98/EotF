/**
 * events_data.js — 이벤트, 스토리 фраг먼트, 사망 명언
 */
import { CARDS } from './cards.js';
import { ITEMS } from './items.js';
import { AudioEngine } from '../engine/audio.js';

export const EVENTS = [
    {
        id: 'wanderer', layer: 1, title: '방랑자의 흔적', eyebrow: 'LAYER 1 · 우발적 이벤트',
        desc: '낡은 여행 가방 하나가 나뭇가지에 걸려 있다.',
        image: 'event_wanderer.png',
        choices: [
            { text: '🎒 가방을 열어본다', effect(gs) { gs.addGold(20); gs.addLog('골드 +20', 'heal'); return '오래된 동전들이 쏟아졌다.'; } },
            { text: '⚔️ 함정일지도 모른다 (무시)', effect(gs) { gs.addEcho(15); gs.addLog('Echo +15', 'echo'); return '조심성이 잔향을 강화했다.'; } },
        ]
    },
    {
        id: 'echo_shrine', layer: 1, title: '잔향의 제단', eyebrow: 'LAYER 1 · 우발적 이벤트',
        desc: '희미한 빛을 내뿜는 제단이 당신의 기억을 자극한다.',
        image: 'event_echo_shrine.png',
        choices: [
            { text: '✨ 에고를 바친다 (HP -10, Echo +50)', effect(gs) { gs.player.hp = Math.max(1, gs.player.hp - 10); gs.addEcho(50); return '제단이 당신의 기억을 삼키고 힘을 내뿜는다.'; } },
            { text: '🚶 조용히 지나간다', effect(gs) { return '제단은 다시 침묵에 잠겼다.'; } }
        ]
    },
    {
        id: 'shrine', layer: 1, title: '잔향의 사당', eyebrow: 'LAYER 1 · 우발적 이벤트',
        desc: '고대 사당 앞에 잔향 에너지가 모여 있다.',
        image: 'event_shrine.png',
        choices: [
            { text: '❤️ 체력을 제물로 (HP -10 → Echo +50)', effect(gs) { gs.player.hp = Math.max(1, gs.player.hp - 10); gs.addEcho(50); return 'Echo 게이지가 타오른다.'; } },
            {
                text: '💰 골드를 제물로 (15골드 → HP +20)', effect(gs) {
                    if (gs.player.hp >= gs.player.maxHp) return '이미 체력이 가득 차 있습니다.';
                    if (gs.player.gold >= 15) { gs.player.gold -= 15; gs.heal(20); return '신성한 치유의 빛이 감쌌다.'; }
                    return '골드가 부족하다.';
                }
            },
            { text: '🚶 통과한다', effect(gs) { return '사당을 지나쳤다.'; } },
        ]
    },
    {
        id: 'merchant_lost', layer: 2, title: '길 잃은 상인', eyebrow: 'LAYER 2 · 연속 이벤트',
        desc: '잔향 에너지에 길을 잃은 상인을 발견했다. 두려움에 떨고 있다.',
        image: 'event_merchant_lost.png',
        choices: [
            { text: '🤝 상인을 도와준다', effect(gs) { gs.worldMemory.savedMerchant = (gs.worldMemory.savedMerchant || 0) + 1; gs.heal(15); gs.addLog('💚 상인이 치료약을 건넸다', 'heal'); return '상인은 감사하며 치료약을 건넸다.'; } },
            { text: '💰 상인의 물건을 빼앗는다', effect(gs) { gs.addGold(30); gs.worldMemory.stoleFromMerchant = true; gs.addLog('골드 +30 (약탈)', 'damage'); return '30골드를 얻었다. 상인의 눈에서 빛이 사라졌다.'; } },
        ]
    },
    {
        id: 'echo_resonance', layer: 1, title: '잔향 공명', eyebrow: 'LAYER 1 · 우발적 이벤트',
        desc: '공기 중에 강한 에코 에너지가 감지된다.',
        image: 'event_echo_resonance.png',
        choices: [
            { text: '⚡ 에너지를 흡수한다', effect(gs) { gs.addEcho(60); return 'Echo 게이지가 요동쳤다!'; } },
            { text: '🃏 에너지를 카드로 변환', effect(gs) { const c = gs.getRandomCard('rare'); gs.player.deck.push(c); return `에너지가 카드로 응결: ${CARDS[c]?.name}`; } },
        ]
    },
    {
        id: 'forge', layer: 1, title: '잔향의 대장간', eyebrow: 'LAYER 1 · 우발적 이벤트',
        desc: '에코 에너지로 달구어진 대장간이 있다.',
        image: 'event_forge.png',
        choices: [
            {
                text: '⚒️ 카드를 강화한다', effect(gs) {
                    const upgradable = gs.player.deck.filter(id => window.DATA?.upgradeMap?.[id]);
                    if (!upgradable.length) return '강화 가능한 카드가 없습니다.';

                    const target = upgradable[Math.floor(Math.random() * upgradable.length)];
                    const upgraded = window.DATA.upgradeMap[target];
                    const idx = gs.player.deck.indexOf(target);
                    if (idx !== -1) gs.player.deck[idx] = upgraded;

                    const originName = window.DATA.cards[target]?.name || '알 수 없음';
                    const newName = window.DATA.cards[upgraded]?.name || '알 수 없음';
                    return `${originName} → ${newName} 강화!`;
                }
            },
            { text: '🔥 Echo를 충전한다 (Echo +40)', effect(gs) { gs.addEcho(40); return 'Echo가 충전되었다.'; } },
            { text: '🚶 지나친다', effect(gs) { return null; } },
        ]
    },
    {
        id: 'echo_vendor', layer: 1, title: 'Echo 자판기', eyebrow: 'LAYER 1 · 우발적 이벤트',
        desc: '낡은 자판기가 벽에 기대어 있다. "잔향 에너지 교환"이라고 적혀 있다.',
        image: 'event_echo_vendor.png',
        choices: [
            {
                text: '💊 체력 회복 (골드 10 → HP 15)', effect(gs) {
                    if (gs.player.hp >= gs.player.maxHp) return '이미 체력이 가득 차 있습니다.';
                    if (gs.player.gold >= 10) { gs.player.gold -= 10; gs.heal(15); return '체력이 회복됐다.'; }
                    return '골드가 부족하다.';
                }
            },
            { text: '⚡ Echo 구매 (골드 8 → Echo 30)', effect(gs) { if (gs.player.gold >= 8) { gs.player.gold -= 8; gs.addEcho(30); return 'Echo가 충전됐다.'; } return '골드가 부족하다.'; } },
            { text: '🃏 카드 구매 (골드 15 → 랜덤 카드)', effect(gs) { if (gs.player.gold >= 15) { gs.player.gold -= 15; const c = gs.getRandomCard('uncommon'); gs.player.deck.push(c); AudioEngine.playItemGet(); return `${CARDS[c]?.name} 카드를 얻었다.`; } return '골드가 부족하다.'; } },
            { text: '🚶 지나친다', effect() { return null; } },
        ]
    },
    {
        id: 'silent_pool', layer: 1, title: '침묵의 웅덩이', eyebrow: 'LAYER 2 · 신비한 이벤트',
        desc: '잔향 에너지가 고인 웅덩이가 빛나고 있다.',
        image: 'event_silent_pool.png',
        choices: [
            { text: '🌊 웅덩이를 마신다 (HP -5, 덱에 레어 카드)', effect(gs) { gs.player.hp = Math.max(1, gs.player.hp - 5); const c = gs.getRandomCard('rare'); gs.player.deck.push(c); return `${CARDS[c]?.name} 카드를 얻었다. 혀가 타는 듯하다.`; } },
            { text: '🔮 관찰만 한다 (Echo +30)', effect(gs) { gs.addEcho(30); return '잔향 에너지를 흡수했다.'; } },
        ]
    },
    {
        id: 'lost_memory', layer: 2, title: '잃어버린 기억', eyebrow: 'LAYER 2 · 연속 이벤트',
        desc: '흐릿한 기억의 조각이 떠돌고 있다. 집중하면 흡수할 수 있을 것 같다.',
        image: 'event_lost_memory.png',
        choices: [
            { text: '🧠 기억을 흡수한다 (골드 +25, Echo +20)', effect(gs) { gs.addGold(25); gs.addEcho(20); return '기억의 파편이 힘으로 변환됐다.'; } },
            { text: '💭 기억을 방류한다 (HP +15)', effect(gs) { gs.heal(15); return '기억은 바람이 되어 사라졌다. 마음이 가벼워졌다.'; } },
        ]
    },
    {
        id: 'void_crack', layer: 2, title: '허공의 균열', eyebrow: 'LAYER 2 · 위험한 이벤트',
        desc: '공간이 갈라져 있다. 저쪽에는 무언가가 있는 것 같다.',
        image: 'event_void_crack.png',
        choices: [
            { text: '🌀 균열을 통과한다 (HP -20, 아이템 1개)', effect(gs) { gs.player.hp = Math.max(1, gs.player.hp - 20); const itemsList = Object.keys(ITEMS); const item = itemsList[Math.floor(Math.random() * itemsList.length)]; gs.player.items.push(item); AudioEngine.playItemGet(); if (typeof window !== 'undefined' && window.showItemToast) window.showItemToast(ITEMS[item]); return `${ITEMS[item].name}을 얻었다. 몸이 떨린다.`; } },
            { text: '🚶 위험하다, 돌아간다', effect(gs) { return '안전한 길을 선택했다.'; } },
        ]
    }
];

export const STORY_FRAGMENTS = [
    { id: 1, run: 1, title: '첫 번째 잔향', text: '"눈을 뜬다. 검이 익숙하다. 하지만 이 장소는... 처음인 것 같기도, 아닌 것 같기도 하다."' },
    { id: 2, run: 2, title: '기억하는 자들', text: '"타락한 기사가 나를 알아보았다. \'또 왔군\'. 그는 이미 내 이름을 알고 있었다."' },
    { id: 3, run: 3, title: '막으려 했던 것', text: '"대침묵 이전, 나는 신들의 전쟁을 막으려 했다. 그 방법이 — 더 많은 희생을 요구했다."' },
    { id: 4, run: 4, title: '속삭이는 잔향', text: '"잔향 에너지가 속삭인다: 충분한 기억이 쌓이면, 루프를 끊을 수 있다고. 하지만 그게 진정한 끝인가?"' },
    { id: 5, run: 5, title: '두 가지 선택', text: '"상인의 눈빛 — 내가 도왔을 때와 빼앗았을 때. 세계는 두 선택 모두 기억한다."' },
    { id: 6, run: 6, title: '자초한 루프', text: '"신의 무덤에서 발견한 비문: \'잔향자여, 루프를 만든 것은 너다. 대침묵을 막기 위해 시간을 되감은 것은.\'"' },
    { id: 7, run: 7, title: '진실의 대가', text: '"에코의 핵심에 도달하면 모든 것이 보인다고 한다. 하지만 진실을 알게 되면, 계속 싸울 이유가 있는가?"' },
    { id: 8, run: 8, title: '잊혀진 이름', text: '"나는 기억한다 — 처음 루프를 시작할 때, 나는 누군가를 구하려 했다. 그 이름을 아직 기억하지 못한다."' },
    { id: 9, run: 9, title: '세계의 의지', text: '"기억이 돌아왔다. 구하려 했던 것은 사람이 아니었다. 세계 그 자체였다. 하지만 세계는 — 구원받기를 원하는가?"' },
    { id: 10, run: 10, title: '최후의 선택', text: '"충분히 이해했다. 이제 선택의 시간이다. 루프를 계속할 것인가, 아니면 진짜 끝을 받아들일 것인가."' }
];

export const DEATH_QUOTES = [
    '"이 죽음도 기억이 된다."',
    '"다음엔... 다르게 선택하겠다."',
    '"잔향은 사라지지 않는다. 형태가 바뀔 뿐."',
    '"무엇이 옳은가. 아직 알 수 없다."',
    '"세계는 내 선택을 기억한다."',
    '"두려움이 없다. 이미 수백 번 죽었으니."',
    '"다시, 처음부터."'
];
