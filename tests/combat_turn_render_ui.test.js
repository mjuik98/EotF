import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  setCombatActionButtonsDisabled,
  setCombatTurnIndicator,
  triggerBossPhaseShiftSprite,
} from '../game/ui/combat/combat_turn_render_ui.js';

describe('combat_turn_render_ui', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('updates the turn indicator class and label', () => {
    const indicator = { className: '', textContent: '' };
    const doc = {
      getElementById: vi.fn((id) => (id === 'turnIndicator' ? indicator : null)),
    };

    const result = setCombatTurnIndicator(doc, 'enemy', '적의 턴');

    expect(result).toBe(indicator);
    expect(indicator.className).toBe('turn-indicator turn-enemy');
    expect(indicator.textContent).toBe('적의 턴');
  });

  it('disables and re-enables combat action buttons', () => {
    const buttons = [
      { disabled: false, style: { pointerEvents: 'none' } },
      { disabled: false, style: { pointerEvents: 'none' } },
    ];
    const doc = {
      querySelectorAll: vi.fn(() => buttons),
    };

    setCombatActionButtonsDisabled(doc, true);
    expect(buttons.every((button) => button.disabled)).toBe(true);

    setCombatActionButtonsDisabled(doc, false);
    expect(buttons.every((button) => button.disabled === false)).toBe(true);
    expect(buttons.every((button) => button.style.pointerEvents === '')).toBe(true);
  });

  it('restarts the boss phase shift sprite animation', () => {
    const sprite = { style: { animation: 'idle' } };
    const doc = {
      getElementById: vi.fn((id) => (id === 'enemy_sprite_2' ? sprite : null)),
    };

    const result = triggerBossPhaseShiftSprite(doc, 2);

    expect(result).toBe(sprite);
    expect(sprite.style.animation).toBe('none');

    vi.advanceTimersByTime(10);
    expect(sprite.style.animation).toBe('enemyHit 0.8s ease 3');
  });
});
