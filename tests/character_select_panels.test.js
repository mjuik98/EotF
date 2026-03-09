import { describe, expect, it, vi } from 'vitest';
import {
  renderCharacterInfoPanel,
  renderCharacterPhase,
} from '../game/ui/title/character_select_panels.js';

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
    setAttribute: vi.fn(),
    listeners,
  };
}

describe('character select panels', () => {
  it('renders info panel content and wires tabs/tooltips', () => {
    const masteryTab = createNode();
    masteryTab.dataset.tab = 'mastery';
    masteryTab.classList.add('is-active');
    const loadoutTab = createNode();
    loadoutTab.dataset.tab = 'loadout';
    const masteryPane = createNode();
    masteryPane.dataset.pane = 'mastery';
    masteryPane.classList.add('is-active');
    const loadoutPane = createNode();
    loadoutPane.dataset.pane = 'loadout';
    const echoBadge = createNode();
    const relicBadge = createNode();
    const deckCard = createNode();
    deckCard.dataset.cid = 'strike';

    const panel = {
      style: { setProperty: vi.fn() },
      innerHTML: '',
      querySelectorAll: vi.fn((selector) => {
        if (selector === '.char-info-tab') return [masteryTab, loadoutTab];
        if (selector === '.char-info-pane') return [masteryPane, loadoutPane];
        if (selector === '.deck-card') return [deckCard];
        return [];
      }),
      querySelector: vi.fn((selector) => {
        if (selector === '#echoBadge') return echoBadge;
        if (selector === '.relic-inner') return relicBadge;
        return null;
      }),
    };

    const hover = vi.fn();
    const echo = vi.fn();
    const openModal = vi.fn();
    const generalTooltipUI = {
      hideGeneralTooltip: vi.fn(),
      showGeneralTooltip: vi.fn(),
    };
    const cardTooltipUI = {
      hideTooltip: vi.fn(),
      showTooltip: vi.fn(),
    };
    const selectedChar = {
      accent: '#ffd700',
      color: '#5a4500',
      name: 'Paladin',
      title: '찬송기사',
      traitTitle: '성가',
      traitDesc: '치유가 공격으로 전환된다.',
      stats: { HP: 80, ATK: 60, DEF: 70, ECH: 55, RHY: 45, RES: 65 },
      startRelic: { icon: '*', name: 'Halo', desc: 'Heal bonus.' },
      startDeck: ['strike'],
      echoSkill: { icon: '!', name: 'Echo', desc: 'Burst.', echoCost: 2 },
    };

    renderCharacterInfoPanel({
      panel,
      selectedChar,
      classProgress: { level: 1, totalXp: 0, nextLevelXp: 100, progress: 0.3 },
      roadmap: [{ lv: 1, icon: '+', desc: 'Unlock starter bonus.' }],
      buildSectionLabel: (label) => `<span>${label}</span>`,
      buildRadar: () => '<svg>radar</svg>',
      cards: { strike: { name: 'Strike' } },
      generalTooltipUI,
      cardTooltipUI,
      doc: {},
      win: {},
      hover,
      echo,
      openModal,
    });

    expect(panel.style.setProperty).toHaveBeenCalledWith('--char-accent', '#ffd700');
    expect(panel.innerHTML).toContain('Echo');
    expect(panel.innerHTML).toContain('Strike');

    loadoutTab.listeners.click();
    expect(hover).toHaveBeenCalledTimes(1);
    expect(loadoutTab.classList.contains('is-active')).toBe(true);
    expect(loadoutPane.classList.contains('is-active')).toBe(true);
    expect(masteryPane.classList.contains('is-active')).toBe(false);

    echoBadge.listeners.click();
    expect(echo).toHaveBeenCalledTimes(1);
    expect(openModal).toHaveBeenCalledWith(selectedChar.echoSkill, selectedChar.accent);

    relicBadge.listeners.mouseenter({ type: 'mouseenter' });
    expect(generalTooltipUI.showGeneralTooltip).toHaveBeenCalled();

    deckCard.listeners.mouseenter({ type: 'mouseenter' });
    expect(cardTooltipUI.showTooltip).toHaveBeenCalledWith(
      expect.anything(),
      'strike',
      expect.objectContaining({ data: { cards: { strike: { name: 'Strike' } } } }),
    );
  });

  it('renders done phase, types story text, and wires end-state buttons', () => {
    const overlay = createNode();
    const circle = createNode();
    const content = createNode();
    const typedArea = createNode();
    const reselectButton = createNode();
    const startButton = createNode();
    const nodes = {
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

    reselectButton.listeners.click();
    expect(state.phase).toBe('select');
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
