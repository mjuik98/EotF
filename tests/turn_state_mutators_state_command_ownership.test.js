import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  applyPlayerBuffState: vi.fn((gs, id, stacks, data) => {
    gs.player.buffs[id] = {
      ...(gs.player.buffs[id] || {}),
      stacks: Number(gs.player.buffs[id]?.stacks || 0) + stacks,
      ...data,
    };
    return gs.player.buffs[id];
  }),
  applyPlayerShieldState: vi.fn((gs, amount) => {
    gs.player.shield = Math.max(0, Number(gs.player.shield || 0) + amount);
    return { shieldAfter: gs.player.shield };
  }),
  adjustPlayerSilenceGaugeState: vi.fn((gs, amount) => {
    gs.player.silenceGauge = Math.max(0, Number(gs.player.silenceGauge || 0) + amount);
    return { silenceGauge: gs.player.silenceGauge };
  }),
  adjustPlayerTimeRiftGaugeState: vi.fn((gs, amount) => {
    gs.player.timeRiftGauge = Math.max(0, Number(gs.player.timeRiftGauge || 0) + amount);
    return { timeRiftGauge: gs.player.timeRiftGauge };
  }),
  changePlayerEnergyState: vi.fn((gs, amount) => {
    gs.player.energy = Math.max(0, Number(gs.player.energy || 0) + amount);
    return { energyAfter: gs.player.energy };
  }),
  setPlayerEchoState: vi.fn((gs, amount) => {
    gs.player.echo = Math.max(0, Math.min(Number(gs.player.maxEcho || 0), amount));
    return { echoAfter: gs.player.echo };
  }),
  setPlayerEnergyState: vi.fn((gs, amount) => {
    gs.player.energy = Math.max(0, amount);
    return { energyAfter: gs.player.energy };
  }),
}));

vi.mock('../game/shared/state/player_state_commands.js', () => ({
  applyPlayerBuffState: hoisted.applyPlayerBuffState,
  applyPlayerShieldState: hoisted.applyPlayerShieldState,
  adjustPlayerSilenceGaugeState: hoisted.adjustPlayerSilenceGaugeState,
  adjustPlayerTimeRiftGaugeState: hoisted.adjustPlayerTimeRiftGaugeState,
  changePlayerEnergyState: hoisted.changePlayerEnergyState,
  setPlayerEchoState: hoisted.setPlayerEchoState,
  setPlayerEnergyState: hoisted.setPlayerEnergyState,
}));

describe('turn_state_mutators ownership', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('routes player-owned writes through shared player state commands', async () => {
    const {
      addPlayerBuffStacks,
      reducePlayerEnergy,
      reducePlayerSilenceGauge,
      resetPlayerTimeRiftGauge,
      setPlayerEcho,
      setPlayerEnergy,
      setPlayerShield,
    } = await import('../game/domain/combat/turn/turn_state_mutators.js');

    const gs = {
      player: {
        buffs: {},
        echo: 12,
        energy: 3,
        maxEcho: 100,
        shield: 2,
        silenceGauge: 4,
        timeRiftGauge: 6,
      },
    };

    expect(setPlayerEnergy(gs, 5)).toBe(5);
    expect(reducePlayerEnergy(gs, 2)).toBe(3);
    expect(setPlayerShield(gs, 9)).toBe(9);
    expect(setPlayerEcho(gs, 25)).toBe(25);
    expect(reducePlayerSilenceGauge(gs, 10)).toBe(0);
    expect(resetPlayerTimeRiftGauge(gs)).toBe(0);
    expect(addPlayerBuffStacks(gs, 'weakened', 2, { duration: 1 })).toEqual({ stacks: 2, duration: 1 });

    expect(hoisted.setPlayerEnergyState).toHaveBeenCalledWith(gs, 5);
    expect(hoisted.changePlayerEnergyState).toHaveBeenCalledWith(gs, -2);
    expect(hoisted.applyPlayerShieldState).toHaveBeenCalledWith(gs, 7);
    expect(hoisted.setPlayerEchoState).toHaveBeenCalledWith(gs, 25);
    expect(hoisted.adjustPlayerSilenceGaugeState).toHaveBeenCalledWith(gs, -10);
    expect(hoisted.adjustPlayerTimeRiftGaugeState).toHaveBeenCalledWith(gs, -6);
    expect(hoisted.applyPlayerBuffState).toHaveBeenCalledWith(gs, 'weakened', 2, { duration: 1 });
  });
});
