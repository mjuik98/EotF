import { DescriptionUtils } from '../../../ui/ports/public_feature_support_capabilities.js';

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
  buildFeaturedCardMarkup,
  buildPlayStyleMarkup,
} from './character_select_info_panel_featured_content.js';

function buildRoadmapRows(roadmap = [], classProgress = {}) {
  return (roadmap || []).map((row) => {
    const earned = row.lv <= classProgress.level;
    const current = row.lv === classProgress.level + 1;
    const classes = ['csm-roadmap-row', earned ? 'earned' : '', current ? 'current' : '']
      .filter(Boolean)
      .join(' ');
    return `
      <div class="${classes}">
        <span class="csm-roadmap-lv">Lv.${row.lv}</span>
        <span class="csm-roadmap-icon">${row.icon}</span>
        <span class="csm-roadmap-desc">${row.desc}</span>
      </div>
    `;
  }).join('');
}

export function buildCharacterInfoSummarySection({
  selectedChar,
  buildSectionLabel,
  echoSkill,
  playStyleLines,
  summaryRelics,
  cards,
  featuredCardIds,
  featuredCardTags,
  roadmapPreviewText,
} = {}) {
  return `
    <section class="char-info-pane is-active" data-pane="summary" role="tabpanel">
      <div class="char-info-block" style="border-color:${selectedChar.accent}22;background:${selectedChar.accent}06;">
        ${buildSectionLabel('고유 특성', selectedChar.accent)}
        <p class="char-info-heading" style="color:${selectedChar.accent}">${selectedChar.traitTitle}</p>
        <p class="char-info-text">${selectedChar.traitDesc}</p>
      </div>

      <div class="char-info-block">
        ${buildSectionLabel('에코 스킬', selectedChar.accent)}
        <button id="echoBadge" class="echo-badge char-echo-badge" style="background:linear-gradient(135deg,${selectedChar.accent}0e,${selectedChar.color}08);border:1px solid ${selectedChar.accent}44;">
          <div class="char-echo-icon" style="border-color:${selectedChar.accent}55;background:${selectedChar.accent}14;">${echoSkill.icon}</div>
          <div class="char-echo-copy">
            <div class="char-echo-name" style="color:${selectedChar.accent}">${echoSkill.name}</div>
            <div class="char-echo-desc">${DescriptionUtils.highlight(echoSkill.desc || '')}</div>
          </div>
          <div class="char-echo-cost" style="border-color:${selectedChar.accent}33;color:${selectedChar.accent}99;background:${selectedChar.accent}0a;">${echoSkill.echoCost}</div>
        </button>
      </div>

      <div class="char-info-block">
        ${buildSectionLabel('플레이 감각', selectedChar.accent)}
        ${buildPlayStyleMarkup(playStyleLines)}
      </div>

      <div class="char-info-block">
        ${buildSectionLabel('시작 장비', selectedChar.accent)}
        <div class="char-info-text">시작 유물</div>
        ${buildRelicMarkup(summaryRelics, selectedChar.accent)}
      </div>

      <div class="char-info-block">
        ${buildSectionLabel('시작 핵심 카드', selectedChar.accent)}
        ${buildFeaturedCardMarkup(featuredCardIds, cards, selectedChar.accent, featuredCardTags)}
      </div>

      <div class="char-info-block">
        ${buildSectionLabel('다음 마스터리 해금', selectedChar.accent)}
        <div class="char-info-text">${roadmapPreviewText}</div>
      </div>
    </section>
  `;
}

export function buildCharacterInfoDetailsSection({
  selectedChar,
  classProgress,
  roadmap,
  buildSectionLabel,
  buildRadar,
  cards,
  progressPct,
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
} = {}) {
  const roadmapRows = buildRoadmapRows(roadmap, classProgress);

  return `
    <section class="char-info-pane" data-pane="details" role="tabpanel">
      <div class="csm-mastery-panel" style="border-color:${selectedChar.accent}2f;background:${selectedChar.accent}0a;">
        <div class="csm-mastery-head">
          <div>
            <div class="csm-mastery-title" style="color:${selectedChar.accent}">클래스 숙련도</div>
            <div class="csm-mastery-level">${classProgress.nextLevelXp === null ? 'MAX' : `Lv.${classProgress.level}`}</div>
          </div>
          <div class="csm-mastery-xp">
            ${classProgress.nextLevelXp === null ? '최고 레벨' : `${classProgress.totalXp} / ${classProgress.nextLevelXp} 경험치`}
          </div>
        </div>
        <div class="csm-mastery-bar">
          <div class="csm-mastery-fill" style="width:${progressPct}%;background:${selectedChar.accent};box-shadow:0 0 10px ${selectedChar.accent}55"></div>
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
          <div class="char-info-text" style="margin-top:10px">추가 유물</div>
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
        ${buildSectionLabel('시작 덱', selectedChar.accent)}
        ${level11Unlocked ? `
          <div class="char-info-text">카드를 클릭해 대상을 지정하세요.</div>
          <div class="char-start-deck" style="margin:8px 0 10px">
            <button id="level11ModeUpgrade" class="level11-mode-btn" type="button" style="border:1px solid ${initialLevel11Mode === 'upgrade' ? `${selectedChar.accent}66` : 'rgba(255,255,255,0.14)'};background:${initialLevel11Mode === 'upgrade' ? `${selectedChar.accent}14` : 'rgba(255,255,255,0.04)'};color:${initialLevel11Mode === 'upgrade' ? selectedChar.accent : '#d5ddf2'};border-radius:999px;padding:4px 10px;font-size:10px;letter-spacing:0.06em;cursor:pointer">강화</button>
            <button id="level11ModeSwap" class="level11-mode-btn" type="button" style="border:1px solid ${initialLevel11Mode === 'swap' ? `${selectedChar.accent}66` : 'rgba(255,255,255,0.14)'};background:${initialLevel11Mode === 'swap' ? `${selectedChar.accent}14` : 'rgba(255,255,255,0.04)'};color:${initialLevel11Mode === 'swap' ? selectedChar.accent : '#d5ddf2'};border-radius:999px;padding:4px 10px;font-size:10px;letter-spacing:0.06em;cursor:pointer">교체</button>
          </div>
          <div id="level11SelectionNote" class="char-info-text level11-selection-note" style="margin-bottom:8px">${initialLevel11Mode === 'swap' ? '교체할 카드를 선택한 뒤 추가 카드를 골라 저장하세요.' : '강화할 카드를 선택한 뒤 저장하세요.'}</div>
          ${buildInteractiveDeckCardMarkup(baseDeck, cards, selectedChar.accent, {
    upgradeIndices: eligibleUpgradeIndices,
    swapIndices: eligibleSwapIndices,
    mode: initialLevel11Mode,
    selectedUpgradeIndex: initialLevel11UpgradeIndex,
    selectedSwapIndex: initialLevel11SwapIndex,
  })}
          <div class="char-info-text" style="margin-top:10px">추가 카드 선택</div>
          <div class="char-start-deck" style="margin:8px 0 10px">
            ${(loadoutCustomization?.eligibleSwapAddCards || []).map((entry) => `
              <button
                class="level11-add-card-btn"
                type="button"
                data-level11-add-card-id="${entry.cardId}"
                style="border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.04);color:#d5ddf2;border-radius:999px;padding:4px 10px;font-size:10px;letter-spacing:0.06em;cursor:pointer"
              >${entry.name || entry.cardId}</button>
            `).join('')}
          </div>
          <div class="char-start-deck" style="margin-top:8px">
            <button id="saveLevel11Upgrade" type="button">강화로 저장</button>
            <button id="saveLevel11Swap" type="button">교체로 저장</button>
            <button id="clearLevel11Preset" type="button">해제</button>
          </div>
        ` : buildDeckCardMarkup(baseDeck, cards, selectedChar.accent)}
      </div>

      ${loadoutCustomization ? `
        <div class="char-info-block">
          ${buildSectionLabel('마스터리 커스터마이즈', selectedChar.accent)}
          ${(loadoutCustomization.invalidWarnings || []).map((warning) => (
            `<div class="char-info-text" style="color:#ffb347">${warning}</div>`
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
      <div class="char-start-deck">
        <select id="level12BonusRelic">${(loadoutCustomization.eligibleBonusRelics || []).map((entry) => (
      `<option value="${entry.id}">${entry.name || entry.id}</option>`
    )).join('')}</select>
        <button id="saveLevel12Preset" type="button">유물 저장</button>
        <button id="clearLevel12Preset" type="button">해제</button>
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
