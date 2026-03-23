import { describe, expect, it, vi } from 'vitest';

import {
  buildRoadmapPreviewMeta,
  buildFeaturedCardMarkup,
  resolveFeaturedCardIds,
} from '../game/features/title/platform/browser/character_select_info_panel_markup.js';
import { bindCharacterInfoPanelInteractions } from '../game/features/title/platform/browser/character_select_info_panel_interactions.js';

function createClassList(initial = []) {
  const set = new Set(initial);
  return {
    add: (...tokens) => tokens.forEach((token) => set.add(token)),
    contains: (token) => set.has(token),
    toggle: (token, force) => {
      if (force === undefined) {
        if (set.has(token)) set.delete(token);
        else set.add(token);
        return;
      }
      if (force) set.add(token);
      else set.delete(token);
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
    addEventListener: vi.fn((name, handler) => {
      listeners[name] = handler;
    }),
    setAttribute: vi.fn(),
    querySelector: vi.fn(() => null),
    listeners,
  };
}

describe('character_select_info_panel helpers', () => {
  it('builds roadmap and featured-card markup from focused helper modules', () => {
    expect(buildRoadmapPreviewMeta([], { level: 12 })).toEqual({
      previewText: '모든 마스터리 보상 해금 완료',
      summaryHint: '획득한 보상 다시 보기',
    });

    expect(resolveFeaturedCardIds({
      startDeck: ['strike', 'defend', 'heavy_blow', 'heavy_blow'],
    })).toEqual(['heavy_blow']);

    expect(buildFeaturedCardMarkup(
      ['heavy_blow'],
      { heavy_blow: { name: 'Heavy Blow', type: 'ATTACK', desc: '기절을 부여합니다.' } },
      '#7cc8ff',
      {},
    )).toContain('마무리');
  });

  it('binds tab and loadout interactions through the extracted interaction helper', () => {
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

    const level11ModeUpgrade = createNode();
    const level11ModeSwap = createNode();
    const level11SelectionNote = createNode();
    const level11DeckCard0 = createNode();
    level11DeckCard0.dataset.level11Index = '0';
    level11DeckCard0.dataset.level11Selectable = 'true';
    const level11DeckCard1 = createNode();
    level11DeckCard1.dataset.level11Index = '1';
    level11DeckCard1.dataset.level11Selectable = 'true';
    const level11AddCard = createNode();
    level11AddCard.dataset.level11AddCardId = 'blade_dance';
    const saveLevel11Upgrade = createNode();
    const saveLevel11Swap = createNode();
    const clearLevel11Preset = createNode();
    const saveLevel12Preset = createNode();
    const clearLevel12Preset = createNode();
    const level12BonusRelic = { value: 'guardian_seal' };

    const panel = {
      querySelectorAll: vi.fn((selector) => {
        if (selector === '.char-info-tab') return [summaryTab, detailsTab];
        if (selector === '.char-info-pane') return [summaryPane, detailsPane];
        if (selector === '.relic-inner') return [];
        if (selector === '.deck-card') return [];
        if (selector === '.level11-edit-card') return [level11DeckCard0, level11DeckCard1];
        if (selector === '.level11-add-card-btn') return [level11AddCard];
        return [];
      }),
      querySelector: vi.fn((selector) => {
        if (selector === '#level11ModeUpgrade') return level11ModeUpgrade;
        if (selector === '#level11ModeSwap') return level11ModeSwap;
        if (selector === '#level11SelectionNote') return level11SelectionNote;
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

    bindCharacterInfoPanelInteractions({
      panel,
      selectedChar: {
        accent: '#7cc8ff',
        color: '#13354b',
        echoSkill: { icon: '!', name: 'Echo', desc: 'Burst.', echoCost: 2 },
      },
      cards: {},
      doc: {},
      win: {},
      hover: vi.fn(),
      echo: vi.fn(),
      openModal: vi.fn(),
      generalTooltipUI: {
        hideGeneralTooltip: vi.fn(),
        showGeneralTooltip: vi.fn(),
      },
      cardTooltipUI: {
        hideTooltip: vi.fn(),
        showTooltip: vi.fn(),
      },
      loadoutState: {
        initialLevel11Mode: 'upgrade',
        initialLevel11UpgradeIndex: null,
        initialLevel11SwapIndex: null,
      },
      onSaveLoadoutPreset,
      onClearLoadoutPreset,
    });

    detailsTab.listeners.click();
    expect(detailsTab.classList.contains('is-active')).toBe(true);
    expect(detailsPane.classList.contains('is-active')).toBe(true);

    level11DeckCard0.listeners.click();
    expect(saveLevel11Upgrade.disabled).toBe(false);
    saveLevel11Upgrade.listeners.click();
    expect(onSaveLoadoutPreset).toHaveBeenCalledWith({
      slot: 'level11',
      type: 'upgrade',
      targetIndex: 0,
    });

    level11ModeSwap.listeners.click();
    level11DeckCard1.listeners.click();
    level11AddCard.listeners.click();
    expect(saveLevel11Swap.disabled).toBe(false);
    saveLevel11Swap.listeners.click();
    clearLevel11Preset.listeners.click();
    saveLevel12Preset.listeners.click();
    clearLevel12Preset.listeners.click();

    expect(onSaveLoadoutPreset).toHaveBeenCalledWith({
      slot: 'level11',
      type: 'swap',
      removeIndex: 1,
      addCardId: 'blade_dance',
    });
    expect(onSaveLoadoutPreset).toHaveBeenCalledWith({
      slot: 'level12',
      bonusRelicId: 'guardian_seal',
    });
    expect(onClearLoadoutPreset).toHaveBeenNthCalledWith(1, 'level11');
    expect(onClearLoadoutPreset).toHaveBeenNthCalledWith(2, 'level12');
  });
});
