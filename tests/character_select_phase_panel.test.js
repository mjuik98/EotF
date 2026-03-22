import { describe, expect, it, vi } from 'vitest';
import { renderCharacterPhase } from '../game/ui/title/character_select_phase_panel.js';

function createClassList(initial = []) {
  const set = new Set(initial);
  return {
    add: (...tokens) => tokens.forEach((token) => set.add(token)),
    remove: (...tokens) => tokens.forEach((token) => set.delete(token)),
    contains: (token) => set.has(token),
    toggle: (token, force) => {
      if (force === undefined) {
        if (set.has(token)) set.delete(token);
        else set.add(token);
      } else if (force) {
        set.add(token);
      } else {
        set.delete(token);
      }
    },
  };
}

function createNode() {
  const listeners = {};
  return {
    dataset: {},
    style: {},
    classList: createClassList(),
    innerHTML: '',
    addEventListener: vi.fn((name, handler) => {
      listeners[name] = handler;
    }),
    listeners,
  };
}

describe('character_select_phase_panel', () => {
  it('renders done phase, types story text, and wires end-state buttons', () => {
    const overlay = createNode();
    const circle = createNode();
    const content = createNode();
    const root = createNode();
    root.classList.add('is-focus-locked');
    const typedArea = createNode();
    const reselectButton = createNode();
    const startButton = createNode();
    const nodes = {
      charSelectSubScreen: root,
      phaseOverlay: overlay,
      phaseCircle: circle,
      phaseContent: content,
      typedArea,
      btnResel: reselectButton,
      btnRealStart: startButton,
    };

    const stopTyping = vi.fn();
    const rerender = vi.fn();
    const onStart = vi.fn();
    const timers = {
      setTimeout: vi.fn(),
      setInterval: vi.fn((handler) => {
        handler();
        return 42;
      }),
    };
    const state = { phase: 'done', typingTimer: null };
    const selectedChar = {
      accent: '#ff5555',
      color: '#330000',
      glow: '#ff5555',
      emoji: 'A',
      name: 'Berserker',
      title: '파음전사',
      traitName: '파열화음',
      tags: ['근오우', '광기'],
      startRelic: { icon: '#', name: 'Core' },
      story: 'AB',
    };

    renderCharacterPhase({
      state,
      selectedChar,
      resolveById: (id) => nodes[id] || null,
      stopTyping,
      rerender,
      onStart,
      timers,
    });

    expect(overlay.style.display).toBe('flex');
    expect(overlay.className).toBe('done');
    expect(content.innerHTML).toContain('Berserker');
    expect(state.typingTimer).toBe(42);
    expect(typedArea.innerHTML).toContain('A');

    reselectButton.listeners.mouseenter();
    expect(reselectButton.style.color).toBe('#ccc');
    expect(reselectButton.style.borderColor).toBe('#555');

    reselectButton.listeners.mouseleave();
    expect(reselectButton.style.color).toBe('#99a');
    expect(reselectButton.style.borderColor).toBe('rgba(255,255,255,0.2)');

    reselectButton.listeners.click();
    expect(state.phase).toBe('select');
    expect(root.classList.contains('is-focus-locked')).toBe(false);
    expect(rerender).toHaveBeenCalledTimes(1);

    startButton.listeners.click();
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('renders select/burst phase transitions through the helper', () => {
    const overlay = createNode();
    const circle = createNode();
    const content = createNode();
    const nodes = {
      phaseOverlay: overlay,
      phaseCircle: circle,
      phaseContent: content,
    };
    const timers = {
      setTimeout: vi.fn((handler) => handler()),
      setInterval: vi.fn(),
    };
    const selectedChar = {
      accent: '#7CC8FF',
      color: '#123456',
      glow: '#7CC8FF',
      emoji: 'P',
      name: 'Paladin',
      title: '찬송기사',
      traitName: '성가',
      tags: [],
      startRelic: { icon: '*', name: 'Halo' },
      story: '',
    };

    renderCharacterPhase({
      state: { phase: 'select' },
      selectedChar,
      resolveById: (id) => nodes[id] || null,
      timers,
    });
    expect(overlay.style.display).toBe('none');

    renderCharacterPhase({
      state: { phase: 'burst' },
      selectedChar,
      resolveById: (id) => nodes[id] || null,
      timers,
    });
    expect(overlay.className).toBe('burst');
    expect(circle.style.width).toBe('250vw');
    expect(content.innerHTML).toBe('');
  });
});
