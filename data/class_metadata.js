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
        color: '#1A6B9A',
        glow: '#5DADE2',
        accent: '#55AAFF',
        tags: ['리듬형', '연속 공격', '입문 추천'],
        stats: { HP: 80, ATK: 75, DEF: 60, ECH: 85, RHY: 65, RES: 70 },
        desc: '검격이 거듭될수록 파동이 짙어지는 검사.',
        traitName: '공명',
        traitTitle: '공명 (Resonance)',
        traitDesc: '검의 진동이 겹겹이 쌓이며 공명이 깊어집니다. 카드를 사용할 때마다 피해가 +1씩 중첩됩니다.',
        skills: [
            {
                name: "공명 (고유 특성)", icon: "🗡️", desc: "카드 사용마다 피해 +1 중첩.", tree: [
                    { tier: 1, name: "공명 Lv.1", bonus: "최대 +10 피해", desc: "검의 진동이 3회 누적될 때마다 터진다." },
                    { tier: 2, name: "공명 Lv.2", bonus: "최대 +20 피해", desc: "진동의 공명이 더 오래, 더 깊게 울린다." },
                    { tier: 3, name: "공명 Lv.3", bonus: "최대 +30 피해", desc: "공명이 극에 달해 검격이 파동을 일으킨다." },
                ]
            },
            {
                name: "칼날 춤", icon: "💫", desc: "연속 2회 공격. 각 타 피해 8.", tree: [
                    { tier: 1, name: "칼날 춤", bonus: "2타 × 8", desc: "빠른 검격 2회 연속 발동." },
                    { tier: 2, name: "칼날 춤+", bonus: "2타 × 11", desc: "타격 사이 공명 스택이 1 추가된다." },
                    { tier: 3, name: "공명 폭쇄", bonus: "2타 + 폭발", desc: "2타 후 공명 스택이 즉시 폭발한다." },
                ]
            },
            {
                name: "잔향 검격", icon: "⚡", desc: "피해 9. 잔향 20 충전.", tree: [
                    { tier: 1, name: "잔향 검격", bonus: "피해 9 + 잔향 20", desc: "검에 잔향을 실어 강타." },
                    { tier: 2, name: "잔향 검격+", bonus: "피해 13 + 잔향 28", desc: "검기의 밀도가 짙어진다." },
                    { tier: 3, name: "공명 검기", bonus: "피해 × 공명 배율", desc: "공명 스택만큼 피해가 급증한다." },
                ]
            },
        ],
        echoSkill: {
            name: "공명 폭풍", icon: "🌊", desc: "쌓인 공명 스택을 해방하여 전장을 공명파로 뒤덮는다.", echoCost: 80, tree: [
                { tier: 1, name: "공명 폭풍 Lv.1", bonus: "공명 스택 × 4 피해", desc: "잔향이 검에서 폭풍으로 바뀐다." },
                { tier: 2, name: "공명 폭풍 Lv.2", bonus: "공명 스택 × 6 + 스택 유지", desc: "공명이 소멸하지 않고 계속 울린다." },
                { tier: 3, name: "절명 공명파", bonus: "공명 스택 × 8 + 기절", desc: "검기의 파동이 적의 혼을 흔들어 기절시킨다." },
            ]
        },
        startDeck: ["strike", "strike", "defend", "charge", "echo_strike", "heavy_blow", "blade_dance"],
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
        tags: ['흐름 왜곡', '카드 비용', '고화력'],
        stats: { HP: 50, ATK: 95, DEF: 30, ECH: 90, RHY: 70, RES: 80 },
        desc: '전장의 리듬을 공명시켜 카드 흐름을 왜곡하는 마법사.',
        traitName: '메아리',
        traitTitle: '메아리 (Echo)',
        traitDesc: '주문이 남긴 메아리가 패에 스며듭니다. 카드를 3번 사용할 때마다 손패의 무작위 카드 1장의 비용이 1 감소합니다.',
        skills: [
            {
                name: "메아리 (고유 특성)", icon: "🪄", desc: "카드 3회 사용 시 무작위 카드 비용 -1.", tree: [
                    { tier: 1, name: "메아리 Lv.1", bonus: "3회마다 비용 -1", desc: "울림이 패에 스며들어 비용을 깎는다." },
                    { tier: 2, name: "메아리 Lv.2", bonus: "2회마다 비용 -1", desc: "메아리가 더 빠르게 패에 공명한다." },
                    { tier: 3, name: "메아리 Lv.3", bonus: "0비용 카드 추가 발동", desc: "비용 0 카드 사용 시 잔향 스킬이 자동 발동." },
                ]
            },
            {
                name: "시간 왜곡", icon: "⏳", desc: "【지속】 매 턴 에너지 +1 획득.", tree: [
                    { tier: 1, name: "시간 왜곡", bonus: "매 턴 에너지 +1", desc: "시간의 흐름을 비틀어 에너지를 창출." },
                    { tier: 2, name: "시간 왜곡+", bonus: "에너지 +1 + 드로우 1", desc: "왜곡이 심화되어 카드도 끌어당긴다." },
                    { tier: 3, name: "시공간 왜곡", bonus: "에너지 +2", desc: "현실 자체가 굴절된다." },
                ]
            },
            {
                name: "공허 거울", icon: "🪞", desc: "방어막 8. 방어막 동안 피해 반사.", tree: [
                    { tier: 1, name: "공허 거울", bonus: "방어막 8 + 반사", desc: "공허의 거울이 공격을 돌려보낸다." },
                    { tier: 2, name: "공허 거울+", bonus: "방어막 12 + 반사", desc: "반사 피해가 증폭된다." },
                    { tier: 3, name: "차원 거울", bonus: "방어막 × 반사 2배", desc: "거울이 차원을 가로질러 반사한다." },
                ]
            },
        ],
        echoSkill: {
            name: "메아리 연쇄", icon: "🔮", desc: "손패의 모든 카드를 0비용으로 만들고 카드 1장 추가 드로우.", echoCost: 90, tree: [
                { tier: 1, name: "메아리 연쇄 Lv.1", bonus: "패 전체 비용 0 (1턴)", desc: "메아리가 모든 패에 동시에 스며든다." },
                { tier: 2, name: "메아리 연쇄 Lv.2", bonus: "패 전체 비용 0 + 드로우 2", desc: "울림이 패를 더 깊이 채운다." },
                { tier: 3, name: "시공 메아리", bonus: "패 비용 0 + 소멸 카드 귀환", desc: "메아리가 시간을 거슬러 카드를 불러온다." },
            ]
        },
        startDeck: ["strike", "strike", "defend", "prediction", "foresight", "void_mirror", "time_warp"],
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
        tags: ['침묵 게이지', '은신', '숙련자용'],
        stats: { HP: 65, ATK: 85, DEF: 45, ECH: 60, RHY: 95, RES: 65 },
        desc: '전장의 모든 소음을 지워버리는 암살자.',
        traitName: '정적',
        traitTitle: '정적 (Dead Silence)',
        traitDesc: '침묵 속에서 표적을 추적합니다. 적을 5번 공격할 때마다 독(3)을 부여하고, 자신은 1턴 은신합니다.',
        skills: [
            {
                name: "정적 (고유 특성)", icon: "🏹", desc: "5번 공격마다 독(3) + 은신 1턴.", tree: [
                    { tier: 1, name: "정적 Lv.1", bonus: "5타마다 독(3) + 은신", desc: "소음을 지우며 독을 심는다." },
                    { tier: 2, name: "정적 Lv.2", bonus: "4타마다 발동", desc: "침묵의 임계치가 낮아진다." },
                    { tier: 3, name: "사신의 정적", bonus: "3타마다 + 처형표식", desc: "3회 공격마다 독 + 처형 표식 부여." },
                ]
            },
            {
                name: "가속", icon: "💨", desc: "【지속】 매 턴 카드 추가 드로우 1.", tree: [
                    { tier: 1, name: "가속", bonus: "매 턴 드로우 +1", desc: "몸이 바람처럼 가볍다." },
                    { tier: 2, name: "가속+", bonus: "드로우 +1 + 에너지 +1", desc: "가속과 에너지가 동시에 흘러넘친다." },
                    { tier: 3, name: "극가속", bonus: "드로우 +2 + 속도 버프", desc: "사냥꾼의 속도가 한계를 넘어선다." },
                ]
            },
            {
                name: "환영 발걸음", icon: "👣", desc: "은신 1. 카드 1장 드로우.", tree: [
                    { tier: 1, name: "환영 발걸음", bonus: "은신 + 드로우 1", desc: "그림자 속으로 사라진다." },
                    { tier: 2, name: "환영 발걸음+", bonus: "은신 + 드로우 2", desc: "더 빠르게, 더 깊은 어둠으로." },
                    { tier: 3, name: "허상 이동", bonus: "은신 + 이동 + 드로우 2", desc: "순간이동과 함께 어둠에 잠기는다." },
                ]
            },
        ],
        echoSkill: {
            name: "잔향 포획", icon: "🎯", desc: "은신 중 발동 시 치명 피해. 독 중첩을 두 배로 만든다.", echoCost: 70, tree: [
                { tier: 1, name: "잔향 포획 Lv.1", bonus: "피해 25 + 독 × 2", desc: "침묵 속에서 사냥감을 완전히 제압한다." },
                { tier: 2, name: "잔향 포획 Lv.2", bonus: "피해 35 + 독 × 2 + 은신", desc: "일격 후 다시 어둠 속으로 사라진다." },
                { tier: 3, name: "사신의 잔향", bonus: "처형표식 + 독 × 3", desc: "잔향이 죽음의 낫이 된다." },
            ]
        },
        startDeck: ["strike", "strike", "defend", "acceleration", "tempo_strike", "quick_step", "phantom_step"],
        startRelic: "travelers_map",
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
        tags: ['치유형', '역공 특성', '파티 핵심'],
        stats: { HP: 85, ATK: 65, DEF: 80, ECH: 70, RHY: 55, RES: 90 },
        desc: '치유의 선율을 부르며 전선을 유지하는 수호자.',
        traitName: '성가',
        traitTitle: '성가 (Sacred Hymn)',
        traitDesc: '치유의 선율이 심판의 빛으로 전환됩니다. 체력을 회복할 때마다 회복량만큼 무작위 적 1명에게 피해를 입힙니다.',
        skills: [
            {
                name: "성가 (고유 특성)", icon: "⚜️", desc: "회복량만큼 무작위 적에게 피해.", tree: [
                    { tier: 1, name: "성가 Lv.1", bonus: "회복 → 피해 1:1", desc: "치유의 빛이 심판으로 바뀐다." },
                    { tier: 2, name: "성가 Lv.2", bonus: "회복 → 피해 1:1.5", desc: "신성한 응징의 힘이 강화된다." },
                    { tier: 3, name: "신성 심판", bonus: "회복 → 피해 1:2", desc: "빛이 강렬해져 심판이 두 배가 된다." },
                ]
            },
            {
                name: "신성 공격", icon: "✝️", desc: "피해 8. 체력 3 회복.", tree: [
                    { tier: 1, name: "신성 공격", bonus: "피해 8 + 회복 3", desc: "빛으로 적을 베고 자신을 치유한다." },
                    { tier: 2, name: "신성 공격+", bonus: "피해 11 + 회복 5", desc: "심판과 자비가 동시에 쏟아진다." },
                    { tier: 3, name: "천벌", bonus: "피해 15 + 광역 회복", desc: "천상의 심판이 전장에 내려앉는다." },
                ]
            },
            {
                name: "신의 은총", icon: "💛", desc: "체력 8 회복. 방어막 5.", tree: [
                    { tier: 1, name: "신의 은총", bonus: "회복 8 + 방어막 5", desc: "신의 손길이 상처를 감싸 안는다." },
                    { tier: 2, name: "신의 은총+", bonus: "회복 12 + 방어막 8", desc: "은총이 더욱 깊고 넓게 퍼진다." },
                    { tier: 3, name: "성스러운 부활", bonus: "완전 회복 + 방어막 15", desc: "죽음의 문턱에서 기적이 일어난다." },
                ]
            },
        ],
        echoSkill: {
            name: "성가 잔향", icon: "✨", desc: "잔향의 빛으로 완전 회복. 회복량의 2배를 적에게 피해.", echoCost: 100, tree: [
                { tier: 1, name: "성가 잔향 Lv.1", bonus: "완전 회복 + 회복량 × 1 피해", desc: "신성한 잔향이 상처를 완전히 치유한다." },
                { tier: 2, name: "성가 잔향 Lv.2", bonus: "완전 회복 + 회복량 × 1.5 피해", desc: "응징의 힘이 더욱 강해진다." },
                { tier: 3, name: "신성 잔향파", bonus: "완전 회복 + 회복량 × 2 + 광역", desc: "성가가 전장에 울려 퍼지며 모든 적을 응징한다." },
            ]
        },
        startDeck: ["strike", "defend", "holy_strike", "holy_strike", "divine_grace", "divine_grace", "blessing_of_light"],
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
        difficulty: '★★★★★',
        color: '#922B21',
        glow: '#EC7063',
        accent: '#FF4444',
        tags: ['고위험', '역전형', '고화력'],
        stats: { HP: 90, ATK: 98, DEF: 40, ECH: 55, RHY: 75, RES: 60 },
        desc: '상처를 입을수록 치명적인 파열음을 내뿜는 투사.',
        traitName: '불협화음',
        traitTitle: '불협화음 (Cacophony)',
        traitDesc: '상처가 깊어질수록 파괴적인 힘이 깨어납니다. 잃은 체력에 비례해 공격 피해가 최대 50%까지 증가합니다.',
        skills: [
            {
                name: "불협화음 (고유 특성)", icon: "🪓", desc: "잃은 HP 비례 피해 최대 +50%.", tree: [
                    { tier: 1, name: "불협화음 Lv.1", bonus: "피해 최대 +25%", desc: "상처에서 분노가 터져 나온다." },
                    { tier: 2, name: "불협화음 Lv.2", bonus: "피해 최대 +40%", desc: "피투성이가 될수록 더 위험해진다." },
                    { tier: 3, name: "파멸의 음률", bonus: "피해 최대 +50%", desc: "죽음 직전, 파음전사는 가장 강하다." },
                ]
            },
            {
                name: "피의 분노", icon: "🩸", desc: "피해 14. 체력 4 소모.", tree: [
                    { tier: 1, name: "피의 분노", bonus: "피해 14 + HP -4", desc: "자신을 대가로 강력한 일격을 날린다." },
                    { tier: 2, name: "피의 분노+", bonus: "피해 20 + HP -3", desc: "고통의 대가가 줄어들면서 위력은 커진다." },
                    { tier: 3, name: "파멸의 분노", bonus: "피해 28 + 연쇄 3", desc: "분노가 연쇄로 폭발한다." },
                ]
            },
            {
                name: "무모한 일격", icon: "💥", desc: "피해 11. 방어막 0으로.", tree: [
                    { tier: 1, name: "무모한 일격", bonus: "피해 11 + 방어막 파괴", desc: "모든 방어를 버리고 전력으로 타격." },
                    { tier: 2, name: "무모한 일격+", bonus: "피해 16 + 방어막 파괴", desc: "더 크고 무거운 일격이 작렬한다." },
                    { tier: 3, name: "파음 폭발", bonus: "피해 × (1 + 잃은HP%)", desc: "불협화음과 결합하여 임계 피해 발생." },
                ]
            },
        ],
        echoSkill: {
            name: "파음 해방", icon: "💢", desc: "잃은 HP만큼 피해. 이후 방어막 20 획득.", echoCost: 75, tree: [
                { tier: 1, name: "파음 해방 Lv.1", bonus: "잃은 HP × 1 피해", desc: "고통을 무기로, 파음이 폭발한다." },
                { tier: 2, name: "파음 해방 Lv.2", bonus: "잃은 HP × 1.5 + 방어막 20", desc: "파괴 후 강인함이 찾아온다." },
                { tier: 3, name: "절규 파음파", bonus: "잃은 HP × 2 + 연쇄 2", desc: "한계를 넘어선 파음이 연쇄 폭발한다." },
            ]
        },
        startDeck: ["strike", "strike", "defend", "blood_fury", "blood_fury", "reckless_swing", "reckless_swing"],
        startRelic: "blood_shard",
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
        color: '#1F3A52',
        glow: '#85C1E9',
        accent: '#6BB8E8',
        tags: ['방어형', '잔영 갑주', '지속전'],
        stats: { HP: 75, ATK: 50, DEF: 98, ECH: 80, RHY: 45, RES: 85 },
        desc: '소리 없는 파동의 장벽으로 모든 공격을 흡수합니다.',
        traitName: '잔영 갑주',
        traitTitle: '잔영 갑주 (Echo Armor)',
        traitDesc: '방어의 잔향이 사라지지 않습니다. 턴 종료 시 방어막의 50%가 유지됩니다.',
        skills: [
            {
                name: "잔영 갑주 (고유 특성)", icon: "🛡️", desc: "턴 종료 시 방어막 50% 유지.", tree: [
                    { tier: 1, name: "잔영 갑주 Lv.1", bonus: "방어막 50% 유지", desc: "방어막의 절반이 메아리처럼 남는다." },
                    { tier: 2, name: "잔영 갑주 Lv.2", bonus: "방어막 65% 유지", desc: "잔영이 더 짙게 스며든다." },
                    { tier: 3, name: "영구 갑주", bonus: "방어막 80% + 피해 반사", desc: "방어막이 영구적 방어막으로 진화한다." },
                ]
            },
            {
                name: "철벽 방어", icon: "⛏️", desc: "방어막 15. 다음 턴 지속.", tree: [
                    { tier: 1, name: "철벽 방어", bonus: "방어막 15", desc: "단단한 철벽이 몸을 감싼다." },
                    { tier: 2, name: "철벽 방어+", bonus: "방어막 21", desc: "방어막의 밀도가 더욱 높아진다." },
                    { tier: 3, name: "철옹성", bonus: "방어막 30 + 반격", desc: "난공불락. 방어막이 반격을 유발한다." },
                ]
            },
            {
                name: "방패 강타", icon: "🔰", desc: "피해 8. 방어막 8.", tree: [
                    { tier: 1, name: "방패 강타", bonus: "피해 8 + 방어막 8", desc: "방표 공격과 방어를 동시에." },
                    { tier: 2, name: "방패 강타+", bonus: "피해 11 + 방어막 11", desc: "방패의 밀도와 강도가 올라간다." },
                    { tier: 3, name: "공진 강타", bonus: "방어막 × 피해", desc: "방어막이 높을수록 타격이 강해진다." },
                ]
            },
        ],
        echoSkill: {
            name: "잔영 공명", icon: "🔵", desc: "현재 방어막을 3배로 강화하고 1턴 동안 무적 상태가 된다.", echoCost: 85, tree: [
                { tier: 1, name: "잔영 공명 Lv.1", bonus: "방어막 × 2 + 피해 반사", desc: "잔영이 공명하며 방어막을 두텁게 만든다." },
                { tier: 2, name: "잔영 공명 Lv.2", bonus: "방어막 × 3 + 무적 1턴", desc: "완벽한 방어 속에 공명이 완성된다." },
                { tier: 3, name: "영원한 잔영", bonus: "방어막 × 3 + 무적 + 반격", desc: "잔영이 영구적으로 전장을 뒤덮는다." },
            ]
        },
        startDeck: ["strike", "defend", "defend", "iron_defense", "iron_defense", "shield_slam", "unbreakable_wall"],
        startRelic: "rift_talisman",
        story: "소리조차 그를 뚫지 못했다...\n방벽은 무너지지 않는다.\n침묵 속에서 수호자는 영원히 선다.",
        particle: "smoke"
    }
};
