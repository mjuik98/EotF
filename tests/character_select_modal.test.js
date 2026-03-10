import { describe, expect, it, vi } from 'vitest';
import {
  closeCharacterSkillModal,
  openCharacterSkillModal,
} from '../game/ui/title/character_select_modal.js';

function createClassList() {
  const set = new Set();
  return {
    add: (...tokens) => tokens.forEach((token) => set.add(token)),
    remove: (...tokens) => tokens.forEach((token) => set.delete(token)),
    contains: (token) => set.has(token),
  };
}

function createNode() {
  const listeners = {};
  return {
    style: {},
    innerHTML: '',
    classList: createClassList(),
    addEventListener: vi.fn((name, handler) => {
      listeners[name] = handler;
    }),
    listeners,
  };
}

describe('character select modal helper', () => {
  it('renders echo skill modal markup and wires close handlers', () => {
    const state = { activeSkill: null };
    const modalBox = createNode();
    const modal = createNode();
    const closeButton = createNode();
    const onClose = vi.fn();
    const nodes = {
      modalBox,
      skillModal: modal,
      modalClose: closeButton,
    };
    const skill = {
      icon: '!',
      name: 'Echo Burst',
      echoCost: 2,
      tree: [
        { tier: 'I', name: 'Pulse', bonus: '+1', desc: 'Ping' },
        { tier: 'II', name: 'Wave', bonus: '+2', desc: 'Blast' },
      ],
    };

    openCharacterSkillModal({
      skill,
      accent: '#7CC8FF',
      state,
      resolveById: (id) => nodes[id] || null,
      onClose,
    });

    expect(state.activeSkill).toBe(skill);
    expect(modalBox.style.border).toBe('1px solid #7CC8FF33');
    expect(modalBox.innerHTML).toContain('ECHO SKILL TREE');
    expect(modalBox.innerHTML).toContain('Echo Burst');
    expect(modalBox.innerHTML).toContain('Pulse');
    expect(modal.classList.contains('open')).toBe(true);

    closeButton.listeners.click();
    expect(onClose).toHaveBeenCalledTimes(1);

    modal.listeners.click({ target: modal });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('clears active skill and closes the modal', () => {
    const state = { activeSkill: { name: 'stale' } };
    const modal = createNode();

    closeCharacterSkillModal({
      state,
      resolveById: (id) => (id === 'skillModal' ? modal : null),
    });

    expect(state.activeSkill).toBe(null);
    expect(modal.classList.contains('open')).toBe(false);
  });
});
