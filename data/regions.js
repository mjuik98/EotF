/**
 * regions.js — 리전 데이터 및 캐릭터별 시작 덱
 */

export const REGIONS = [
    {
        id: 0, name: '잔향의 숲', rule: '기본 규칙', ruleDesc: '잔향의 힘이 깨어나는 곳', quote: '"기억은 언제나 숲으로 돌아온다."', floors: 4,
        enemies: ['shadow_wolf', 'forest_wraith', 'moss_golem', 'echo_bat', 'verdant_slayer', 'thistle_back'],
        elites: ['elite_dire_wolf', 'elite_ancient_tree', 'elite_moss_monarch'],
        boss: ['ancient_echo', 'forest_guardian']
    },
    {
        id: 1, name: '침묵의 도시', rule: '침묵의 저주', ruleDesc: '소음 게이지가 더 빨리 상승합니다.', quote: '"침묵은 가장 큰 비명이다."', floors: 4,
        enemies: ['silent_sentinel', 'noise_wraith', 'iron_automaton', 'rust_stalker', 'brass_guardian', 'silent_shade'],
        elites: ['elite_silence_herald', 'elite_gear_titan', 'elite_echo_judge'],
        boss: ['silent_tyrant', 'clockwork_emperor']
    },
    {
        id: 2, name: '기억의 미궁', rule: '망각의 안개', ruleDesc: '매 턴 무작위 카드 1장이 소각됩니다.', quote: '"잊혀진 것들이 이곳에 모인다."', floors: 5,
        enemies: ['memory_specter', 'nightmare_hound', 'phantom_soldier', 'memory_thief', 'mirror_shade', 'labyrinth_shade'],
        elites: ['elite_memory_lich', 'elite_maze_master', 'elite_soul_reaper'],
        boss: ['memory_sovereign', 'memory_weaver']
    },
    {
        id: 3, name: '신의 무덤', rule: '신성한 심판', ruleDesc: '에너지 회복량이 1 감소합니다.', quote: '"신들은 죽었으나 영광은 남았다."', floors: 5,
        enemies: ['divine_remnant', 'cursed_paladin', 'tomb_guardian', 'holy_specter', 'holy_guardian', 'divine_servant'],
        elites: ['elite_fallen_deity', 'elite_grave_lord', 'elite_judgement_hand'],
        boss: ['divine_tyrant', 'grave_executor']
    },
    {
        id: 4, name: '메아리의 근원', rule: '현실 붕괴', ruleDesc: '매 턴 최대 에코가 5씩 감소합니다.', quote: '"모든 시작이자 끝인 곳."', floors: 3,
        enemies: ['echo_devourer', 'void_remnant', 'void_eye_enemy', 'void_walker', 'reality_shredder', 'void_core_fragment'],
        elites: ['elite_echo_colossus', 'elite_origin_guard', 'elite_void_templar'],
        boss: ['void_herald', 'echo_origin']
    }
];

export const START_DECKS = {
    swordsman: ['strike', 'strike', 'defend', 'charge', 'echo_strike', 'heavy_blow', 'blade_dance'],
    mage: ['strike', 'strike', 'defend', 'prediction', 'foresight', 'void_mirror', 'time_warp'],
    hunter: ['strike', 'strike', 'defend', 'momentum', 'tempo_strike', 'quick_step', 'phantom_step'],
    paladin: ['strike', 'defend', 'holy_strike', 'holy_strike', 'divine_grace', 'divine_grace', 'blessing_of_light'],
    berserker: ['strike', 'strike', 'defend', 'blood_fury', 'blood_fury', 'reckless_swing', 'reckless_swing'],
    shielder: ['strike', 'defend', 'defend', 'iron_defense', 'iron_defense', 'shield_slam', 'unbreakable_wall'],
};
