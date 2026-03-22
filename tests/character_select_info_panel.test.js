import { describe, expect, it, vi } from 'vitest';
import { renderCharacterInfoPanel } from '../game/ui/title/character_select_info_panel.js';

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

describe('character_select_info_panel', () => {
  it('renders info panel content and wires tabs/tooltips', () => {
    const summaryTab = createNode();
    summaryTab.dataset.tab = 'summary';
    summaryTab.classList.add('is-active');
    const detailsTab = createNode();
    detailsTab.dataset.tab = 'details';
    const summaryPane = createNode();
    summaryPane.dataset.pane = 'summary';
    summaryPane.classList.add('is-active');
    const detailsPane = createNode();
    detailsPane.dataset.pane = 'details';
    const echoBadge = createNode();
    const relicBadge = createNode();
    const deckCard = createNode();
    deckCard.dataset.cid = 'strike';

    const panel = {
      style: { setProperty: vi.fn() },
      innerHTML: '',
      querySelectorAll: vi.fn((selector) => {
        if (selector === '.char-info-tab') return [summaryTab, detailsTab];
        if (selector === '.char-info-pane') return [summaryPane, detailsPane];
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
      playStyle: ['회복 반격형', '지속 유지력'],
      featuredCardIds: ['strike'],
      featuredCardTags: { strike: '기본기' },
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
    expect(panel.innerHTML).toContain('고유 특성');
    expect(panel.innerHTML).toContain('에코 스킬');
    expect(panel.innerHTML).toContain('플레이 감각');
    expect(panel.innerHTML).toContain('회복 반격형');
    expect(panel.innerHTML).toContain('시작 핵심 카드');
    expect(panel.innerHTML).toContain('기본기');
    expect(panel.innerHTML).toContain('시작 장비');
    expect(panel.innerHTML).not.toContain('전투 성향');
    expect(panel.innerHTML).not.toContain('시작 덱 요약');

    detailsTab.listeners.click();
    expect(hover).toHaveBeenCalledTimes(1);
    expect(detailsTab.classList.contains('is-active')).toBe(true);
    expect(detailsPane.classList.contains('is-active')).toBe(true);
    expect(summaryPane.classList.contains('is-active')).toBe(false);

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

  it('renders mastery loadout controls and wires preset save actions', () => {
    const saveLevel11Upgrade = createNode();
    const saveLevel11Swap = createNode();
    const clearLevel11Preset = createNode();
    const saveLevel12Preset = createNode();
    const clearLevel12Preset = createNode();
    const level11UpgradeTarget = createNode();
    level11UpgradeTarget.value = '0';
    const level11SwapRemove = createNode();
    level11SwapRemove.value = '1';
    const level11SwapAdd = createNode();
    level11SwapAdd.value = 'blade_dance';
    const level12BonusRelic = createNode();
    level12BonusRelic.value = 'guardian_seal';

    const panel = {
      style: { setProperty: vi.fn() },
      innerHTML: '',
      querySelectorAll: vi.fn((selector) => {
        if (selector === '.char-info-tab' || selector === '.char-info-pane' || selector === '.deck-card') {
          return [];
        }
        return [];
      }),
      querySelector: vi.fn((selector) => {
        if (selector === '#saveLevel11Upgrade') return saveLevel11Upgrade;
        if (selector === '#saveLevel11Swap') return saveLevel11Swap;
        if (selector === '#clearLevel11Preset') return clearLevel11Preset;
        if (selector === '#saveLevel12Preset') return saveLevel12Preset;
        if (selector === '#clearLevel12Preset') return clearLevel12Preset;
        if (selector === '#level11UpgradeTarget') return level11UpgradeTarget;
        if (selector === '#level11SwapRemove') return level11SwapRemove;
        if (selector === '#level11SwapAdd') return level11SwapAdd;
        if (selector === '#level12BonusRelic') return level12BonusRelic;
        return null;
      }),
    };

    const onSaveLoadoutPreset = vi.fn();
    const onClearLoadoutPreset = vi.fn();
    const selectedChar = {
      accent: '#7cc8ff',
      color: '#13354b',
      name: 'Swordsman',
      title: '잔향검사',
      traitTitle: '공명',
      traitDesc: '카드를 사용할수록 공명이 커진다.',
      stats: { HP: 80, ATK: 60, DEF: 70, ECH: 55, RHY: 45, RES: 65 },
      startRelic: { icon: '*', name: 'Dull Blade', desc: 'Starter relic.' },
      startDeck: ['strike', 'heavy_blow'],
      playStyle: ['연속 압박형', '강화 연계'],
      featuredCardIds: ['strike', 'heavy_blow'],
      featuredCardTags: { strike: '기본기', heavy_blow: '마무리' },
      echoSkill: { icon: '!', name: 'Echo', desc: 'Burst.', echoCost: 2 },
    };

    renderCharacterInfoPanel({
      panel,
      selectedChar,
      classProgress: { level: 12, totalXp: 2200, nextLevelXp: null, progress: 1 },
      roadmap: [],
      buildSectionLabel: (label) => `<span>${label}</span>`,
      buildRadar: () => '<svg>radar</svg>',
      cards: {
        strike: { name: 'Strike' },
        heavy_blow: { name: 'Heavy Blow' },
        blade_dance: { name: 'Blade Dance' },
      },
      generalTooltipUI: {
        hideGeneralTooltip: vi.fn(),
        showGeneralTooltip: vi.fn(),
      },
      cardTooltipUI: {
        hideTooltip: vi.fn(),
        showTooltip: vi.fn(),
      },
      loadoutCustomization: {
        level11Unlocked: true,
        level12Unlocked: true,
        level11Preset: { type: 'swap', removeIndex: 1, removeCardId: 'heavy_blow', addCardId: 'blade_dance' },
        level12Preset: { bonusRelicId: 'guardian_seal' },
        hasInvalidPreset: true,
        invalidWarnings: ['저장된 프리셋 일부를 현재 상태에서 적용할 수 없습니다.'],
        previewDeck: ['strike', 'blade_dance'],
        previewRelics: [
          { id: 'dull_blade', icon: '*', name: 'Dull Blade', desc: 'Starter relic.' },
          { id: 'guardian_seal', icon: '#', name: 'Guardian Seal', desc: 'Bonus relic.' },
        ],
        eligibleUpgradeTargets: [{ index: 0, cardId: 'strike' }],
        eligibleSwapRemoveTargets: [
          { index: 0, cardId: 'strike' },
          { index: 1, cardId: 'heavy_blow' },
        ],
        eligibleSwapAddCards: [{ cardId: 'blade_dance', name: 'Blade Dance' }],
        eligibleBonusRelics: [{ id: 'guardian_seal', name: 'Guardian Seal' }],
      },
      onSaveLoadoutPreset,
      onClearLoadoutPreset,
      doc: {},
      win: {},
      hover: vi.fn(),
      echo: vi.fn(),
      openModal: vi.fn(),
    });

    expect(panel.innerHTML).toContain('마스터리 커스터마이즈');
    expect(panel.innerHTML).toContain('Guardian Seal');
    expect(panel.innerHTML).toContain('Blade Dance');
    expect(panel.innerHTML).toContain('플레이 감각');
    expect(panel.innerHTML).toContain('연속 압박형');
    expect(panel.innerHTML).toContain('마무리');
    expect(panel.innerHTML).toContain('기본 시작 유물');
    expect(panel.innerHTML).toContain('적용 후 시작 유물');
    expect(panel.innerHTML).toContain('기본 시작 덱');
    expect(panel.innerHTML).toContain('적용 후 시작 덱');
    expect(panel.innerHTML).toContain('Heavy Blow');
    expect(panel.innerHTML).toContain('저장된 프리셋 일부를 현재 상태에서 적용할 수 없습니다.');

    saveLevel11Upgrade.listeners.click();
    saveLevel11Swap.listeners.click();
    clearLevel11Preset.listeners.click();
    saveLevel12Preset.listeners.click();
    clearLevel12Preset.listeners.click();

    expect(onSaveLoadoutPreset).toHaveBeenNthCalledWith(1, {
      slot: 'level11',
      type: 'upgrade',
      targetIndex: 0,
    });
    expect(onSaveLoadoutPreset).toHaveBeenNthCalledWith(2, {
      slot: 'level11',
      type: 'swap',
      removeIndex: 1,
      addCardId: 'blade_dance',
    });
    expect(onClearLoadoutPreset).toHaveBeenNthCalledWith(1, 'level11');
    expect(onSaveLoadoutPreset).toHaveBeenNthCalledWith(3, {
      slot: 'level12',
      bonusRelicId: 'guardian_seal',
    });
    expect(onClearLoadoutPreset).toHaveBeenNthCalledWith(2, 'level12');
  });

  it('keeps the simple loadout preview when no preset is applied', () => {
    const panel = {
      style: { setProperty: vi.fn() },
      innerHTML: '',
      querySelectorAll: vi.fn(() => []),
      querySelector: vi.fn(() => null),
    };

    const selectedChar = {
      accent: '#ffd700',
      color: '#5a4500',
      name: 'Paladin',
      title: '찬송기사',
      traitTitle: '성가',
      traitDesc: '치유가 공격으로 전환된다.',
      stats: { HP: 80, ATK: 60, DEF: 70, ECH: 55, RHY: 45, RES: 65 },
      startRelic: { id: 'halo', icon: '*', name: 'Halo', desc: 'Heal bonus.' },
      startDeck: ['strike'],
      playStyle: ['회복 반격형'],
      featuredCardIds: ['strike'],
      featuredCardTags: { strike: '기본기' },
      echoSkill: { icon: '!', name: 'Echo', desc: 'Burst.', echoCost: 2 },
    };

    renderCharacterInfoPanel({
      panel,
      selectedChar,
      classProgress: { level: 1, totalXp: 0, nextLevelXp: 100, progress: 0.3 },
      roadmap: [],
      buildSectionLabel: (label) => `<span>${label}</span>`,
      buildRadar: () => '<svg>radar</svg>',
      cards: { strike: { name: 'Strike' } },
      generalTooltipUI: {
        hideGeneralTooltip: vi.fn(),
        showGeneralTooltip: vi.fn(),
      },
      cardTooltipUI: {
        hideTooltip: vi.fn(),
        showTooltip: vi.fn(),
      },
      loadoutCustomization: {
        level11Unlocked: false,
        level12Unlocked: false,
        level11Preset: null,
        level12Preset: null,
        previewDeck: ['strike'],
        previewRelics: [{ id: 'halo', icon: '*', name: 'Halo', desc: 'Heal bonus.' }],
        eligibleUpgradeTargets: [],
        eligibleSwapRemoveTargets: [],
        eligibleSwapAddCards: [],
        eligibleBonusRelics: [],
      },
      doc: {},
      win: {},
      hover: vi.fn(),
      echo: vi.fn(),
      openModal: vi.fn(),
    });

    expect(panel.innerHTML).toContain('시작 유물');
    expect(panel.innerHTML).toContain('시작 핵심 카드');
    expect(panel.innerHTML).toContain('플레이 감각');
    expect(panel.innerHTML).toContain('기본기');
    expect(panel.innerHTML).not.toContain('시작 덱 요약');
    expect(panel.innerHTML).not.toContain('전투 성향');
    expect(panel.innerHTML).not.toContain('기본 시작 유물');
    expect(panel.innerHTML).not.toContain('적용 후 시작 유물');
    expect(panel.innerHTML).not.toContain('기본 시작 덱');
    expect(panel.innerHTML).not.toContain('적용 후 시작 덱');
  });
});
