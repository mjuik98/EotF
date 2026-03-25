import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  closeCharacterSkillModal,
  openCharacterSkillModal,
} from '../game/features/title/ports/public_character_select_presentation_capabilities.js';

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
        { tier: 'I', name: 'Pulse', bonus: '+1', desc: '피해 14. 잔향 20 충전 [소진]' },
        { tier: 'II', name: 'Wave', bonus: '+2', desc: '에너지 1 획득. 카드 2장 드로우' },
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
    expect(modalBox.innerHTML).toContain('잔향 기술 계보');
    expect(modalBox.innerHTML).toContain('Echo Burst');
    expect(modalBox.innerHTML).toContain('Pulse');
    expect(modalBox.innerHTML).toContain('kw-dmg');
    expect(modalBox.innerHTML).toContain('kw-echo');
    expect(modalBox.innerHTML).toContain('kw-energy');
    expect(modalBox.innerHTML).toContain('kw-draw');
    expect(modalBox.innerHTML).toContain('character-skill-tier-desc is-active');
    expect(modalBox.innerHTML).toContain('character-skill-tier-desc is-muted');
    expect(modalBox.innerHTML).toContain('character-skill-modal-close');
    expect(modalBox.innerHTML).toContain('aria-label="닫기"');
    expect(modalBox.innerHTML).toContain('ESC로 닫기');
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

  it('styles character skill modal descriptions with the shared keyword palette', () => {
    const css = readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');

    expect(css).toContain('.character-skill-tier-desc {');
    expect(css).toContain('.character-skill-tier-desc.is-active {');
    expect(css).toContain('.character-skill-modal-close:focus-visible {');
    expect(css).toContain('.character-skill-tier-desc .kw-dmg');
    expect(css).toContain('.character-skill-tier-desc .kw-energy');
    expect(css).toContain('.character-skill-tier-desc .kw-exhaust.kw-block');
  });
});
