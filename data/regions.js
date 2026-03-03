/**
 * regions.js - 리전 데이터 및 캐릭터별 시작 덱
 */

export const REGIONS = [
    {
        id: 0,
        name: '🌲 잔향의 숲',
        rule: '기본 규칙',
        ruleDesc: '과거의 기억들이 나무 사이로 조용히 흐르는 숲입니다. 특별한 제약 없이 당신의 의지가 이끄는 대로 여정을 시작하십시오.',
        quote: '"기억은 언제나 숲으로 돌아온다."',
        floors: 4,
        enemies: ['slime', 'goblin', 'orc', 'fallen_knight', 'shadow_wolf', 'forest_wraith', 'moss_golem', 'echo_bat', 'verdant_slayer', 'thistle_back'],
        elites: ['elite_dire_wolf', 'elite_ancient_tree', 'elite_moss_monarch'],
        boss: ['ancient_echo', 'forest_guardian'],
    },
    {
        id: 1,
        name: '🏙️ 침묵의 도시',
        rule: '침묵의 저주',
        ruleDesc: "고요함 속에 잠긴 도시에서는 작은 소음조차 치명적입니다. <br><br><span style='color:var(--danger)'>[지역 규칙] 카드 사용 시 소음 게이지가 누적됩니다.</span>",
        quote: '"침묵은 가장 큰 비명이다."',
        floors: 4,
        enemies: ['silent_sentinel', 'noise_wraith', 'iron_automaton', 'rust_stalker', 'brass_guardian', 'silent_shade'],
        elites: ['elite_silence_herald', 'elite_gear_titan', 'elite_echo_judge'],
        boss: ['silent_tyrant', 'clockwork_emperor'],
    },
    {
        id: 2,
        name: '🌀 기억의 미궁',
        rule: '망각의 안개',
        ruleDesc: "망각의 안개가 모든 것을 앗아갑니다. <br><br><span style='color:var(--danger)'>[지역 규칙] 매 턴 시작 시 패에 있는 무작위 카드 1장이 안개 속으로 영구히 소멸(소각)됩니다.</span>",
        quote: '"잊혀진 것들이 이곳에 모인다."',
        floors: 5,
        enemies: ['memory_specter', 'nightmare_hound', 'phantom_soldier', 'memory_thief', 'mirror_shade', 'labyrinth_shade', 'nightmare_specter'],
        elites: ['elite_memory_lich', 'elite_maze_master', 'elite_soul_reaper'],
        boss: ['memory_sovereign', 'memory_weaver'],
    },
    {
        id: 3,
        name: '⚰️ 신의 무덤',
        rule: '신성한 심판',
        ruleDesc: "거룩한 위압감이 영혼을 짓누릅니다. <br><br><span style='color:var(--danger)'>[지역 규칙] 신들의 권능에 눌려 매 턴 회복되는 기본 에너지가 1만큼 감소합니다.</span>",
        quote: '"신들은 죽었으나 영광은 남았다."',
        floors: 5,
        enemies: ['divine_remnant', 'cursed_paladin', 'tomb_guardian', 'holy_specter', 'holy_guardian', 'divine_servant'],
        elites: ['elite_fallen_deity', 'elite_grave_lord', 'elite_judgement_hand'],
        boss: ['divine_tyrant', 'grave_executor'],
    },
    {
        id: 4,
        name: '🌌 잔향의 근원',
        rule: '현실 붕괴',
        ruleDesc: "현실의 경계가 무너져 내리는 종착지입니다. <br><br><span style='color:var(--danger)'>[지역 규칙] 불안정한 현실로 인해 매 턴 종료 시 최대 잔향이 5씩 영구적으로 손실됩니다.</span>",
        quote: '"모든 시작이자 끝인 곳."',
        floors: 3,
        enemies: ['echo_devourer', 'void_remnant', 'void_eye_enemy', 'void_walker', 'reality_shredder', 'void_core_fragment'],
        elites: ['elite_echo_colossus', 'elite_origin_guard', 'elite_void_templar'],
        boss: ['void_herald', 'echo_origin'],
    },
    {
        id: 5,
        name: '⏳ 시간의 황무지',
        rule: '정체',
        ruleDesc: "전투 중 묘지로 간 카드가 전투 후 되돌아오지 않습니다. 소모된 카드는 휴식에서 복구하지 않으면 영구히 사라집니다.",
        quote: '"시간은 같은 전투를 끝없이 반복한다."',
        floors: 7,
        accent: '#ffaa00',
        enemies: ['time_drifter', 'echo_revenant', 'loop_warden', 'temporal_knight'],
        elites: ['loop_warden', 'temporal_knight'],
        miniBoss: ['time_fracture'],
        boss: ['time_sovereign', 'echo_loop'],
    },
    {
        id: 6,
        name: '🌊 심연의 해안',
        rule: '심연 강화',
        ruleDesc: '전투 시작 시 적들이 심연 강화 효과 하나를 무작위로 얻은 채 등장합니다.',
        quote: '"밀물은 모든 확신을 부식시킨다."',
        floors: 7,
        accent: '#0066cc',
        enemies: ['abyss_predator', 'corroded_guardian', 'tide_specter', 'depth_stalker'],
        elites: ['corroded_guardian', 'depth_stalker'],
        miniBoss: ['abyss_queen'],
        boss: ['tidal_herald', 'deep_origin'],
    },
];

export const BASE_REGION_SEQUENCE = [0, 1, 2, 3, 4];

export const BRANCH_ROUTES = {
    after_region_0: [
        { regionId: 1, label: '🏙️ 침묵의 도시', difficulty: '어려움', rewardMod: 1.3 },
        { regionId: 5, label: '⏳ 시간의 황무지', difficulty: '보통', rewardMod: 1.0 },
    ],
    after_region_2: [
        { regionId: 3, label: '⚰️ 신의 무덤', difficulty: '어려움', rewardMod: 1.3 },
        { regionId: 6, label: '🌊 심연의 해안', difficulty: '극한', rewardMod: 1.6 },
    ],
};

export const START_DECKS = {
    swordsman: ['strike', 'strike', 'defend', 'charge', 'echo_strike', 'heavy_blow', 'blade_dance'],
    mage: ['strike', 'strike', 'defend', 'prediction', 'foresight', 'void_mirror', 'time_warp'],
    hunter: ['strike', 'strike', 'defend', 'acceleration', 'tempo_strike', 'quick_step', 'phantom_step'],
    paladin: ['strike', 'defend', 'holy_strike', 'holy_strike', 'divine_grace', 'divine_grace', 'blessing_of_light'],
    berserker: ['strike', 'strike', 'defend', 'blood_fury', 'blood_fury', 'reckless_swing', 'reckless_swing'],
    guardian: ['strike', 'defend', 'defend', 'iron_defense', 'iron_defense', 'shield_slam', 'unbreakable_wall'],
};
