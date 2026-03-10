import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  dispatchCombatTurnUiAction,
  playEnemyAttackHitUi,
  playEnemyStatusTickEffects,
  waitWhileCombatActive,
} from '../game/ui/combat/combat_turn_flow_ui.js';

describe('combat_turn_flow_ui', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('waits while combat stays active and aborts once combat ends', async () => {
    const gs = { combat: { active: true }, _endCombatScheduled: false, _endCombatRunning: false };
    const steadySleep = vi.fn(async () => {});

    await expect(waitWhileCombatActive(gs, 120, { sleep: steadySleep, stepMs: 40 })).resolves.toBe(true);
    expect(steadySleep).toHaveBeenCalledTimes(3);

    let calls = 0;
    const abortingSleep = vi.fn(async () => {
      calls += 1;
      if (calls === 2) gs._endCombatScheduled = true;
    });

    gs._endCombatScheduled = false;
    await expect(waitWhileCombatActive(gs, 160, { sleep: abortingSleep, stepMs: 40 })).resolves.toBe(false);
    expect(abortingSleep).toHaveBeenCalledTimes(2);
  });

  it('dispatches known combat turn UI actions to the provided deps', () => {
    const updateStatusDisplay = vi.fn();
    const updateChainUI = vi.fn();
    const renderCombatCards = vi.fn();
    const updateUI = vi.fn();
    const shuffleArray = vi.fn();
    const hand = [{ id: 'a' }];
    const deps = {
      gs: { player: { hand } },
      renderCombatCards,
      shuffleArray,
      updateChainUI,
      updateStatusDisplay,
      updateUI,
    };

    dispatchCombatTurnUiAction({ uiAction: 'updateStatusDisplay' }, deps);
    dispatchCombatTurnUiAction({ uiAction: 'updateChainUI', value: 3 }, deps);
    dispatchCombatTurnUiAction({ uiAction: 'renderCombatCards' }, deps);
    dispatchCombatTurnUiAction({ uiAction: 'updateUI' }, deps);
    dispatchCombatTurnUiAction({ uiAction: 'shuffleAndRender' }, deps);
    dispatchCombatTurnUiAction({ uiAction: 'unknown' }, deps);

    expect(updateStatusDisplay).toHaveBeenCalledTimes(1);
    expect(updateChainUI).toHaveBeenCalledWith(3);
    expect(renderCombatCards).toHaveBeenCalledTimes(2);
    expect(updateUI).toHaveBeenCalledTimes(1);
    expect(shuffleArray).toHaveBeenCalledWith(hand);
  });

  it('plays per-status UI effects for poison, burning, marked, and doom events', () => {
    const showDmgPopup = vi.fn();
    const emit = vi.fn();
    const burstEffect = vi.fn();
    const shake = vi.fn();
    const playChain = vi.fn();
    const win = { innerWidth: 1200 };

    playEnemyStatusTickEffects(
      [
        { index: 0, dmg: 4, color: '#0f0', type: 'poison' },
        { index: 1, dmg: 5, color: '#f60', type: 'burning' },
        { index: 2, dmg: 9, color: '#ff0', type: 'marked_explode' },
        { index: 3, dmg: 12, color: '#808', type: 'doom_explode' },
      ],
      {
        audioEngine: { playChain },
        particleSystem: { burstEffect, emit },
        screenShake: { shake },
        showDmgPopup,
      },
      win,
    );

    expect(showDmgPopup).toHaveBeenCalledTimes(5);
    expect(emit).toHaveBeenCalledTimes(2);
    expect(burstEffect).toHaveBeenCalledTimes(1);
    expect(shake).toHaveBeenCalledTimes(2);
    expect(playChain).toHaveBeenCalledWith(4);
    expect(showDmgPopup).toHaveBeenLastCalledWith(12, 600, 300, '#808');
  });

  it('animates enemy hit feedback and stops when the enemy dies mid-multi-hit', async () => {
    const add = vi.fn();
    const remove = vi.fn();
    const renderCombatEnemies = vi.fn();
    const sleep = vi.fn(async () => {});
    const card = { classList: { add, remove } };
    const doc = {
      getElementById: vi.fn((id) => (id === 'enemy_1' ? card : null)),
    };

    await expect(
      playEnemyAttackHitUi(
        1,
        { hitIndex: 0, enemyDied: false },
        { multi: 2 },
        { renderCombatEnemies },
        doc,
        sleep,
      ),
    ).resolves.toBe(false);

    expect(add).toHaveBeenCalledWith('hit');
    expect(sleep).toHaveBeenCalledWith(200);
    vi.advanceTimersByTime(400);
    expect(remove).toHaveBeenCalledWith('hit');
    expect(renderCombatEnemies).not.toHaveBeenCalled();

    await expect(
      playEnemyAttackHitUi(
        1,
        { hitIndex: 1, enemyDied: true },
        { multi: 2 },
        { renderCombatEnemies },
        doc,
        sleep,
      ),
    ).resolves.toBe(true);

    expect(renderCombatEnemies).toHaveBeenCalledTimes(1);
  });
});
