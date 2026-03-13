import {
  CARD_CODEX_SECTIONS,
  ENEMY_CODEX_SECTIONS,
  renderCodexCategorizedSections,
} from './codex_ui_content_sections.js';

export function renderEnemyCodexTab(state, doc, content, enemies, codex, helpers = {}) {
  const {
    applyFilter,
    renderSection,
    renderEmpty,
    makeEnemyCard,
  } = helpers;
  renderCodexCategorizedSections(state, doc, content, enemies, codex, {
    sections: ENEMY_CODEX_SECTIONS,
    category: 'enemies',
    applyFilter,
    renderSection,
    renderEmpty,
    buildEntry: makeEnemyCard,
  });
}

export function renderCardsCodexTab(state, doc, content, data, codex, helpers = {}) {
  const {
    applyFilter,
    renderSection,
    renderEmpty,
    makeCardEntry,
    getBaseCodexCards,
  } = helpers;
  renderCodexCategorizedSections(state, doc, content, getBaseCodexCards(data), codex, {
    sections: CARD_CODEX_SECTIONS,
    category: 'cards',
    applyFilter,
    renderSection,
    renderEmpty,
    buildEntry: makeCardEntry,
  });
}

export function renderItemsCodexTab(state, doc, content, data, gs, codex, helpers = {}) {
  const {
    applyFilter,
    renderEmpty,
    renderSection,
    renderSetView,
    makeItemCard,
  } = helpers;
  const items = Object.values(data.items || {});
  if (state.filter === 'all' && !state.search) {
    renderSetView(state, doc, content, data, gs);
  }

  const entries = applyFilter(state, items, codex, 'items');
  if (!entries.length) {
    renderEmpty(content);
    return;
  }

  renderSection(
    state,
    doc,
    content,
    '전체 유물',
    '❖',
    entries,
    (entry, index, navList, entryDoc) => makeItemCard(state, entry, index, navList, entryDoc),
    entries,
  );
}
