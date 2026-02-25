'use strict';

// ═══════════════════════════════════════════════
//  Trigger 상수 — 아이템 passive 이벤트 이름 관리
//  오타 버그를 방지하고, IDE 자동완성을 지원합니다.
// ═══════════════════════════════════════════════

export const Trigger = Object.freeze({
    COMBAT_START: 'combat_start',
    COMBAT_END: 'combat_end',
    TURN_START: 'turn_start',
    CARD_PLAY: 'card_play',
    CARD_DISCARD: 'card_discard',
    ENEMY_KILL: 'enemy_kill',
    DEAL_DAMAGE: 'deal_damage',
    DAMAGE_TAKEN: 'damage_taken',
    BOSS_START: 'boss_start',
    CHAIN_DMG: 'chain_dmg',
    RESONANCE_BURST: 'resonance_burst',
    ECHO_SKILL: 'echo_skill',
    PRE_DEATH: 'pre_death',
    FLOOR_START: 'floor_start',
});
