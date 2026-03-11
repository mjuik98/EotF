import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cleanupCombatTurnTooltips,
  setEnemyTurnUiState,
  setPlayerTurnUiState,
  showBossPhaseShiftUi,
  syncCombatTurnEnergy,
} from '../game/presentation/combat/combat_turn_state_presenter.js';

function createButton() {
  return {
    disabled: false,
    style: { pointerEvents: 'none' },
  };
}

describe('combat_turn_state_presenter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('cleans combat tooltips via explicit cleanup helper or fallback nodes', () => {
    const enemyTooltip = { classList: { remove: vi.fn() } };
    const intentTooltip = { classList: { remove: vi.fn() } };
    const doc = {
      getElementById: vi.fn((id) => ({
        enemyStatusTooltip: enemyTooltip,
        intentTooltip: intentTooltip,
      }[id] || null)),
    };
    const cleanupAllTooltips = vi.fn();
    const hideGeneralTooltip = vi.fn();

    cleanupCombatTurnTooltips({
      doc,
      win: {},
      cleanupAllTooltips,
      tooltipUI: { hideGeneralTooltip },
    });

    expect(cleanupAllTooltips).toHaveBeenCalledWith({ doc, win: {} });
    expect(hideGeneralTooltip).toHaveBeenCalledWith({ doc, win: {} });

    cleanupAllTooltips.mockClear();
    cleanupCombatTurnTooltips({ doc, win: {} });
    expect(enemyTooltip.classList.remove).toHaveBeenCalledWith('visible');
    expect(intentTooltip.classList.remove).toHaveBeenCalledWith('visible');
  });

  it('toggles enemy turn UI state and disables combat action buttons', () => {
    const turnIndicator = { className: '', textContent: '' };
    const buttons = [createButton(), createButton()];
    const doc = {
      getElementById: vi.fn((id) => (id === 'turnIndicator' ? turnIndicator : null)),
      querySelectorAll: vi.fn(() => buttons),
    };
    const showTurnBanner = vi.fn();

    setEnemyTurnUiState({ doc, showTurnBanner });

    expect(turnIndicator.className).toBe('turn-indicator turn-enemy');
    expect(turnIndicator.textContent).toBe('적의 턴');
    expect(showTurnBanner).toHaveBeenCalledWith('enemy');
    expect(buttons.every((button) => button.disabled)).toBe(true);
  });

  it('syncs combat energy with explicit deps first, then injected hud fallbacks', () => {
    const gs = { combat: true };
    const explicit = vi.fn();
    syncCombatTurnEnergy(gs, { updateCombatEnergy: explicit });
    expect(explicit).toHaveBeenCalledWith(gs);

    const winUpdate = vi.fn();
    syncCombatTurnEnergy(gs, {
      win: {
        HudUpdateUI: { updateCombatEnergy: winUpdate },
      },
    });
    expect(winUpdate).toHaveBeenCalledWith(gs);

    const gameUpdate = vi.fn();
    syncCombatTurnEnergy(gs, {
      hudUpdateUI: { updateCombatEnergy: gameUpdate },
    });
    expect(gameUpdate).toHaveBeenCalledWith(gs);
  });

  it('toggles player turn UI, rerenders combat views, and resyncs energy after a delay', () => {
    const turnIndicator = { className: '', textContent: '' };
    const buttons = [createButton(), createButton()];
    const doc = {
      getElementById: vi.fn((id) => (id === 'turnIndicator' ? turnIndicator : null)),
      querySelectorAll: vi.fn(() => buttons),
    };
    const renderCombatCards = vi.fn();
    const renderCombatEnemies = vi.fn();
    const updateUI = vi.fn();
    const showTurnBanner = vi.fn();
    const updateCombatEnergy = vi.fn();
    const gs = { player: {} };

    setPlayerTurnUiState(gs, {
      doc,
      showTurnBanner,
      renderCombatCards,
      renderCombatEnemies,
      updateUI,
      updateCombatEnergy,
    });

    expect(turnIndicator.className).toBe('turn-indicator turn-player');
    expect(turnIndicator.textContent).toBe('플레이어 턴');
    expect(showTurnBanner).toHaveBeenCalledWith('player');
    expect(buttons.every((button) => button.disabled === false && button.style.pointerEvents === '')).toBe(true);
    expect(renderCombatCards).toHaveBeenCalledTimes(1);
    expect(renderCombatEnemies).toHaveBeenCalledTimes(1);
    expect(updateUI).toHaveBeenCalledTimes(1);
    expect(updateCombatEnergy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(updateCombatEnergy).toHaveBeenCalledWith(gs);
  });

  it('plays boss phase shift UI effects and schedules sprite/status updates', () => {
    const sprite = { style: { animation: 'idle' } };
    const doc = {
      getElementById: vi.fn((id) => (id === 'enemy_sprite_1' ? sprite : null)),
    };
    const shake = vi.fn();
    const playEvent = vi.fn();
    const playBossPhase = vi.fn();
    const burstEffect = vi.fn();
    const renderCombatEnemies = vi.fn();
    const updateStatusDisplay = vi.fn();
    const showEchoBurstOverlay = vi.fn();
    const gs = { combat: { enemies: [{}, {}, {}] } };

    showBossPhaseShiftUi(gs, 1, {
      doc,
      win: { innerWidth: 1200 },
      screenShake: { shake },
      audioEngine: { playEvent, playBossPhase },
      particleSystem: { burstEffect },
      renderCombatEnemies,
      updateStatusDisplay,
      showEchoBurstOverlay,
    });

    expect(sprite.style.animation).toBe('none');
    expect(shake).toHaveBeenCalledWith(15, 1.0);
    expect(playEvent).toHaveBeenCalledWith('event', 'bossPhase');
    expect(playBossPhase).not.toHaveBeenCalled();
    expect(burstEffect).toHaveBeenCalledWith(600, 220);
    expect(showEchoBurstOverlay).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(10);
    expect(sprite.style.animation).toBe('enemyHit 0.8s ease 3');
    vi.advanceTimersByTime(40);
    expect(renderCombatEnemies).toHaveBeenCalledTimes(1);
    expect(updateStatusDisplay).toHaveBeenCalledTimes(1);
  });
});
