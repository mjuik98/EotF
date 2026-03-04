import { DATA } from '../../data/game_data.js';
import { SetBonusSystem } from './set_bonus_system.js';
import { InscriptionSystem } from './inscription_system.js';

const TRIGGER_ALIASES = Object.freeze({
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
    FLOOR_START: 'floor_start',
    BOSS_START: 'boss_start',
    ECHO_SKILL: 'echo_skill',
    CHAIN_DMG: 'chain_dmg',
    RESONANCE_BURST: 'resonance_burst',
    ENERGY_GAIN: 'energy_gain',
    PRE_DEATH: 'pre_death',
    CHAIN_GAIN: 'chain_gain',
    CHAIN_BREAK: 'chain_break',
    CHAIN_REACH_5: 'chain_reach_5',
    ENERGY_EMPTY: 'energy_empty',
    ECHO_GAIN: 'echo_gain',
    HEAL_AMOUNT: 'heal_amount',
    SHIELD_GAIN: 'shield_gain',
    BEFORE_CARD_COST: 'before_card_cost',
});

function normalizeTrigger(trigger) {
    if (typeof trigger !== 'string') return trigger;
    return TRIGGER_ALIASES[trigger] || trigger;
}

/**
 * 아이템 및 세트 보너스 트리거 시스템
 */
export const ItemSystem = {
    /**
     * 특정 트리거에 대해 모든 활성 아이템과 세트 효과를 실행합니다.
     */
    triggerItems(gs, trigger, data) {
        const normalizedTrigger = normalizeTrigger(trigger);
        let numericResult = typeof data === 'number' ? data : null;
        let numericOverride = null;
        let boolResult = false;

        // 아이템 정렬 (특수 트리거에 대한 우선순위)
        const sortedItems = [...gs.player.items].sort((a, b) => {
            if (normalizedTrigger === 'damage_taken') {
                const aPrio = (a === 'void_crystal' || a === 'blood_crown') ? -1 : 0;
                const bPrio = (b === 'void_crystal' || b === 'blood_crown') ? -1 : 0;
                return aPrio - bPrio;
            }
            return 0;
        });

        // 각 아이템 패시브 실행
        sortedItems.forEach(itemId => {
            const item = DATA.items[itemId];
            if (!item?.passive) return;
            const payload = numericResult !== null ? numericResult : data;
            const result = item.passive(gs, normalizedTrigger, payload);
            if (typeof result === 'number' && Number.isFinite(result)) {
                if (numericResult !== null) numericResult = result;
                else numericOverride = result;
            }
            if (result === true) boolResult = true;
        });

        // 세트 보너스 실행
        const setPayload = numericResult !== null ? numericResult : data;
        const setResult = SetBonusSystem.triggerSetBonuses(gs, normalizedTrigger, setPayload);
        if (typeof setResult === 'number' && Number.isFinite(setResult)) {
            if (numericResult !== null) numericResult = setResult;
            else numericOverride = setResult;
        }
        if (setResult === true) boolResult = true;

        InscriptionSystem.triggerSynergy(gs, normalizedTrigger, DATA, setPayload);

        if (boolResult) return true;
        if (numericResult !== null) return numericResult;
        if (numericOverride !== null) return numericOverride;
        return data;
    },

    /**
     * 현재 활성화된 세트 보너스 목록을 반환합니다.
     */
    getActiveSets(gs) {
        return SetBonusSystem.getActiveSets(gs);
    }
};
