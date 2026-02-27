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
        desc: '싸울수록 강해지는 검사.',
        traitName: '모멘텀',
        traitTitle: '모멘텀 (Momentum)',
        traitDesc: '전투의 흐름을 타는 기술입니다. 카드를 사용할 때마다 다음 공격의 위력이 상승합니다. (최대 +30 피해 보너스)'
    },
    mage: {
        id: 'mage',
        name: '메아리술사',
        emoji: '🪄',
        style: 'mage',
        desc: '적의 행동을 예측하는 마법사.',
        traitName: '예지',
        traitTitle: '예지 (Prophecy)',
        traitDesc: '미래의 잔향을 읽어냅니다. 현재 선택한 적이 다음 턴에 행할 의도(공격, 방어, 디버프 등)를 미리 파악하여 전략적으로 대응할 수 있습니다.'
    },
    hunter: {
        id: 'hunter',
        name: '침묵사냥꾼',
        emoji: '⚔️',
        style: 'hunter',
        desc: '침묵 게이지를 관리하는 암살자.',
        traitName: '침묵',
        traitTitle: '침묵 (Silence)',
        traitDesc: '적의 움직임을 억제하고 정교한 일격을 가합니다. 침묵 게이지를 활용하여 적의 강력한 패턴을 무력화할 수 있습니다.'
    },
    paladin: {
        id: 'paladin',
        name: '성기사',
        emoji: '⚜️',
        style: 'paladin',
        desc: '생명력을 회복하며 전투하는 기사.',
        traitName: '빛의 가호',
        traitTitle: '빛의 가호 (Divine Grace)',
        traitDesc: '성스러운 신성력이 몸을 감쌉니다. 매 턴 시작 시 일정량의 체력을 지속적으로 회복하여 전투 지속력을 대폭 높여줍니다.'
    },
    berserker: {
        id: 'berserker',
        name: '광전사',
        emoji: '🪓',
        style: 'berserker',
        desc: '낮은 HP에서 더 치명적입니다.',
        traitName: '투지',
        traitTitle: '투지 (Rage)',
        traitDesc: '체력이 낮을수록 폭발적인 힘을 발휘합니다. 현재 잃은 체력에 비례하여 모든 공격의 피해량이 최대 50%까지 증폭됩니다.'
    },
    shielder: {
        id: 'shielder',
        name: '쉴더',
        emoji: '🛡️',
        style: 'shielder',
        desc: '강력한 방어막으로 공격을 막아냅니다.',
        traitName: '영혼 갑주',
        traitTitle: '영혼 갑주 (Soul Armor)',
        traitDesc: '굳건한 정신력이 방어막으로 형상화됩니다. 매 턴 종료 시 방어막이 완전히 사라지지 않고 일부가 유지되어 다음 턴의 생존력을 보장합니다.'
    }
};
