import { describe, expect, it } from 'vitest';
import { EventManager } from '../game/systems/event_manager.js';

describe('EventManager.createRestEvent - upgrade button logic', () => {
    const mockData = {
        upgradeMap: {
            'strike': 'strike_plus',
        },
    };

    const mockRunRules = {
        getHealAmount: (gs, base) => base,
    };

    it('enables the upgrade button when upgradable cards are in deck', () => {
        const gs = {
            player: {
                deck: ['strike'],
                maxHp: 80,
                hp: 40,
                echo: 0,
            },
            currentRegion: 0,
            heal: () => { },
            addEcho: () => { },
        };

        const restEvent = EventManager.createRestEvent(gs, mockData, mockRunRules);
        const upgradeChoice = restEvent.choices.find(c => c.text === '무작위 카드 강화');

        expect(upgradeChoice.isDisabled(gs)).toBe(false);
    });

    it('disables the upgrade button when no upgradable cards are in deck', () => {
        const gs = {
            player: {
                deck: ['strike_plus', 'defend'],
                maxHp: 80,
                hp: 40,
                echo: 0,
            },
            currentRegion: 0,
            heal: () => { },
            addEcho: () => { },
        };

        const restEvent = EventManager.createRestEvent(gs, mockData, mockRunRules);
        const upgradeChoice = restEvent.choices.find(c => c.text === '무작위 카드 강화');

        expect(upgradeChoice.isDisabled(gs)).toBe(true);
        expect(upgradeChoice.disabledReason).toBe('강화 가능한 카드가 없습니다.');
    });
});
