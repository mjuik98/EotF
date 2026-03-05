import { describe, expect, it, vi } from 'vitest';
import { Actions, Reducers } from '../game/core/state_actions.js';
import { GameAPI } from '../game/core/game_api.js';

function createTestState() {
    return {
        _activeRegionId: 5, // 시간의 황무지
        currentRegion: 'stage_5',
        player: {
            hand: [],
            drawPile: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10'],
            graveyard: [],
            _handCapMinus: 1, // 최대 손패 7장으로 설정 (버그 발생 조건)
        },
        combat: {
            active: true,
        },
        dispatch(action, payload) {
            const reducer = Reducers[action];
            if (reducer) {
                return reducer(this, payload);
            }
            return null;
        },
        addTimeRift: vi.fn(),
        markDirty: vi.fn(),
    };
}

describe('Time Rift Gauge Bug Fix Verification', () => {
    it('should increment timeRiftGauge even if hand is full (attempts > 0)', () => {
        const gs = createTestState();

        // 손패를 7장으로 가득 채움
        gs.player.hand = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7'];

        // 2장 드로우 시도
        GameAPI.drawCards(2, gs);

        // 손패는 여전히 7장이어야 함
        expect(gs.player.hand.length).toBe(7);

        // 하지만 addTimeRift는 2번 시도에 대해 호출되어야 함
        expect(gs.addTimeRift).toHaveBeenCalledWith(2, '시간의 균열', expect.any(Object));
    });

    it('should increment timeRiftGauge correctly when some cards are drawn and some are blocked', () => {
        const gs = createTestState();

        // 손패 6장 (1장 더 받을 수 있음)
        gs.player.hand = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

        // 3장 드로우 시도
        GameAPI.drawCards(3, gs);

        // 손패는 7장이 됨 (1장 성공)
        expect(gs.player.hand.length).toBe(7);

        // addTimeRift는 시도 횟수인 3만큼 호출되어야 함
        expect(gs.addTimeRift).toHaveBeenCalledWith(3, '시간의 균열', expect.any(Object));
    });

    it('should NOT increment timeRiftGauge if deck and graveyard are empty (attempts = 0)', () => {
        const gs = createTestState();

        // 덱과 무덤 비움
        gs.player.drawPile = [];
        gs.player.graveyard = [];

        // 3장 드로우 시도
        GameAPI.drawCards(3, gs);

        // 드로우 시도 자체가 불가능하므로 addTimeRift는 호출되지 않거나 0으로 호출되어야 함
        // (현재 구현상 result.attempts가 0이면 호출 안 함)
        expect(gs.addTimeRift).not.toHaveBeenCalled();
    });
});
