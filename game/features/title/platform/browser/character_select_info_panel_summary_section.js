import { DescriptionUtils } from '../../../ui/ports/public_text_support_capabilities.js';
import { buildRelicMarkup } from './character_select_info_panel_markup.js';
import {
  buildFeaturedCardMarkup,
  buildPlayStyleMarkup,
} from './character_select_info_panel_featured_content.js';

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
  pendingSummaryCount = 0,
} = {}) {
  const pendingSummaryNotice = pendingSummaryCount > 0
    ? `<div class="char-info-text char-info-text--notice">미확인 진행 기록 ${pendingSummaryCount}건 · 입장 시 순차 재생</div>`
    : '';

  return `
    <section class="char-info-pane is-active" data-pane="summary" role="tabpanel">
      <div class="char-info-block char-info-block--accent">
        ${buildSectionLabel('고유 특성', selectedChar.accent)}
        <p class="char-info-heading char-info-heading--accent">${selectedChar.traitTitle}</p>
        <p class="char-info-text">${selectedChar.traitDesc}</p>
      </div>

      <div class="char-info-block">
        ${buildSectionLabel('에코 스킬', selectedChar.accent)}
        <button id="echoBadge" class="echo-badge char-echo-badge" type="button">
          <div class="char-echo-icon">${echoSkill.icon}</div>
          <div class="char-echo-copy">
            <div class="char-echo-name">${echoSkill.name}</div>
            <div class="char-echo-desc">${DescriptionUtils.highlight(echoSkill.desc || '')}</div>
          </div>
          <div class="char-echo-cost">${echoSkill.echoCost}</div>
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
        ${pendingSummaryNotice}
      </div>
    </section>
  `;
}
