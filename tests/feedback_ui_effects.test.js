import { describe, expect, it, vi } from 'vitest';

import {
  showCardPlayEffectOverlay,
  showChainAnnounceEffect,
  showDmgPopupEffect,
  showNamedOverlay,
  showShieldBlockEffectOverlay,
} from '../game/features/combat/public.js';

function createMockElement(tag = 'div') {
  return {
    tagName: String(tag).toUpperCase(),
    children: [],
    style: {},
    className: '',
    innerHTML: '',
    textContent: '',
    dataset: {},
    offsetHeight: 80,
    append(...nodes) {
      this.children.push(...nodes);
    },
    appendChild(node) {
      this.children.push(node);
      return node;
    },
    remove() {
      this.removed = true;
    },
    animate: vi.fn(),
    getBoundingClientRect: () => ({ left: 320, top: 120, width: 80, height: 100 }),
  };
}

function createMockDoc() {
  const body = createMockElement('body');
  const overlay = createMockElement('div');
  return {
    body,
    overlay,
    createElement: vi.fn((tag) => createMockElement(tag)),
    getElementById: vi.fn((id) => {
      if (id === 'hudOverlay') return overlay;
      if (id === 'enemy_0') return createMockElement('div');
      return null;
    }),
  };
}

describe('feedback_ui_effects', () => {
  it('renders damage popup and named overlays onto the HUD overlay', () => {
    vi.useFakeTimers();
    const doc = createMockDoc();

    try {
      expect(showDmgPopupEffect(12, 100, 140, '#fff', { doc })).toBe(true);
      expect(showNamedOverlay('echo-burst-overlay', 800, { doc })).toBe(true);
      expect(doc.overlay.children[0].className).toBe('dmg-popup');
      expect(doc.overlay.children[1].className).toBe('echo-burst-overlay');
    } finally {
      vi.runAllTimers();
      vi.useRealTimers();
    }
  });

  it('renders shield block and chain announce effects', () => {
    vi.useFakeTimers();
    const doc = createMockDoc();

    try {
      expect(showShieldBlockEffectOverlay({ doc })).toBe(true);
      expect(showChainAnnounceEffect('CHAIN 5', { doc })).toBe(true);
      expect(doc.overlay.children[0].animate).toHaveBeenCalledTimes(1);
      expect(doc.body.children[0].textContent).toBe('CHAIN 5');
    } finally {
      vi.runAllTimers();
      vi.useRealTimers();
    }
  });

  it('routes card play audio and mounts flash/name effects', () => {
    vi.useFakeTimers();
    const doc = createMockDoc();
    const win = {
      innerWidth: 1280,
      innerHeight: 720,
      requestAnimationFrame: (callback) => callback(),
    };
    const audioEngine = {
      playHit: vi.fn(),
      playSkill: vi.fn(),
      playEcho: vi.fn(),
      playCard: vi.fn(),
    };

    try {
      expect(showCardPlayEffectOverlay({
        type: 'ATTACK',
        icon: 'A',
        name: 'Strike',
        desc: '피해 6',
      }, {
        doc,
        win,
        audioEngine,
        gs: { combat: { enemies: [{ hp: 10 }] } },
      })).toBe(true);

      expect(audioEngine.playHit).toHaveBeenCalledTimes(1);
      expect(doc.overlay.children[0].className).toContain('card-flash-overlay');
      expect(doc.body.children[0].textContent).toBe('A Strike');
    } finally {
      vi.runAllTimers();
      vi.useRealTimers();
    }
  });
});
