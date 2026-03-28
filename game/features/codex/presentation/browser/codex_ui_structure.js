const CODEX_TABS = ['enemies', 'cards', 'items', 'inscriptions'];

export function buildCodexModalMarkup() {
  return '<div class="cx-header gm-modal-header gm-modal-header-row">'
    + '<div class="cx-header-left gm-modal-header-main">'
    + '<div class="cx-eyebrow gm-modal-eyebrow">◈ CODEX ◈</div>'
    + '<div class="cx-title gm-modal-title">도감</div>'
    + '<div class="cx-subtitle gm-modal-subtitle">발견한 모든 것이 기록된다</div>'
    + '</div>'
    + '<div class="cx-header-right"><div class="cx-search-wrap"><span class="cx-search-icon">🔍</span>'
    + '<input class="cx-search" id="cxSearch" type="text" placeholder="검색..." autocomplete="off"></div>'
    + '<select class="cx-sort-select" id="cxSort"><option value="default">기본순</option><option value="name">이름순</option>'
    + '<option value="rarity">등급순</option><option value="count">횟수순</option></select>'
    + '<button class="cx-close-btn" id="codexCloseBtn">✕</button></div>'
    + '</div>'
    + '<div class="gm-modal-body"><div class="cx-progress-section" id="cxProgressSection"></div><div class="cx-tabs">'
    + '<button class="cx-tab-btn active" id="codexTab_enemies" data-tab="enemies">👾 적 도감 <span class="cx-tab-badge" id="cxBadge_enemies"></span></button>'
    + '<button class="cx-tab-btn" id="codexTab_cards" data-tab="cards">🃏 카드 도감 <span class="cx-tab-badge" id="cxBadge_cards"></span></button>'
    + '<button class="cx-tab-btn" id="codexTab_items" data-tab="items">💎 유물 도감 <span class="cx-tab-badge" id="cxBadge_items"></span></button>'
    + '<button class="cx-tab-btn" id="codexTab_inscriptions" data-tab="inscriptions">✨ 각인 도감 <span class="cx-tab-badge" id="cxBadge_inscriptions"></span></button>'
    + '</div><div class="cx-filter-bar" id="cxFilterBar"></div><div class="cx-content-wrap"><div class="cx-content" id="codexContent"></div></div></div>'
    + '<div class="cx-footer gm-modal-footer"><div class="cx-footer-hints">'
    + '<span><span class="cx-kbd">클릭</span>상세 보기</span><span><span class="cx-kbd">←→</span>이전/다음</span>'
    + '<span><span class="cx-kbd">ESC</span>닫기</span></div></div>';
}

export function injectCodexModalStructure(doc, options = {}) {
  const inner = doc.getElementById('codexModal')?.querySelector('.codex-modal-inner');
  if (!inner) return null;
  if (inner.dataset.v3) return inner;

  inner.dataset.v3 = '1';
  inner.innerHTML = buildCodexModalMarkup();

  doc.getElementById('cxSearch')?.addEventListener('input', (event) => {
    options.onSearchChange?.(String(event?.target?.value || ''));
  });
  doc.getElementById('cxSort')?.addEventListener('change', (event) => {
    options.onSortChange?.(String(event?.target?.value || 'default'));
  });
  doc.getElementById('codexCloseBtn')?.addEventListener('click', () => {
    options.onClose?.();
  });

  CODEX_TABS.forEach((tab) => {
    doc.getElementById(`codexTab_${tab}`)?.addEventListener('click', () => {
      options.onTabSelect?.(tab);
    });
  });

  return inner;
}

export function setCodexTabState(doc, tab) {
  CODEX_TABS.forEach((entry) => {
    doc.getElementById(`codexTab_${entry}`)?.classList.toggle('active', entry === tab);
  });
}

export function getCodexTabs() {
  return CODEX_TABS.slice();
}
