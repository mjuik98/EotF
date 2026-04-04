import { describe, expect, it, vi } from 'vitest';

import {
  buildRoadmapPreviewMeta,
  buildDeckCardMarkup,
  buildFeatureSectionMarkup,
  buildInteractiveDeckCardMarkup,
  buildLockedStateMarkup,
  buildRelicMarkup,
  buildRoadmapSummaryMarkup,
} from '../game/features/title/platform/browser/character_select_info_panel_markup.js';
import {
  arraysEqual,
  buildFeaturedCardMarkup,
  buildPlayStyleMarkup,
  normalizeRelicIds,
  resolveFeaturedCardIds,
  resolvePlayStyle,
} from '../game/features/title/platform/browser/character_select_info_panel_featured_content.js';
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

    expect(resolvePlayStyle({
      summaryText: '요약',
      selectionSummary: '선택 요약',
      desc: '설명',
    })).toEqual(['요약', '선택 요약']);

    expect(buildPlayStyleMarkup(['빠른 누적', '기절 연계'])).toContain('기절 연계');
    expect(normalizeRelicIds([{ id: 'starter' }, { name: 'Alpha' }], 'fallback')).toEqual(['starter', 'Alpha']);
    expect(arraysEqual(['a', 'b'], ['a', 'b'])).toBe(true);
    expect(arraysEqual(['a'], ['b'])).toBe(false);
    const deckMarkup = buildDeckCardMarkup(
      ['strike'],
      { strike: { name: '강타', desc: '피해 6' } },
      '#7cc8ff',
    );
    expect(deckMarkup).toContain('data-card-label="강타. 피해 6"');
    expect(deckMarkup).toContain('deck-card-basic');
    expect(deckMarkup).not.toContain('style=');

    const interactiveDeckMarkup = buildInteractiveDeckCardMarkup(
      ['strike'],
      { strike: { name: '강타', desc: '피해 6' } },
      '#7cc8ff',
      { upgradeIndices: [0] },
    );
    expect(interactiveDeckMarkup).toContain('level11-edit-card');
    expect(interactiveDeckMarkup).toContain('data-level11-selectable="true"');
    expect(interactiveDeckMarkup).not.toContain('style=');

    const relicMarkup = buildRelicMarkup(
      [{ icon: '🛡', name: '수호 인장', desc: '보호막 +8' }],
      '#7cc8ff',
    );
    expect(relicMarkup).toContain('relic-inner-title');
    expect(relicMarkup).toContain('relic-inner-meta');
    expect(relicMarkup).not.toContain('style=');

    const lockedStateMarkup = buildLockedStateMarkup({
      accent: '#7cc8ff',
      unlockLabel: 'Lv.12 해금',
      message: '추가 유물을 해금합니다.',
    });
    expect(lockedStateMarkup).toContain('char-locked-state');
    expect(lockedStateMarkup).toContain('char-feature-badge');
    expect(lockedStateMarkup).not.toContain('style=');

    const featureSectionMarkup = buildFeatureSectionMarkup({
      accent: '#7cc8ff',
      title: '추가 유물 선택',
      badgeLabel: '선택 가능',
      body: '<div class="char-info-text">설명</div>',
    });
    expect(featureSectionMarkup).toContain('char-feature-panel');
    expect(featureSectionMarkup).toContain('char-feature-panel-title');
    expect(featureSectionMarkup).not.toContain('style=');

    const roadmapSummaryMarkup = buildRoadmapSummaryMarkup('다음 해금: Lv.2 보상', '펼쳐서 확인');
    expect(roadmapSummaryMarkup).toContain('csm-roadmap-summary-copy');
    expect(roadmapSummaryMarkup).toContain('csm-roadmap-summary-preview');
    expect(roadmapSummaryMarkup).not.toContain('style=');
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
    const relicBadge = createNode();
    relicBadge.dataset.relicTitle = 'Relic';
    relicBadge.dataset.relicDesc = '피해 8';
    const deckCard = createNode();
    deckCard.dataset.cid = 'strike';
    deckCard.dataset.cardLabel = '강타. 피해 6';
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
        if (selector === '.relic-inner') return [relicBadge];
        if (selector === '.deck-card') return [deckCard];
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
    const gs = { getBuff: vi.fn(() => null), player: { echoChain: 2 } };
    const cardTooltipUI = {
      hideTooltip: vi.fn(),
      showTooltip: vi.fn(),
    };

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
      gs,
      hover: vi.fn(),
      echo: vi.fn(),
      openModal: vi.fn(),
      generalTooltipUI: {
        hideGeneralTooltip: vi.fn(),
        showGeneralTooltip: vi.fn(),
      },
      cardTooltipUI,
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

    relicBadge.listeners.focus({ type: 'focus' });
    deckCard.listeners.focus({ type: 'focus' });
    expect(relicBadge.setAttribute).toHaveBeenCalledWith('tabindex', '0');
    expect(deckCard.setAttribute).toHaveBeenCalledWith('tabindex', '0');
    expect(deckCard.setAttribute).toHaveBeenCalledWith('aria-label', '강타. 피해 6');
    expect(cardTooltipUI.showTooltip).toHaveBeenCalledWith(
      expect.anything(),
      'strike',
      expect.objectContaining({ gs }),
    );

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
