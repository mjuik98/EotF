import { DATA } from '../../data/game_data.js';
import { SetBonusSystem } from './set_bonus_system.js';

/**
 * 아이템 및 세트 보너스 트리거 시스템
 */
export const ItemSystem = {
    /**
     * 특정 트리거에 대해 모든 활성 아이템과 세트 효과를 실행합니다.
     */
    triggerItems(gs, trigger, data) {
        let numericResult = typeof data === 'number' ? data : null;
        let boolResult = false;

        // 아이템 정렬 (특수 트리거에 대한 우선순위)
        const sortedItems = [...gs.player.items].sort((a, b) => {
            if (trigger === 'damage_taken') {
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
            const result = item.passive(gs, trigger, payload);
            if (typeof result === 'number' && Number.isFinite(result) && numericResult !== null) {
                numericResult = result;
            }
            if (result === true) boolResult = true;
        });

        // 세트 보너스 실행
        const setPayload = numericResult !== null ? numericResult : data;
        const setResult = SetBonusSystem.triggerSetBonuses(gs, trigger, setPayload);
        if (typeof setResult === 'number' && Number.isFinite(setResult) && numericResult !== null) {
            numericResult = setResult;
        }
        if (setResult === true) boolResult = true;

        if (boolResult) return true;
        if (numericResult !== null) return numericResult;
        return data;
    },

    /**
     * 현재 활성화된 세트 보너스 목록을 반환합니다.
     */
    getActiveSets(gs) {
        return SetBonusSystem.getActiveSets(gs);
    }
};
