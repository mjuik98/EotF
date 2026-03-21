const DECK_MODAL_SHELL_MARKUP = `
<div class="deck-modal-inner">
  <div class="deck-modal-header-special">
    <div class="deck-modal-title" style="margin-bottom:0;">📚 덱 — <span id="deckModalCount">0</span>장</div>
    <div id="deckStatusBar" class="deck-status-bar-el"></div>
  </div>
  <div id="deckFilterTabs" class="deck-filter-tabs-container">
    <button id="deckFilter_all" class="deck-filter-btn deck-filter-btn-base deck-filter-all" data-filter="all">
      전체
    </button>
    <button id="deckFilter_ATTACK" class="deck-filter-btn deck-filter-btn-base deck-filter-attack" data-filter="ATTACK">
      ⚔️ 공격
    </button>
    <button id="deckFilter_SKILL" class="deck-filter-btn deck-filter-btn-base deck-filter-skill" data-filter="SKILL">
      🛡️ 스킬
    </button>
    <button id="deckFilter_POWER" class="deck-filter-btn deck-filter-btn-base deck-filter-power" data-filter="POWER">
      ⚡ 파워
    </button>
    <button id="deckFilter_upgraded" class="deck-filter-btn deck-filter-btn-base deck-filter-upgraded" data-filter="upgraded">
      ✦ 강화됨
    </button>
  </div>
  <div class="deck-modal-cards" id="deckModalCards"></div>
  <div class="deck-footer">
    <button id="deckViewCloseBtn" class="action-btn action-btn-secondary">닫기<span class="kbd-hint">ESC</span></button>
  </div>
</div>
`.trim();

function resolveDoc(doc = null) {
  if (doc) return doc;
  return typeof document !== 'undefined' ? document : null;
}

export function buildDeckModalShellMarkup() {
  return DECK_MODAL_SHELL_MARKUP;
}

export function ensureDeckModalShell(doc = null) {
  const resolvedDoc = resolveDoc(doc);
  const container = resolvedDoc?.getElementById?.('deckViewModal') || null;

  if (!container) return null;
  if (resolvedDoc.getElementById?.('deckModalCards')) return container;

  container.innerHTML = buildDeckModalShellMarkup();
  return container;
}
