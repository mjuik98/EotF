import { afterEach, describe, expect, it, vi } from 'vitest';
import { GameStateCommonMethods } from '../game/core/game_state_common_methods.js';
import { EventBus } from '../game/core/event_bus.js';
import { CoreEvents } from '../game/core/event_contracts.js';
import { ItemSystem } from '../game/systems/item_system.js';

describe('GameStateCommonMethods', () => {
  afterEach(() => {
    EventBus.clear(CoreEvents.LOG_ADD);
    vi.restoreAllMocks();
  });

  it('triggerItems delegates to ItemSystem with gs context', () => {
    const gs = { player: { items: ['x'] } };
    const spy = vi.spyOn(ItemSystem, 'triggerItems').mockReturnValue({ ok: true });

    const result = GameStateCommonMethods.triggerItems.call(gs, 'combat_start', { foo: 1 });

    expect(spy).toHaveBeenCalledWith(gs, 'combat_start', { foo: 1 });
    expect(result).toEqual({ ok: true });
  });

  it('getSetBonuses delegates to ItemSystem', () => {
    const gs = { player: { items: ['echo_blade'] } };
    const spy = vi.spyOn(ItemSystem, 'getActiveSets').mockReturnValue([{ id: 'echo' }]);

    const result = GameStateCommonMethods.getSetBonuses.call(gs);

    expect(spy).toHaveBeenCalledWith(gs);
    expect(result).toEqual([{ id: 'echo' }]);
  });

  it('addLog appends a capped combat log entry and emits LOG_ADD', () => {
    const gs = {
      combat: {
        turn: 3,
        log: Array.from({ length: 200 }, (_, idx) => ({ msg: `old-${idx}`, type: 'system', id: `id-${idx}`, turn: 1 })),
      },
    };
    const listener = vi.fn();
    const unsubscribe = EventBus.on(CoreEvents.LOG_ADD, listener);

    GameStateCommonMethods.addLog.call(gs, 'new log', 'echo');

    unsubscribe();

    expect(gs.combat.log).toHaveLength(200);
    expect(gs.combat.log.at(-1)).toMatchObject({ msg: 'new log', type: 'echo', turn: 3 });
    expect(gs.combat.log.at(-1).id).toEqual(expect.any(String));
    expect(gs.combat.log.some((entry) => entry.msg === 'old-0')).toBe(false);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0]).toMatchObject({
      msg: 'new log',
      type: 'echo',
      gs,
    });
  });
});
