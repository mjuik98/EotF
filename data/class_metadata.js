/**
 * class_metadata.js — 캐릭터 직업별 메타데이터 중앙 관리
 *
 * 캐릭터 선택 화면(index.html)과 인게임 특성 UI(class_mechanics.js)에서
 * 공통으로 사용하는 명칭, 설명, 아이콘 등을 정의합니다.
 */

export const CLASS_METADATA = {
    swordsman: {
        id: 0,
        class: 'swordsman',
        name: '잔향검사',
        title: 'SWORDSMAN',
        emoji: '🗡️',
        style: 'swordsman',
        difficulty: '★★★☆☆',
        color: '#2F8FCB',
        glow: '#8EDCFF',
        accent: '#7CC8FF',
        tags: ['상태이상', '강화', '균형잡힌'],
        stats: { HP: 80, ATK: 75, DEF: 60, ECH: 85, RHY: 65, RES: 40 },
        desc: '검격이 거듭될수록 파동이 짙어지는 검사.',
        playStyle: ['연속 압박형', '강화·상태이상 연계'],
        featuredCardIds: ['twin_strike', 'echo_strike', 'heavy_blow'],
        featuredCardTags: { twin_strike: '연속타', echo_strike: '연계', heavy_blow: '마무리' },
        traitName: '공명',
        traitTitle: '공명 (Resonance)',
        traitDesc: '검의 진동이 겹겹이 쌓이며 공명이 깊어집니다. 카드를 사용할 때마다 피해가 +1씩 중첩됩니다.',
        echoSkill: {
            name: "공명 폭풍", icon: "⚡", desc: "잔향을 해방하여 전장을 공명파로 뒤덮는다.", echoCost: ["잔향 게이지"], tree: [
                { tier: 1, name: "공명 폭풍 Lv.1", bonus: "30", desc: "피해 24. 방어막 10." },
                { tier: 2, name: "공명 폭풍 Lv.2", bonus: "60", desc: "피해 38. 방어막 15." },
                { tier: 3, name: "공명 폭풍 Lv.3", bonus: "100", desc: "모든 적 피해 48. 방어막 22." },
            ]
        },
        startDeck: ["strike", "strike", "defend", "defend", "foot_step", "twin_strike", "echo_strike", "heavy_blow"],
        startRelic: "dull_blade",
        story: "검이 울렸다...\n그 울림은 전장을 가득 채웠다.\n공명은 끝나지 않는다.",
        particle: "ember"
    },
    mage: {
        id: 1,
        class: 'mage',
        name: '메아리술사',
        title: 'MAGE',
        emoji: '🪄',
        style: 'mage',
        difficulty: '★★★★☆',
        color: '#7D3C98',
        glow: '#C39BD3',
        accent: '#BB77FF',
        tags: ['드로우', '비용 감소', '고화력'],
        stats: { HP: 50, ATK: 95, DEF: 30, ECH: 90, RHY: 70, RES: 25 },
        desc: '카드 흐름을 왜곡하는 공명 마법사.',
        playStyle: ['주문 연쇄형', '드로우·비용 감소'],
        featuredCardIds: ['foresight', 'void_mirror', 'time_warp'],
        featuredCardTags: { foresight: '엔진', void_mirror: '반사', time_warp: '지속' },
        traitName: '메아리',
        traitTitle: '메아리 (Echo)',
        traitDesc: '주문이 남긴 메아리가 패에 스며듭니다. 카드를 3번 사용할 때마다 손패의 무작위 카드 1장의 비용이 1 감소합니다.',
        echoSkill: {
            name: "메아리 연쇄", icon: "⚡", desc: "메아리가 시간을 거슬러 카드를 불러온다.", echoCost: ["잔향 게이지"], tree: [
                { tier: 1, name: "메아리 연쇄 Lv.1", bonus: "30", desc: "약화 2턴 부여. 카드 1장 드로우. 잔향 10 충전." },
                { tier: 2, name: "메아리 연쇄 Lv.2", bonus: "60", desc: "모든 적에게 피해 25. 카드 2장 드로우. 잔향 10 충전." },
                { tier: 3, name: "메아리 연쇄 Lv.3", bonus: "100", desc: "모든 적에게 피해 38. 카드 3장 드로우. 잔향 20 충전." },
            ]
        },
        startDeck: ["strike", "strike", "defend", "defend", "foresight", "prediction", "void_mirror", "time_warp"],
        startRelic: "void_shard",
        story: "메아리는 결코 사라지지 않는다...\n카드 한 장 한 장이 울림을 남긴다.\n패가 울리는 순간, 전장이 무너진다.",
        particle: "orb"
    },
    hunter: {
        id: 2,
        class: 'hunter',
        name: '침묵사냥꾼',
        title: 'HUNTER',
        emoji: '⚔️',
        style: 'hunter',
        difficulty: '★★★★★',
        color: '#1A6B3C',
        glow: '#58D68D',
        accent: '#44FF88',
        tags: ['드로우', '상태이상', '균형잡힌'],
        stats: { HP: 65, ATK: 85, DEF: 45, ECH: 60, RHY: 95, RES: 30 },
        desc: '전장의 모든 소음을 지워버리는 암살자.',
        playStyle: ['표적 추적형', '독·회피 템포'],
        featuredCardIds: ['silent_stab', 'poison_blade', 'phantom_step'],
        featuredCardTags: { silent_stab: '개시', poison_blade: '누적', phantom_step: '회피' },
        traitName: '정적',
        traitTitle: '정적 (Dead Silence)',
        traitDesc: '침묵 속에서 표적을 추적합니다. 적을 5번 공격할 때마다 독 3턴 부여하고, 카드를 1장 드로우합니다.',
        echoSkill: {
            name: "잔향 포획", icon: "⚡", desc: "침묵 속에서 잔향이 죽음의 낫이 된다.", echoCost: ["잔향 게이지"], tree: [
                { tier: 1, name: "잔향 포획 Lv.1", bonus: "30", desc: "피해 22. 독 2턴 부여." },
                { tier: 2, name: "잔향 포획 Lv.2", bonus: "60", desc: "피해 32. 은신 1턴 부여." },
                { tier: 3, name: "잔향 포획 Lv.3", bonus: "100", desc: "피해 45. 은신 2턴 부여." },
            ]
        },
        startDeck: ["strike", "strike", "defend", "defend", "silent_stab", "poison_blade", "phantom_step", "silent_strike"],
        startRelic: "blood_shard",
        story: "소리가 죽는 그 순간...\n사냥꾼은 이미 사라진 후였다.\n침묵이 곧 죽음이다.",
        particle: "smoke"
    },
    paladin: {
        id: 3,
        class: 'paladin',
        name: '찬송기사',
        title: 'PALADIN',
        emoji: '✨',
        style: 'paladin',
        difficulty: '★★☆☆☆',
        color: '#9A7D0A',
        glow: '#F9E79F',
        accent: '#FFD700',
        tags: ['상태이상', '강화', '안정적인'],
        stats: { HP: 85, ATK: 65, DEF: 80, ECH: 70, RHY: 55, RES: 95 },
        desc: '치유의 선율로 전선을 지키는 성기사.',
        playStyle: ['회복 반격형', '지속 유지력'],
        featuredCardIds: ['holy_strike', 'divine_grace', 'blessing_of_light'],
        featuredCardTags: { holy_strike: '회복', divine_grace: '방벽', blessing_of_light: '지속' },
        traitName: '성가',
        traitTitle: '성가 (Sacred Hymn)',
        traitDesc: '치유의 선율이 심판의 빛으로 전환됩니다. 체력을 회복할 때마다 회복량만큼 무작위 적 1명에게 피해를 입힙니다.',
        echoSkill: {
            name: "성가 잔향", icon: "⚡", desc: "성가가 전장에 울려 퍼지며 신성한 잔향이 상처를 완전히 치유한다.", echoCost: ["잔향 게이지"], tree: [
                { tier: 1, name: "성가 잔향 Lv.1", bonus: "30", desc: "피해 20. 체력 8 회복." },
                { tier: 2, name: "성가 잔향 Lv.2", bonus: "60", desc: "피해 30. 체력 12 회복." },
                { tier: 3, name: "성가 잔향 Lv.3", bonus: "100", desc: "모든 적에게 피해 38. 체력 20 회복." },
            ]
        },
        startDeck: ["strike", "strike", "defend", "defend", "holy_strike", "divine_grace", "brand_of_light", "blessing_of_light"],
        startRelic: "cracked_amulet",
        story: "신은 그에게 단 한 가지를 가르쳤다...\n치유는 곧 응징이라는 것을.\n빛이 닿는 곳에서 적은 쓰러진다.",
        particle: "holy"
    },
    berserker: {
        id: 4,
        class: 'berserker',
        name: '파음전사',
        title: 'BERSERKER',
        emoji: '🪓',
        style: 'berserker',
        difficulty: '★★★★☆',
        color: '#922B21',
        glow: '#EC7063',
        accent: '#FF4444',
        tags: ['드로우', '강화', '고화력'],
        stats: { HP: 90, ATK: 98, DEF: 40, ECH: 55, RHY: 75, RES: 20 },
        desc: '상처를 힘으로 바꾸는 파열의 투사.',
        playStyle: ['저체력 난전형', '리스크 고화력'],
        featuredCardIds: ['blood_fury', 'reckless_swing', 'berserk_mode'],
        featuredCardTags: { blood_fury: '역전', reckless_swing: '폭딜', berserk_mode: '가속' },
        traitName: '불협화음',
        traitTitle: '불협화음 (Cacophony)',
        traitDesc: '상처가 깊어질수록 파괴적인 힘이 깨어납니다. 잃은 체력에 비례해 공격 피해가 최대 50%까지 증가합니다.',
        echoSkill: {
            name: "파음 해방", icon: "⚡", desc: "한계를 넘어선 파음이 연쇄 폭발한다.", echoCost: ["잔향 게이지"], tree: [
                { tier: 1, name: "파음 해방 Lv.1", bonus: "30", desc: "피해 22. 공격력 +1 (영구). 최대 체력 +2 (영구)." },
                { tier: 2, name: "파음 해방 Lv.2", bonus: "60", desc: "피해 45. 공격력 +2 (영구). 최대 체력 +4 (영구)." },
                { tier: 3, name: "파음 해방 Lv.3", bonus: "100", desc: "모든 적 피해 45. 공격력 +3 (영구). 최대 체력 +6 (영구)." },
            ]
        },
        startDeck: ["strike", "strike", "defend", "defend", "blood_fury", "reckless_swing", "battle_dance", "berserk_mode"],
        startRelic: "travelers_map",
        story: "상처는 그를 죽이지 못했다...\n오히려 더 날카롭게 만들었다.\n고통이 곧 파괴의 선율이다.",
        particle: "ember"
    },
    guardian: {
        id: 5,
        class: 'guardian',
        name: '무음수호자',
        title: 'GUARDIAN',
        emoji: '🛡️',
        style: 'guardian',
        difficulty: '★★☆☆☆',
        color: '#7A2F0F',
        glow: '#FF9A63',
        accent: '#FF7A2F',
        tags: ['상태이상', '강화', '안정적인'],
        stats: { HP: 75, ATK: 50, DEF: 98, ECH: 80, RHY: 45, RES: 70 },
        desc: '무음의 장벽으로 전선을 지키는 수호자.',
        playStyle: ['방벽 반격형', '잔향 유지력'],
        featuredCardIds: ['iron_defense', 'shield_slam', 'unbreakable_wall'],
        featuredCardTags: { iron_defense: '방벽', shield_slam: '반격', unbreakable_wall: '지속' },
        traitName: '잔영 갑주',
        traitTitle: '잔영 갑주 (Echo Armor)',
        traitDesc: '방어의 잔향이 사라지지 않습니다. 턴 종료 시 방어막의 50%가 유지됩니다.',
        echoSkill: {
            name: "잔영 공명", icon: "⚡", desc: "잔영이 공명하며 완벽한 방어가 완성된다.", echoCost: ["잔향 게이지"], tree: [
                { tier: 1, name: "잔영 공명 Lv.1", bonus: "30", desc: "방어막 28." },
                { tier: 2, name: "잔영 공명 Lv.2", bonus: "60", desc: "방어막 38. 모든 적에게 약화 2턴 부여." },
                { tier: 3, name: "잔영 공명 Lv.3", bonus: "100", desc: "방어막 50. 면역 1턴 부여." },
            ]
        },
        startDeck: ["strike", "strike", "defend", "defend", "iron_defense", "shield_slam", "resonant_shield", "unbreakable_wall"],
        startRelic: "rift_talisman",
        story: "소리조차 그를 뚫지 못했다...\n방벽은 무너지지 않는다.\n침묵 속에서 수호자는 영원하다.",
        particle: "smoke"
    }
};

export const CLASS_ID_ORDER = Object.freeze(
    Object.values(CLASS_METADATA)
        .slice()
        .sort((a, b) => Number(a.id) - Number(b.id))
        .map((cls) => cls.class),
);
