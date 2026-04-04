import {
  buildDeckCardMarkup,
  buildFeatureSectionMarkup,
  buildInteractiveDeckCardMarkup,
  buildLevel11PresetSummary,
  buildLockedStateMarkup,
  buildRelicMarkup,
  buildRoadmapSummaryMarkup,
} from './character_select_info_panel_markup.js';
import {
  buildLoadoutSlotButtons,
  buildRecentSummaryRows,
  buildRoadmapRows,
} from './character_select_info_panel_section_helpers.js';

export function buildCharacterInfoDetailsSection({
  selectedChar,
  classProgress,
  roadmap,
  buildSectionLabel,
  buildRadar,
  cards,
  roadmapPreviewText,
  roadmapSummaryHint,
  baseRelics,
  bonusRelics,
  baseDeck,
  eligibleUpgradeIndices,
  eligibleSwapIndices,
  initialLevel11Mode,
  initialLevel11UpgradeIndex,
  initialLevel11SwapIndex,
  level11Unlocked,
  level12Unlocked,
  level12Summary,
  loadoutCustomization,
  recentSummaries,
} = {}) {
  const roadmapRows = buildRoadmapRows(roadmap, classProgress);

  return `
    <section class="char-info-pane" data-pane="details" role="tabpanel">
      <div class="csm-mastery-panel">
        <div class="csm-mastery-head">
          <div>
            <div class="csm-mastery-title">클래스 숙련도</div>
            <div class="csm-mastery-level">${classProgress.nextLevelXp === null ? 'MAX' : `Lv.${classProgress.level}`}</div>
          </div>
          <div class="csm-mastery-xp">
            ${classProgress.nextLevelXp === null ? '최고 레벨' : `${classProgress.totalXp} / ${classProgress.nextLevelXp} 경험치`}
          </div>
        </div>
        <div class="csm-mastery-bar">
          <div class="csm-mastery-fill"></div>
        </div>
        <details class="csm-roadmap-details">
          <summary class="csm-roadmap-summary">${buildRoadmapSummaryMarkup(roadmapPreviewText, roadmapSummaryHint)}</summary>
          <div class="csm-roadmap">${roadmapRows}</div>
        </details>
      </div>

      <div class="char-loadout-grid">
        <div class="char-info-block">
          ${buildSectionLabel('스탯', selectedChar.accent)}
          <div class="char-radar-wrap">${buildRadar(selectedChar.stats, selectedChar.accent, null, 210)}</div>
        </div>

        <div class="char-info-block">
          ${buildSectionLabel('시작 유물', selectedChar.accent)}
          <div class="char-info-text">기본 시작 유물</div>
          ${buildRelicMarkup(baseRelics, selectedChar.accent)}
          <div class="char-info-text char-info-text--section-gap">추가 유물</div>
          ${level12Unlocked
    ? (bonusRelics.length > 0
      ? buildRelicMarkup(bonusRelics, selectedChar.accent, { slotOffset: 1 })
      : buildLockedStateMarkup({
        accent: selectedChar.accent,
        unlockLabel: '선택 가능',
        message: '추가 유물을 아직 선택하지 않았습니다.',
        unlocked: true,
      }))
    : buildLockedStateMarkup({
      accent: selectedChar.accent,
      unlockLabel: 'Lv.12 해금',
      message: 'Lv.12 달성 시 추가 유물이 해금됩니다.',
    })}
        </div>
      </div>

      <div class="char-info-block">
        ${buildSectionLabel('최근 진행 기록', selectedChar.accent)}
        <div class="char-info-stack">
          ${buildRecentSummaryRows(recentSummaries)}
        </div>
      </div>

      <div class="char-info-block">
        ${buildSectionLabel('시작 덱', selectedChar.accent)}
        ${buildLoadoutSlotButtons(loadoutCustomization, selectedChar.accent)}
        ${level11Unlocked ? `
          <div class="char-info-text">카드를 클릭해 대상을 지정하세요.</div>
          <div class="char-start-deck char-info-chip-row">
            <button id="level11ModeUpgrade" class="level11-mode-btn char-chip-button${initialLevel11Mode === 'upgrade' ? ' is-active' : ''}" type="button" aria-pressed="${initialLevel11Mode === 'upgrade' ? 'true' : 'false'}">강화</button>
            <button id="level11ModeSwap" class="level11-mode-btn char-chip-button${initialLevel11Mode === 'swap' ? ' is-active' : ''}" type="button" aria-pressed="${initialLevel11Mode === 'swap' ? 'true' : 'false'}">교체</button>
          </div>
          <div id="level11SelectionNote" class="char-info-text level11-selection-note">${initialLevel11Mode === 'swap' ? '교체할 카드를 선택한 뒤 추가 카드를 골라 저장하세요.' : '강화할 카드를 선택한 뒤 저장하세요.'}</div>
          ${buildInteractiveDeckCardMarkup(baseDeck, cards, selectedChar.accent, {
    upgradeIndices: eligibleUpgradeIndices,
    swapIndices: eligibleSwapIndices,
    mode: initialLevel11Mode,
    selectedUpgradeIndex: initialLevel11UpgradeIndex,
    selectedSwapIndex: initialLevel11SwapIndex,
  })}
          <div class="char-info-text char-info-text--section-gap">추가 카드 선택</div>
          <div class="char-start-deck char-info-chip-row">
            ${(loadoutCustomization?.eligibleSwapAddCards || []).map((entry) => `
              <button
                class="level11-add-card-btn char-chip-button"
                type="button"
                data-level11-add-card-id="${entry.cardId}"
                aria-pressed="false"
              >${entry.name || entry.cardId}</button>
            `).join('')}
          </div>
          <div class="char-start-deck char-start-deck--actions">
            <button id="saveLevel11Upgrade" class="char-action-btn" type="button">강화로 저장</button>
            <button id="saveLevel11Swap" class="char-action-btn" type="button">교체로 저장</button>
            <button id="clearLevel11Preset" class="char-action-btn char-action-btn--ghost" type="button">해제</button>
          </div>
        ` : buildDeckCardMarkup(baseDeck, cards, selectedChar.accent)}
      </div>

      ${loadoutCustomization ? `
        <div class="char-info-block">
          ${buildSectionLabel('마스터리 커스터마이즈', selectedChar.accent)}
          ${(loadoutCustomization.invalidWarnings || []).map((warning) => (
            `<div class="char-info-text char-info-text--warning">${warning}</div>`
          )).join('')}
          ${buildFeatureSectionMarkup({
    accent: selectedChar.accent,
    title: '시작 덱 커스터마이즈',
    badgeLabel: level11Unlocked ? '사용 가능' : 'Lv.11 해금',
    locked: !level11Unlocked,
    body: level11Unlocked ? `
      <div class="char-info-text">현재 설정: ${buildLevel11PresetSummary(loadoutCustomization.level11Preset, cards)}</div>
      <div class="char-info-text">시작 덱 블록에서 바로 수정할 수 있습니다.</div>
    ` : `
      <div class="char-info-text">현재 설정: ${buildLevel11PresetSummary(loadoutCustomization.level11Preset, cards)}</div>
      <div class="char-info-text">Lv.11 달성 시 시작 덱 커스터마이즈가 해금됩니다.</div>
    `,
  })}
          ${buildFeatureSectionMarkup({
    accent: selectedChar.accent,
    title: '추가 유물 선택',
    badgeLabel: level12Unlocked ? '선택 가능' : 'Lv.12 해금',
    locked: !level12Unlocked,
    body: level12Unlocked ? `
      <div class="char-info-text">현재 설정: ${level12Summary}</div>
      <div class="char-info-text">Lv.12 추가 유물 저장</div>
      <div class="char-start-deck char-start-deck--controls">
        <select id="level12BonusRelic" class="char-loadout-select">${(loadoutCustomization.eligibleBonusRelics || []).map((entry) => (
      `<option value="${entry.id}">${entry.name || entry.id}</option>`
    )).join('')}</select>
        <button id="saveLevel12Preset" class="char-action-btn" type="button">유물 저장</button>
        <button id="clearLevel12Preset" class="char-action-btn char-action-btn--ghost" type="button">해제</button>
      </div>
    ` : `
      <div class="char-info-text">현재 설정: ${level12Summary}</div>
      <div class="char-info-text">Lv.12 달성 시 추가 유물이 해금됩니다.</div>
    `,
  })}
        </div>
      ` : ''}
    </section>
  `;
}
