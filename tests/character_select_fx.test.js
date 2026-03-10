import { describe, expect, it, vi } from 'vitest';
import { setupCharacterCardFx } from '../game/ui/title/character_select_fx.js';

function createCard() {
  const listeners = {};
  return {
    style: {},
    listeners,
    addEventListener: vi.fn((name, handler) => {
      listeners[name] = handler;
    }),
    removeEventListener: vi.fn((name, handler) => {
      if (listeners[name] === handler) delete listeners[name];
    }),
    getBoundingClientRect: vi.fn(() => ({
      left: 100,
      top: 200,
      width: 200,
      height: 100,
    })),
  };
}

describe('character select fx helper', () => {
  it('applies tilt transform and foil gradient on hover', () => {
    const card = createCard();
    const foil = { style: {} };

    setupCharacterCardFx({
      card,
      resolveById: (id) => (id === 'cardFoil' ? foil : null),
    });

    expect(typeof card.listeners.mousemove).toBe('function');
    card.listeners.mousemove({
      clientX: 250,
      clientY: 260,
    });

    expect(card.style.transform).toContain('perspective(600px)');
    expect(card.style.transform).toContain('rotateX(-2deg)');
    expect(card.style.transform).toContain('rotateY(5deg)');
    expect(foil.style.background).toContain('conic-gradient(');
    expect(foil.style.background).toContain('at 75% 60%');
  });

  it('resets tilt and detaches listeners on cleanup', () => {
    const card = createCard();
    const foil = { style: { background: 'stale' } };

    const cleanup = setupCharacterCardFx({
      card,
      resolveById: (id) => (id === 'cardFoil' ? foil : null),
    });

    card.listeners.mouseleave();
    expect(card.style.transform).toBe('perspective(600px) rotateX(0) rotateY(0)');
    expect(foil.style.background).toBe('none');

    cleanup();
    expect(card.removeEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(card.removeEventListener).toHaveBeenCalledWith('mouseleave', expect.any(Function));
    expect(card.listeners.mousemove).toBeUndefined();
    expect(card.listeners.mouseleave).toBeUndefined();
  });
});
