/**
 * regions.js - region data and class starting decks.
 */

export const REGIONS = [
    {
        id: 0,
        name: 'Echo Forest',
        rule: 'Baseline',
        ruleDesc: 'A calm entry region with no additional penalties.',
        quote: '"Memory always returns in echoes."',
        floors: 4,
        enemies: ['slime', 'goblin', 'orc', 'fallen_knight', 'shadow_wolf', 'forest_wraith', 'moss_golem', 'echo_bat', 'verdant_slayer', 'thistle_back'],
        elites: ['elite_dire_wolf', 'elite_ancient_tree', 'elite_moss_monarch'],
        boss: ['ancient_echo', 'forest_guardian'],
    },
    {
        id: 1,
        name: 'Silent City',
        rule: 'Noise Gauge',
        ruleDesc: "In this region, card plays increase the noise gauge and add pressure each turn.",
        quote: '"Silence can be louder than screams."',
        floors: 4,
        enemies: ['silent_sentinel', 'noise_wraith', 'iron_automaton', 'rust_stalker', 'brass_guardian', 'silent_shade'],
        elites: ['elite_silence_herald', 'elite_gear_titan', 'elite_echo_judge'],
        boss: ['silent_tyrant', 'clockwork_emperor'],
    },
    {
        id: 2,
        name: 'Memory Labyrinth',
        rule: 'Card Erosion',
        ruleDesc: "At turn start, one random card is exhausted from deck/hand/graveyard.",
        quote: '"What is forgotten still leaves a shape."',
        floors: 5,
        enemies: ['memory_specter', 'nightmare_hound', 'phantom_soldier', 'memory_thief', 'mirror_shade', 'labyrinth_shade', 'nightmare_specter'],
        elites: ['elite_memory_lich', 'elite_maze_master', 'elite_soul_reaper'],
        boss: ['memory_sovereign', 'memory_weaver'],
    },
    {
        id: 3,
        name: 'God Tomb',
        rule: 'Energy Tax',
        ruleDesc: "The tomb suppresses vitality. You recover 1 less base energy each turn.",
        quote: '"The dead still enforce judgment."',
        floors: 5,
        enemies: ['divine_remnant', 'cursed_paladin', 'tomb_guardian', 'holy_specter', 'holy_guardian', 'divine_servant'],
        elites: ['elite_fallen_deity', 'elite_grave_lord', 'elite_judgement_hand'],
        boss: ['divine_tyrant', 'grave_executor'],
    },
    {
        id: 4,
        name: 'Echo Origin',
        rule: 'Max Echo Collapse',
        ruleDesc: "At end of each turn, max Echo is permanently reduced by 5 in this region.",
        quote: '"All beginnings return to this source."',
        floors: 3,
        enemies: ['echo_devourer', 'void_remnant', 'void_eye_enemy', 'void_walker', 'reality_shredder', 'void_core_fragment'],
        elites: ['elite_echo_colossus', 'elite_origin_guard', 'elite_void_templar'],
        boss: ['void_herald', 'echo_origin'],
    },
    {
        id: 5,
        name: 'Time Wasteland',
        rule: 'Stagnation',
        ruleDesc: 'Cards sent to graveyard do not return after combat. Exhausted cards are permanently lost unless recovered at rest.',
        quote: '"Time repeats the same battle forever."',
        floors: 7,
        accent: '#ffaa00',
        enemies: ['time_drifter', 'echo_revenant', 'loop_warden', 'temporal_knight'],
        elites: ['loop_warden', 'temporal_knight'],
        miniBoss: ['time_fracture'],
        boss: ['time_sovereign', 'echo_loop'],
    },
    {
        id: 6,
        name: 'Abyss Coast',
        rule: 'Abyss Empowerment',
        ruleDesc: 'Enemies spawn with one random abyss buff at the start of each combat.',
        quote: '"The tide corrodes all certainty."',
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
        { regionId: 1, label: 'Silent City', difficulty: 'Hard', rewardMod: 1.3 },
        { regionId: 5, label: 'Time Wasteland', difficulty: 'Standard', rewardMod: 1.0 },
    ],
    after_region_2: [
        { regionId: 3, label: 'God Tomb', difficulty: 'Hard', rewardMod: 1.3 },
        { regionId: 6, label: 'Abyss Coast', difficulty: 'Extreme', rewardMod: 1.6 },
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
