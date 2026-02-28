/**
 * class_metadata.js — 캐릭터 직업별 메타데이터 중앙 관리
 *
 * 캐릭터 선택 화면(index.html)과 인게임 특성 UI(class_mechanics.js)에서
 * 공통으로 사용하는 명칭, 설명, 아이콘 등을 정의합니다.
 */

export const CLASS_METADATA = {
    swordsman: {
        id: 'swordsman',
        name: '잔향검사',
        emoji: '🗡️',
        style: 'swordsman',
        desc: '검격이 거듭될수록 파동이 짙어지는 검사.',
        traitName: '공명',
        traitTitle: '공명 (Resonance)',
        traitDesc: '전투의 리듬을 지배합니다. 카드를 사용할 때마다 검의 진동이 중첩되어 다음 공격의 위력이 점진적으로 상승합니다. (최대 +30 피해)'
    },
    mage: {
        id: 'mage',
        name: '메아리술사',
        emoji: '🪄',
        style: 'mage',
        desc: '전장의 리듬을 공명시켜 카드 흐름을 왜곡하는 마법사.',
        traitName: '메아리 공명',
        traitTitle: '메아리 공명 (Echo Resonance)',
        traitDesc: '카드를 3번 사용할 때마다 손패의 무작위 카드 1장의 비용이 1 감소합니다.'
    },
    hunter: {
        id: 'hunter',
        name: '침묵사냥꾼',
        emoji: '🏹',
        style: 'hunter',
        desc: '전장의 모든 소음을 지워버리는 암살자.',
        traitName: '정적',
        traitTitle: '정적 (Dead Silence)',
        traitDesc: '적의 숨소리마저 억제합니다. 침묵 게이지를 전략적으로 활용하여 적의 치명적인 패턴을 사전에 차단하고 봉쇄할 수 있습니다.'
    },
    paladin: {
        id: 'paladin',
        name: '찬송기사',
        emoji: '⚜️',
        style: 'paladin',
        desc: '치유의 선율을 부르며 전선을 유지하는 수호자.',
        traitName: '성가',
        traitTitle: '성가 (Sacred Hymn)',
        traitDesc: '자신을 치유할 기회를 심판의 시간으로 바꿉니다. 체력을 회복할 때마다 회복량만큼 무작위 적 하나에게 피해를 입혀 응징합니다.',
    },
    berserker: {
        id: 'berserker',
        name: '파음전사',
        emoji: '🪓',
        style: 'berserker',
        desc: '상처를 입을수록 치명적인 파열음을 내뿜는 투사.',
        traitName: '불협화음',
        traitTitle: '불협화음 (Cacophony)',
        traitDesc: '고통이 곧 파괴적인 소음이 됩니다. 현재 잃은 체력에 비례하여 적의 고막과 정신을 찢는 공격의 피해량이 최대 50%까지 증폭됩니다.'
    },
    shielder: {
        id: 'shielder',
        name: '무음수호자',
        emoji: '🛡️',
        style: 'shielder',
        desc: '소리 없는 파동의 장벽으로 모든 공격을 흡수합니다.',
        traitName: '잔영 갑주',
        traitTitle: '잔영 갑주 (Echo Armor)',
        traitDesc: '방어의 개념을 초월합니다. 턴이 종료되어도 방어도가 메아리처럼 남아 전부 소멸하지 않고 다음 턴의 생존을 굳건히 보장합니다.'
    }
};
