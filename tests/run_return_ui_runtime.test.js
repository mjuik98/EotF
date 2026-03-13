import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OVERLAY_DISMISS_MS, returnToGameRuntime } from '../game/features/run/presentation/browser/run_return_ui_runtime.js';

function createClassList(initial = []) {
  const set = new Set(initial);
  return {
    add: (...names) => names.forEach((name) => set.add(name)),
    remove: (...names) => names.forEach((name) => set.delete(name)),
    contains: (name) => set.has(name),
  };
}

function createDoc() {
  const combatOverlay = { classList: { remove: vi.fn() } };
  const combatHandCards = { textContent: 'cards' };
  const enemyZone = { textContent: 'enemies' };
  const nodeCardOverlay = { dataset: {}, style: {}, removeAttribute: vi.fn() };
  const rewardScreen = { classList: createClassList(['active']), style: {} };
  const gameScreen = { classList: createClassList() };
  const elements = {
    combatOverlay,
    combatHandCards,
    enemyZone,
    nodeCardOverlay,
    rewardScreen,
    gameScreen,
  };
  return {
    getElementById: vi.fn((id) => elements[id] || null),
    refs: elements,
  };
}

describe('run_return_ui_runtime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('finalizes victory after boss reward on the last non-endless region', () => {
    const doc = createDoc();
    const finalizeRunOutcome = vi.fn();
    const storySystem = {
      checkHiddenEnding: vi.fn(() => false),
      showNormalEnding: vi.fn(),
      showHiddenEnding: vi.fn(),
    };
    const deps = {
      doc,
      gs: {
        _bossRewardPending: true,
        _bossLastRegion: true,
      },
      runRules: {
        isEndless: () => false,
      },
      finalizeRunOutcome,
      storySystem,
    };

    returnToGameRuntime(true, deps);
    vi.advanceTimersByTime(OVERLAY_DISMISS_MS);

    expect(finalizeRunOutcome).toHaveBeenCalledWith('victory', {
      echoFragments: 5,
      bossCleared: true,
    }, { gs: deps.gs });
    expect(storySystem.showNormalEnding).toHaveBeenCalledTimes(1);
  });

  it('returns to gameplay and refreshes minimap on normal reward exit', () => {
    const doc = createDoc();
    const switchScreen = vi.fn();
    const updateUI = vi.fn();
    const updateNextNodes = vi.fn();
    const renderMinimap = vi.fn();
    const deps = {
      doc,
      gs: {
        _bossRewardPending: false,
        _bossLastRegion: false,
      },
      runRules: {
        isEndless: () => false,
      },
      switchScreen,
      updateUI,
      updateNextNodes,
      renderMinimap,
    };

    returnToGameRuntime(false, deps);
    vi.advanceTimersByTime(50);

    expect(switchScreen).toHaveBeenCalledWith('game');
    expect(updateUI).toHaveBeenCalledTimes(1);
    expect(updateNextNodes).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(50);
    expect(renderMinimap).toHaveBeenCalledTimes(1);
    expect(doc.refs.combatOverlay.classList.remove).toHaveBeenCalledWith('active');
    expect(doc.refs.combatHandCards.textContent).toBe('');
    expect(doc.refs.enemyZone.textContent).toBe('');
  });
});
