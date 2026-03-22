import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyEchoSkillEffect,
  flashEchoSkillButton,
  resolveEchoSkillTier,
  useEchoSkillRuntime,
} from '../game/ui/combat/echo_skill_runtime_ui.js';

describe('echo_skill_runtime_ui', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves echo tiers from configured thresholds', () => {
    expect(resolveEchoSkillTier(25)).toBeNull();
    expect(resolveEchoSkillTier(30)).toEqual({ tier: 1, cost: 30 });
    expect(resolveEchoSkillTier(60)).toEqual({ tier: 2, cost: 60 });
    expect(resolveEchoSkillTier(100)).toEqual({ tier: 3, cost: 100 });
  });

  it('applies echo skill side effects from the resolved skill definition', () => {
    const gs = {
      dealDamage: vi.fn(),
      dealDamageAll: vi.fn(),
      addShield: vi.fn(),
      applyEnemyStatus: vi.fn(),
      drawCards: vi.fn(),
      addEcho: vi.fn(),
      addBuff: vi.fn(),
      heal: vi.fn(),
      increaseMaxHp: vi.fn(),
      addLog: vi.fn(),
    };
    const applyEnemyDamage = vi.fn();
    const applyEnemyAreaDamage = vi.fn();

    applyEchoSkillEffect(gs, {
      dmg: 12,
      aoedmg: 20,
      shield: 7,
      weaken: 2,
      draw: 1,
      echo: 8,
      vanish: 1,
      heal: 4,
      atkGrowth: 2,
      maxHpGrowth: 3,
      immune: 1,
      log: 'echo!',
    }, {
      applyEnemyAreaDamage,
      applyEnemyDamage,
    });

    expect(applyEnemyDamage).toHaveBeenCalledWith(12, null, true, null, expect.any(Object));
    expect(applyEnemyAreaDamage).toHaveBeenCalledWith(20, expect.any(Object));
    expect(gs.dealDamage).not.toHaveBeenCalled();
    expect(gs.dealDamageAll).not.toHaveBeenCalled();
    expect(gs.addShield).toHaveBeenCalledWith(7);
    expect(gs.applyEnemyStatus).toHaveBeenCalledWith('weakened', 2);
    expect(gs.drawCards).toHaveBeenCalledWith(1);
    expect(gs.addEcho).toHaveBeenCalledWith(8);
    expect(gs.addBuff).toHaveBeenCalledWith('vanish', 1, {});
    expect(gs.addBuff).toHaveBeenCalledWith('echo_berserk', 99, { atkGrowth: 2 });
    expect(gs.heal).toHaveBeenCalledWith(4);
    expect(gs.increaseMaxHp).toHaveBeenCalledWith(3);
    expect(gs.addBuff).toHaveBeenCalledWith('immune', 1, {});
    expect(gs.addLog).toHaveBeenCalledWith('echo!', 'echo');
  });

  it('does not fall back to gs damage methods when combat damage actions are missing', () => {
    const gs = {
      dealDamage: vi.fn(),
      dealDamageAll: vi.fn(),
      addLog: vi.fn(),
    };

    applyEchoSkillEffect(gs, {
      dmg: 12,
      aoedmg: 20,
      log: 'echo!',
    });

    expect(gs.dealDamage).not.toHaveBeenCalled();
    expect(gs.dealDamageAll).not.toHaveBeenCalled();
    expect(gs.addLog).toHaveBeenCalledWith('echo!', 'echo');
  });

  it('falls back to state-backed shield gain when gs.addShield is unavailable', () => {
    const gs = {
      player: {
        shield: 0,
        buffs: {},
      },
      dispatch(action, payload = {}) {
        if (action === 'player:shield') {
          this.player.shield += Number(payload.amount || 0);
          return { shieldAfter: this.player.shield };
        }
        if (action === 'player:buff') {
          this.player.buffs[payload.id] = {
            stacks: Number(payload.stacks || 0),
            ...(payload.data || {}),
          };
          return this.player.buffs[payload.id];
        }
        return null;
      },
      addBuff: vi.fn(function addBuff(id, stacks, data = {}) {
        return this.dispatch('player:buff', { id, stacks, data });
      }),
      addLog: vi.fn(),
    };

    applyEchoSkillEffect(gs, {
      shield: 50,
      immune: 1,
      log: 'echo!',
    });

    expect(gs.player.shield).toBe(50);
    expect(gs.addBuff).toHaveBeenCalledWith('immune', 1, {});
    expect(gs.addLog).toHaveBeenCalledWith('echo!', 'echo');
  });

  it('runs echo skill runtime, triggers burst side effects, and flashes the button', () => {
    const echoBtn = { style: {} };
    const gs = {
      player: { echo: 65, class: 'mage' },
      combat: { active: true, playerTurn: true },
      drainEcho: vi.fn(),
      triggerItems: vi.fn(),
      dealDamage: vi.fn(),
      dealDamageAll: vi.fn(),
      addShield: vi.fn(),
      applyEnemyStatus: vi.fn(),
      drawCards: vi.fn(),
      addEcho: vi.fn(),
      addBuff: vi.fn(),
      heal: vi.fn(),
      increaseMaxHp: vi.fn(),
      addLog: vi.fn(),
    };
    const deps = {
      applyEnemyAreaDamage: vi.fn(),
      applyEnemyDamage: vi.fn(),
      gs,
      doc: { getElementById: vi.fn(() => echoBtn) },
      showEchoBurstOverlay: vi.fn(),
      audioEngine: { playResonanceBurst: vi.fn() },
      renderCombatEnemies: vi.fn(),
      renderCombatCards: vi.fn(),
    };

    expect(useEchoSkillRuntime(deps)).toBe(true);
    expect(gs.drainEcho).toHaveBeenCalledWith(60);
    expect(gs.triggerItems).toHaveBeenCalledWith(expect.any(String), { cost: 60 });
    expect(deps.applyEnemyAreaDamage).toHaveBeenCalledWith(25, expect.any(Object));
    expect(gs.dealDamageAll).not.toHaveBeenCalled();
    expect(gs.drawCards).toHaveBeenCalledWith(2);
    expect(gs.addEcho).toHaveBeenCalledWith(10);
    expect(deps.showEchoBurstOverlay).toHaveBeenCalledTimes(1);
    expect(deps.audioEngine.playResonanceBurst).toHaveBeenCalledTimes(1);
    expect(deps.renderCombatEnemies).toHaveBeenCalledTimes(1);
    expect(deps.renderCombatCards).toHaveBeenCalledTimes(1);
    expect(echoBtn.style.background).toContain('linear-gradient');

    vi.advanceTimersByTime(800);
    expect(echoBtn.style.background).toBe('');
  });

  it('logs a warning and aborts when echo is below the minimum threshold', () => {
    const gs = {
      player: { echo: 20, class: 'mage' },
      combat: { active: true, playerTurn: true },
      addLog: vi.fn(),
      drainEcho: vi.fn(),
    };

    expect(useEchoSkillRuntime({ gs })).toBe(false);
    expect(gs.addLog).toHaveBeenCalledWith('⚠️ 잔향 게이지 부족! (30 필요)', 'damage');
    expect(gs.drainEcho).not.toHaveBeenCalled();
  });

  it('flashes the echo button only when the element exists', () => {
    const echoBtn = { style: {} };
    expect(flashEchoSkillButton({ doc: { getElementById: () => echoBtn } })).toBe(true);
    expect(echoBtn.style.transition).toContain('background');

    vi.advanceTimersByTime(800);
    expect(echoBtn.style.background).toBe('');
    expect(flashEchoSkillButton({ doc: { getElementById: () => null } })).toBe(false);
  });
});
