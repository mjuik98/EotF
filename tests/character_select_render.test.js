import { describe, expect, it, vi } from 'vitest';
import {
  renderCharacterButtons,
  renderCharacterDots,
  updateCharacterArrows,
} from '../game/ui/title/character_select_render.js';

function createButton(label = '') {
  const listeners = {};
  const style = {};
  return {
    dataset: {},
    style,
    children: [],
    textContent: label,
    addEventListener: vi.fn((name, handler) => {
      listeners[name] = handler;
    }),
    listeners,
  };
}

function createClassList() {
  const set = new Set();
  return {
    add: (...tokens) => tokens.forEach((token) => set.add(token)),
    remove: (...tokens) => tokens.forEach((token) => set.delete(token)),
    contains: (token) => set.has(token),
  };
}

function createDotsRow() {
  const buttons = [];
  return {
    style: {},
    innerHTML: '',
    querySelectorAll: vi.fn((selector) => {
      if (selector === '.dot') return buttons;
      return [];
    }),
    setButtons(nextButtons) {
      buttons.length = 0;
      buttons.push(...nextButtons);
    },
  };
}

function createButtonsRow() {
  const confirmButton = createButton('confirm');
  return {
    style: {
      setProperty: vi.fn(),
    },
    innerHTML: '',
    children: [],
    querySelector: vi.fn((selector) => {
      if (selector === '#btnCfm') return confirmButton;
      return null;
    }),
    confirmButton,
  };
}

describe('character select render helpers', () => {
  it('renders dots and wires hover/click handlers', () => {
    const dotsRow = createDotsRow();
    const buttons = [0, 1, 2].map((i) => {
      const button = createButton();
      button.dataset.i = String(i);
      return button;
    });
    dotsRow.setButtons(buttons);
    const chars = [
      { accent: '#ff0000' },
      { accent: '#00ff00' },
      { accent: '#0000ff' },
    ];
    const onJumpTo = vi.fn();

    renderCharacterDots(dotsRow, chars, 1, onJumpTo);

    expect(dotsRow.style.display).toBe('flex');
    expect(dotsRow.innerHTML).toContain('data-i="1"');
    expect(buttons[0].addEventListener).toHaveBeenCalledWith('mouseenter', expect.any(Function));
    buttons[0].listeners.mouseenter();
    expect(buttons[0].style.background).toBe('#3a3a55');
    buttons[2].listeners.click();
    expect(onJumpTo).toHaveBeenCalledWith(2);
  });

  it('renders confirm button wiring through helper callbacks', () => {
    const buttonsRow = createButtonsRow();
    const onHover = vi.fn();
    const onConfirm = vi.fn();

    renderCharacterButtons(buttonsRow, { accent: '#ffd700', color: '#333', name: 'Paladin' }, onHover, onConfirm);

    expect(buttonsRow.style.setProperty).toHaveBeenCalledWith('--char-accent', '#ffd700');
    expect(buttonsRow.innerHTML).toContain('Paladin');
    buttonsRow.confirmButton.listeners.mouseenter();
    buttonsRow.confirmButton.listeners.click();
    expect(onHover).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('updates arrow button colors for the active accent', () => {
    const left = { style: {}, classList: createClassList() };
    const right = { style: {}, classList: createClassList() };
    const resolveById = (id) => ({ btnLeft: left, btnRight: right }[id] || null);

    updateCharacterArrows(resolveById, '#7CC8FF');

    expect(left.style.border).toBe('1px solid #7CC8FF44');
    expect(right.style.boxShadow).toBe('0 0 16px #7CC8FF22');
    expect(right.style.color).toBe('#7CC8FF');
  });
});
