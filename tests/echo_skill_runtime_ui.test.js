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
    });

    expect(gs.dealDamage).toHaveBeenCalledWith(12, null, true);
    expect(gs.dealDamageAll).toHaveBeenCalledWith(20, true);
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
    expect(gs.dealDamageAll).toHaveBeenCalledWith(25, true);
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
