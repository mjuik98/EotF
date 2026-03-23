export const INSCRIPTIONS = {
    echo_boost: {
        id: 'echo_boost',
        name: '잔향 증폭',
        icon: '✨',
        desc: '다음 런 시작 시 잔향 자원을 추가로 가지고 시작합니다.',
        maxLevel: 3,
        levels: [
            { desc: '시작 시 잔향 +30', apply: gs => { gs.player.echo = Math.min(gs.player.maxEcho, gs.player.echo + 30); } },
            { desc: '시작 시 잔향 +60', apply: gs => { gs.player.echo = Math.min(gs.player.maxEcho, gs.player.echo + 60); } },
            { desc: '시작 시 잔향 +100', apply: gs => { gs.player.echo = Math.min(gs.player.maxEcho, gs.player.echo + 100); } },
        ]
    },
    resilience: {
        id: 'resilience',
        name: '회복력',
        icon: '❤️‍🔥',
        desc: '다음 런 시작 시 최대 체력을 추가로 제공합니다.',
        maxLevel: 3,
        levels: [
            { desc: '시작 최대 체력 +10', apply: gs => { gs.player.maxHp += 10; gs.player.hp = Math.min(gs.player.maxHp, gs.player.hp + 10); } },
            { desc: '시작 최대 체력 +20', apply: gs => { gs.player.maxHp += 20; gs.player.hp = Math.min(gs.player.maxHp, gs.player.hp + 20); } },
            { desc: '시작 최대 체력 +35', apply: gs => { gs.player.maxHp += 35; gs.player.hp = Math.min(gs.player.maxHp, gs.player.hp + 35); } },
        ]
    },
    fortune: {
        id: 'fortune',
        name: '행운',
        icon: '🍀',
        desc: '다음 런 시작 시 골드를 추가로 제공합니다.',
        maxLevel: 3,
        levels: [
            { desc: '시작 골드 +20', apply: gs => { gs.player.gold += 20; } },
            { desc: '시작 골드 +40', apply: gs => { gs.player.gold += 40; } },
            { desc: '시작 골드 +70', apply: gs => { gs.player.gold += 70; } },
        ]
    },
    echo_memory: {
        id: 'echo_memory',
        name: '잔향의 기억',
        icon: '💠',
        desc: '잊혀진 기억 속에서 메아리를 끌어냅니다.',
        maxLevel: 1,
        isHidden: true, // 도감에서 기본적으로 보이지 않음 (스토리 해금 전까지)
        levels: [
            {
                desc: '초기 덱의 모든 카드가 강화된 상태로 시작 (스토리 조각 5개 수집 시 해금)', apply: gs => {
                    // 실제 로직은 run_rules 나 deck 생성 시 처리
                    gs.player._startWithUpgradedDeck = true;
                }
            }
        ]
    },
    void_heritage: {
        id: 'void_heritage',
        name: '공허의 유산',
        icon: '🌌',
        desc: '공허에서 비롯된 궁극적인 힘입니다.',
        maxLevel: 1,
        isHidden: true,
        levels: [
            {
                desc: '모든 카드의 비용이 1 감소합니다 (최소 0). (히든 엔딩 달성 시 해금)', apply: gs => {
                    gs.player.costDiscount = (gs.player.costDiscount || 0) + 1;
                }
            }
        ]
    }
};

export const INSCRIPTION_SYNERGIES = {
    'echo_boost+fortune': {
        id: 'echo_boost+fortune',
        name: '잔향 상인',
        icon: '💎',
        desc: '카드 사용 시마다 1골드 획득',
        trigger: 'card_played',
        effect: (gs, args) => { gs.player.gold += 1; },
    },
    'resilience+fortune': {
        id: 'resilience+fortune',
        name: '강인한 의지',
        icon: '🛡️',
        desc: '매 턴 방어막 3 획득',
        trigger: 'turn_start',
        effect: (gs, args) => { gs.player.shield += 3; },
    },
    'echo_boost+resilience+fortune': {
        id: 'echo_boost+resilience+fortune',
        name: '전승의 각인',
        icon: '✦',
        desc: '모든 적 피해 -5%, 체인 보너스 추가 증가',
        trigger: 'passive',
        effect: gs => {
            // 전투 시작 시 등에 적용하거나, reducer 레벨에서 체크
            gs.player._transcendence = true;
        }
    }
};
