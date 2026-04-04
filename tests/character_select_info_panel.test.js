import { readFileSync } from 'node:fs';

import { describe, expect, it, vi } from 'vitest';
import { renderCharacterInfoPanel } from '../game/features/title/ports/public_character_select_presentation_capabilities.js';

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
    disabled: false,
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
    relicBadge.dataset.relicTitle = 'Relic';
    relicBadge.dataset.relicDesc = '피해 14. 잔향 20 충전 [소진]';
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
      echoSkill: { icon: '!', name: 'Echo', desc: '피해 14. 잔향 20 충전 [소진]', echoCost: 2 },
    };

    renderCharacterInfoPanel({
      panel,
      selectedChar,
      classProgress: { level: 1, totalXp: 0, nextLevelXp: 100, progress: 0.3 },
      roadmap: [{ lv: 2, icon: '+', desc: 'Unlock starter bonus.' }],
      unlockRoadmap: {
        account: [{
          contentType: 'curse',
          contentId: 'blood_moon',
          contentLabel: '핏빛 월식',
          requirementLabel: '첫 승리 필요',
          progressLabel: '0 / 1',
          achievementTitle: '첫 승리',
        }],
        class: [{
          contentType: 'card',
          contentId: 'judgement',
          contentLabel: '심판',
          requirementLabel: '찬송기사 숙련도 3 달성 필요',
          progressLabel: '1 / 3',
          achievementTitle: '성기사 숙련',
        }],
      },
      recentSummaries: [{
        outcome: 'victory',
        totalGain: 42,
        levelUps: [2],
        after: {
          totalXp: 142,
          level: 2,
        },
      }],
      pendingSummaryCount: 2,
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
    expect(panel.innerHTML).toContain('kw-dmg');
    expect(panel.innerHTML).toContain('kw-echo');
    expect(panel.innerHTML).toContain('kw-exhaust kw-block');
    expect(panel.innerHTML).toContain('플레이 감각');
    expect(panel.innerHTML).toContain('회복 반격형');
    expect(panel.innerHTML).toContain('시작 핵심 카드');
    expect(panel.innerHTML).toContain('기본기');
    expect(panel.innerHTML).toContain('시작 장비');
    expect(panel.innerHTML).toContain('다음 마스터리 해금');
    expect(panel.innerHTML).toContain('다음 해금: Lv.2 Unlock starter bonus.');
    expect(panel.innerHTML).not.toContain('해금 로드맵');
    expect(panel.innerHTML).not.toContain('핏빛 월식');
    expect(panel.innerHTML).not.toContain('심판');
    expect(panel.innerHTML).not.toContain('첫 승리 필요');
    expect(panel.innerHTML).not.toContain('찬송기사 숙련도 3 달성 필요');
    expect(panel.innerHTML).toContain('미확인 진행 기록 2건');
    expect(panel.innerHTML).toContain('최근 진행 기록');
    expect(panel.innerHTML).toContain('승리 · +42 XP · 레벨 2');
    expect(panel.innerHTML).toContain('펼쳐서 전체 해금 보상 보기');
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
    expect(typeof echoBadge.listeners.focus).toBe('function');
    expect(typeof echoBadge.listeners.blur).toBe('function');

    echoBadge.listeners.focus();
    expect(echoBadge.classList.contains('is-emphasized')).toBe(true);
    echoBadge.listeners.blur();
    expect(echoBadge.classList.contains('is-emphasized')).toBe(false);

    relicBadge.listeners.mouseenter({ type: 'mouseenter' });
    expect(generalTooltipUI.showGeneralTooltip).toHaveBeenCalledWith(
      expect.anything(),
      'Relic',
      '피해 14. 잔향 20 충전 [소진]',
      expect.any(Object),
    );
    relicBadge.listeners.focus({ type: 'focus' });

    deckCard.listeners.mouseenter({ type: 'mouseenter' });
    expect(cardTooltipUI.showTooltip).toHaveBeenCalledWith(
      expect.anything(),
      'strike',
      expect.objectContaining({ data: { cards: { strike: { name: 'Strike' } } } }),
    );
    deckCard.listeners.focus({ type: 'focus' });
    expect(relicBadge.setAttribute).toHaveBeenCalledWith('tabindex', '0');
    expect(deckCard.setAttribute).toHaveBeenCalledWith('tabindex', '0');
  });

  it('styles character echo descriptions with the shared keyword palette', () => {
    const css = readFileSync(new URL('../css/character_select_layout.css', import.meta.url), 'utf8');

    expect(css).toContain('.char-echo-desc .kw-dmg');
    expect(css).toContain('.char-echo-desc .kw-echo');
    expect(css).toContain('.char-echo-desc .kw-buff.kw-block');
  });

  it('renders mastery loadout controls and wires preset save actions', () => {
    const level11ModeUpgrade = createNode();
    const level11ModeSwap = createNode();
    const level11DeckCard0 = createNode();
    level11DeckCard0.dataset.level11Index = '0';
    level11DeckCard0.dataset.cid = 'strike';
    level11DeckCard0.dataset.level11Selectable = 'true';
    const level11DeckCard1 = createNode();
    level11DeckCard1.dataset.level11Index = '1';
    level11DeckCard1.dataset.cid = 'heavy_blow';
    level11DeckCard1.dataset.level11Selectable = 'true';
    const saveLevel11Upgrade = createNode();
    const saveLevel11Swap = createNode();
    const clearLevel11Preset = createNode();
    const saveLevel12Preset = createNode();
    const clearLevel12Preset = createNode();
    const slotButton1 = createNode();
    slotButton1.dataset.loadoutSlot = 'slot1';
    const slotButton2 = createNode();
    slotButton2.dataset.loadoutSlot = 'slot2';
    const level11AddCard = createNode();
    level11AddCard.dataset.level11AddCardId = 'blade_dance';
    const level12BonusRelic = createNode();
    level12BonusRelic.value = 'guardian_seal';

    const panel = {
      style: { setProperty: vi.fn() },
      innerHTML: '',
      querySelectorAll: vi.fn((selector) => {
        if (selector === '.char-info-tab' || selector === '.char-info-pane') {
          return [];
        }
        if (selector === '.level11-edit-card') {
          return [level11DeckCard0, level11DeckCard1];
        }
        if (selector === '.deck-card') {
          return [level11DeckCard0, level11DeckCard1];
        }
        if (selector === '.level11-mode-btn') {
          return [level11ModeUpgrade, level11ModeSwap];
        }
        if (selector === '.level11-add-card-btn') {
          return [level11AddCard];
        }
        if (selector === '.char-loadout-slot-btn') {
          return [slotButton1, slotButton2];
        }
        if (selector === '.level11-selection-note') {
          return [];
        }
        return [];
      }),
      querySelector: vi.fn((selector) => {
        if (selector === '#level11ModeUpgrade') return level11ModeUpgrade;
        if (selector === '#level11ModeSwap') return level11ModeSwap;
        if (selector === '#saveLevel11Upgrade') return saveLevel11Upgrade;
        if (selector === '#saveLevel11Swap') return saveLevel11Swap;
        if (selector === '#clearLevel11Preset') return clearLevel11Preset;
        if (selector === '#saveLevel12Preset') return saveLevel12Preset;
        if (selector === '#clearLevel12Preset') return clearLevel12Preset;
        if (selector === '#level12BonusRelic') return level12BonusRelic;
        return null;
      }),
    };

    const onSaveLoadoutPreset = vi.fn();
    const onClearLoadoutPreset = vi.fn();
    const onSelectLoadoutPresetSlot = vi.fn();
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
        activeSlot: 'slot2',
        availableSlots: [
          { id: 'slot1', label: '빌드 1', active: false, hasPreset: false },
          { id: 'slot2', label: '빌드 2', active: true, hasPreset: true },
          { id: 'slot3', label: '빌드 3', active: false, hasPreset: false },
        ],
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
      onSelectLoadoutPresetSlot,
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
    expect(panel.innerHTML).toContain('추가 유물');
    expect(panel.innerHTML).toContain('카드를 클릭해 대상을 지정하세요.');
    expect(panel.innerHTML).toContain('추가 카드 선택');
    expect(panel.innerHTML).not.toContain('level11SwapAdd');
    expect(panel.innerHTML).not.toContain('기본 시작 덱');
    expect(panel.innerHTML).not.toContain('적용 후 시작 덱');
    expect(panel.innerHTML).toContain('Heavy Blow');
    expect(panel.innerHTML).toContain('빌드 1');
    expect(panel.innerHTML).toContain('빌드 2');
    expect(panel.innerHTML).toContain('저장된 프리셋 일부를 현재 상태에서 적용할 수 없습니다.');
    expect(panel.innerHTML).toContain('모든 마스터리 보상 해금 완료');
    expect(panel.innerHTML).not.toContain('다음 해금: 모든 마스터리 보상 해금 완료');
    expect(panel.innerHTML).toContain('획득한 보상 다시 보기');
    expect(panel.innerHTML).toContain('추가 유물 선택');
    expect(panel.innerHTML).not.toContain('활성');
    expect(panel.innerHTML).not.toContain('Lv.11 해금');
    expect(panel.innerHTML).not.toContain('Lv.12 해금');
    expect(panel.innerHTML).not.toContain('교체 대상');
    expect(panel.innerHTML).not.toContain('강화 예정');
    expect(panel.innerHTML.indexOf('시작 덱')).toBeLessThan(panel.innerHTML.indexOf('강화로 저장'));
    expect(panel.innerHTML.indexOf('강화로 저장')).toBeLessThan(panel.innerHTML.indexOf('마스터리 커스터마이즈'));
    expect(saveLevel11Upgrade.disabled).toBe(true);
    expect(saveLevel11Swap.disabled).toBe(true);

    saveLevel11Upgrade.listeners.click();
    saveLevel11Swap.listeners.click();
    expect(onSaveLoadoutPreset).not.toHaveBeenCalled();

    level11ModeUpgrade.listeners.click();
    expect(saveLevel11Upgrade.disabled).toBe(true);
    slotButton1.listeners.click();
    level11DeckCard0.listeners.click();
    expect(saveLevel11Upgrade.disabled).toBe(false);
    saveLevel11Upgrade.listeners.click();
    level11ModeSwap.listeners.click();
    expect(saveLevel11Swap.disabled).toBe(true);
    level11DeckCard1.listeners.click();
    expect(saveLevel11Swap.disabled).toBe(true);
    level11AddCard.listeners.click();
    expect(saveLevel11Swap.disabled).toBe(false);
    saveLevel11Swap.listeners.click();
    clearLevel11Preset.listeners.click();
    saveLevel12Preset.listeners.click();
    clearLevel12Preset.listeners.click();

    expect(onSaveLoadoutPreset).toHaveBeenNthCalledWith(1, {
      slot: 'level11',
      type: 'upgrade',
      targetIndex: 0,
    });
    expect(onSelectLoadoutPresetSlot).toHaveBeenCalledWith('slot1');
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
      roadmap: [{ lv: 2, icon: '+', desc: 'Unlock starter bonus.' }],
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
    expect(panel.innerHTML).toContain('다음 마스터리 해금');
    expect(panel.innerHTML).toContain('다음 해금: Lv.2 Unlock starter bonus.');
    expect(panel.innerHTML).toContain('마스터리 커스터마이즈');
    expect(panel.innerHTML).toContain('Lv.11 해금');
    expect(panel.innerHTML).toContain('Lv.12 해금');
    expect(panel.innerHTML).toContain('추가 유물');
    expect(panel.innerHTML).toContain('미선택');
    expect(panel.innerHTML).toContain('Lv.12 달성 시 추가 유물이 해금됩니다.');
    expect(panel.innerHTML).toContain('Lv.11 달성 시 시작 덱 커스터마이즈가 해금됩니다.');
    expect(panel.innerHTML).not.toContain('시작 덱 요약');
    expect(panel.innerHTML).not.toContain('전투 성향');
    expect(panel.innerHTML).toContain('기본 시작 유물');
    expect(panel.innerHTML).not.toContain('적용 후 시작 유물');
    expect(panel.innerHTML).not.toContain('기본 시작 덱');
    expect(panel.innerHTML).not.toContain('적용 후 시작 덱');
  });
});
