'use strict';

// ═══════════════════════════════════════════════
//  Trigger 상수 — 아이템 passive 이벤트 이름 관리
//  오타 버그를 방지하고, IDE 자동완성을 지원합니다.
// ═══════════════════════════════════════════════

export const Trigger = Object.freeze({
    COMBAT_START: 'combat_start',
    COMBAT_END: 'combat_end',
    TURN_START: 'turn_start',
    TURN_END: 'turn_end',

    CARD_PLAY: 'card_play',
    CARD_DRAW: 'card_draw',
    CARD_DISCARD: 'card_discard',
    CARD_EXHAUST: 'card_exhaust',

    DEAL_DAMAGE: 'deal_damage',
    DAMAGE_TAKEN: 'damage_taken',
    ENEMY_KILL: 'enemy_kill',

    BOSS_START: 'boss_start',

    ECHO_SKILL: 'echo_skill',
    CHAIN_DMG: 'chain_dmg',
    RESONANCE_BURST: 'resonance_burst',

    PRE_DEATH: 'pre_death',
    FLOOR_START: 'floor_start',

    ENERGY_GAIN: 'energy_gain',
});