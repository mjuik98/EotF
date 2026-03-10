import {
  applyCodexFilter,
  buildCodexProgress,
  ensureCodexState,
  getBaseCodexCards,
  getCodexDoc,
  getCodexFilterDefinitions,
  getCodexRecord,
  getEnemyTypeClass,
  highlightCodexDescription,
  isSeenCodexCard,
} from './codex_ui_helpers.js';
import {
  createCodexCardEntry,
  createCodexEnemyCard,
  createCodexItemCard,
  renderCodexEmpty,
  renderCodexFilterBar,
  renderCodexProgress,
  renderCodexSection,
  renderCodexSetView,
} from './codex_ui_render.js';
import { renderCodexInscriptions } from './codex_ui_inscriptions.js';
import {
  buildCardPopupPayload,
  buildCodexNavBlock,
  buildCodexQuoteBlock,
  buildEnemyPopupPayload,
  buildItemPopupPayload,
  closeCodexPopup,
  ensureCodexPopupOverlay,
  openCodexPopup,
  setCodexPopupTheme,
} from './codex_ui_popup.js';
import {
  injectCodexModalStructure,
  setCodexTabState,
} from './codex_ui_structure.js';
import {
  clearCodexPopupNavigation,
  closeCodexModal,
  navigateCodexPopup,
  resetCodexUiState,
  setCodexPopupNavigation,
  showCodexModal,
  transitionCodexTab,
} from './codex_ui_controller.js';

function renderProgress(state, ui, doc, gs, data) {
  const progress = buildCodexProgress(gs, data);
  renderCodexProgress(doc, progress, {
    onSelectTab: (tab) => ui.setCodexTab(tab, state.deps),
  });
}

function renderFilterBar(state, ui, doc, data) {
  renderCodexFilterBar(doc, {
    definitions: getCodexFilterDefinitions(data)[state.tab] || [],
    filter: state.filter,
    showUnknown: state.showUnknown,
    onFilterChange: (nextFilter) => {
      state.filter = nextFilter;
      renderFilterBar(state, ui, doc, data);
      ui.renderCodexContent(state.deps);
    },
    onToggleUnknown: () => {
      state.showUnknown = !state.showUnknown;
      renderFilterBar(state, ui, doc, data);
      ui.renderCodexContent(state.deps);
    },
  });
}

function applyFilter(state, entries, codex, category) {
  return applyCodexFilter(entries, codex, category, {
    search: state.search,
    filter: state.filter,
    sort: state.sort,
    showUnknown: state.showUnknown,
    getRecord: (recordCategory, id) => getCodexRecord(state.deps?.gs, recordCategory, id),
  });
}

function renderSection(state, doc, container, title, icon, entries, buildCard, navList) {
  const codex = ensureCodexState(state.deps?.gs);
  const seenCount = entries.filter((entry) => (
    codex.enemies.has(entry.id) || codex.cards.has(entry.id) || codex.items.has(entry.id)
  )).length;

  renderCodexSection(doc, container, {
    title,
    icon,
    entries,
    seenCount,
    buildCard: (entry, index) => buildCard(entry, index, navList, doc),
  });
}

function getPopupOverlay(doc, closePopup) {
  return ensureCodexPopupOverlay(doc, () => closePopup(doc));
}

function openPopup(doc, closePopup) {
  getPopupOverlay(doc, closePopup);
  openCodexPopup(doc);
}

function closePopup(state, doc) {
  closeCodexPopup(doc);
  clearCodexPopupNavigation(state);
}

function setPopupTheme(doc, theme) {
  setCodexPopupTheme(doc, theme.bg1, theme.bg2, theme.border, theme.glow);
}

function quoteBlock(quote) {
  return buildCodexQuoteBlock(quote);
}

function navBlock(state) {
  return buildCodexNavBlock(state.popupList, state.popupIndex);
}

function bindNavButtons(state, doc, openFn) {
  setCodexPopupNavigation(state, null, null, openFn);
  doc.getElementById('cxNavPrev')?.addEventListener('click', () => navigateCodexPopup(state, -1));
  doc.getElementById('cxNavNext')?.addEventListener('click', () => navigateCodexPopup(state, 1));
}

function mountPopup(state, doc, payload, openFn) {
  getPopupOverlay(doc, (popupDoc) => closePopup(state, popupDoc));
  setPopupTheme(doc, payload.theme);
  const box = doc.getElementById('cxPopupBox');
  if (!box) return;
  box.innerHTML = payload.html;
  doc.getElementById('cxPopupClose')?.addEventListener('click', () => closePopup(state, doc));
  bindNavButtons(state, doc, openFn);
  openPopup(doc, (popupDoc) => closePopup(state, popupDoc));
}

function openEnemyPopup(state, enemy, list) {
  if (list !== undefined) setCodexPopupNavigation(state, enemy, list, (entry, popupList) => openEnemyPopup(state, entry, popupList));
  const doc = getCodexDoc(state.deps);
  const payload = buildEnemyPopupPayload(enemy, {
    gs: state.deps?.gs,
    safeHtml: highlightCodexDescription,
    quoteHtml: quoteBlock(enemy.quote),
    navHtml: navBlock(state),
  });
  mountPopup(state, doc, payload, (entry, popupList) => openEnemyPopup(state, entry, popupList));
}

function openCardPopup(state, card, list) {
  if (list !== undefined) setCodexPopupNavigation(state, card, list, (entry, popupList) => openCardPopup(state, entry, popupList));
  const doc = getCodexDoc(state.deps);
  const payload = buildCardPopupPayload(card, {
    gs: state.deps?.gs,
    data: state.deps?.data,
    safeHtml: highlightCodexDescription,
    quoteHtml: quoteBlock(card.quote),
    navHtml: navBlock(state),
  });
  mountPopup(state, doc, payload, (entry, popupList) => openCardPopup(state, entry, popupList));
}

function openItemPopup(state, item, list) {
  if (list !== undefined) setCodexPopupNavigation(state, item, list, (entry, popupList) => openItemPopup(state, entry, popupList));
  const doc = getCodexDoc(state.deps);
  const payload = buildItemPopupPayload(item, {
    gs: state.deps?.gs,
    data: state.deps?.data,
    safeHtml: highlightCodexDescription,
    quoteHtml: quoteBlock(item.quote),
    navHtml: navBlock(state),
  });
  mountPopup(state, doc, payload, (entry, popupList) => openItemPopup(state, entry, popupList));
}

function makeEnemyCard(state, enemy, index, navList, doc) {
  const codex = ensureCodexState(state.deps?.gs);
  return createCodexEnemyCard(doc, enemy, index, {
    gs: state.deps?.gs,
    typeClass: getEnemyTypeClass(enemy),
    onOpen: (entry) => openEnemyPopup(state, entry, navList.filter((candidate) => codex.enemies.has(candidate.id))),
  });
}

function makeCardEntry(state, cardEntry, index, navList, doc) {
  const codex = ensureCodexState(state.deps?.gs);
  return createCodexCardEntry(doc, cardEntry, index, {
    gs: state.deps?.gs,
    onOpen: (entry) => openCardPopup(state, entry, navList.filter((candidate) => isSeenCodexCard(codex, candidate.id))),
  });
}

function makeItemCard(state, item, index, navList, doc) {
  const codex = ensureCodexState(state.deps?.gs);
  return createCodexItemCard(doc, item, index, {
    gs: state.deps?.gs,
    data: state.deps?.data,
    onOpen: (entry) => openItemPopup(state, entry, navList.filter((candidate) => codex.items.has(candidate.id))),
  });
}

function renderSetView(state, doc, container, data, gs) {
  const items = Object.values(data.items || {});
  const codex = ensureCodexState(gs);
  renderCodexSetView(doc, container, data, gs, {
    onOpenItem: (item) => openItemPopup(state, item, items.filter((entry) => codex.items.has(entry.id))),
  });
}

function renderEmpty(container, message) {
  renderCodexEmpty(container, message);
}

function renderEnemyTab(state, doc, content, enemies, codex) {
  const sections = [
    { title: '일반 적', icon: '✦', filter: (enemy) => !enemy.isBoss && !enemy.isElite && !enemy.isMiniBoss },
    { title: '엘리트 적', icon: '◆', filter: (enemy) => !!enemy.isElite && !enemy.isBoss },
    { title: '중간 보스', icon: '◈', filter: (enemy) => !!enemy.isMiniBoss },
    { title: '보스', icon: '✹', filter: (enemy) => !!enemy.isBoss },
  ];

  let hasEntries = false;
  sections.forEach((section) => {
    const entries = applyFilter(state, enemies.filter(section.filter), codex, 'enemies');
    if (!entries.length) return;
    hasEntries = true;
    renderSection(state, doc, content, section.title, section.icon, entries, (entry, index, navList, entryDoc) => makeEnemyCard(state, entry, index, navList, entryDoc), entries);
  });

  if (!hasEntries) renderEmpty(content);
}

function renderCardsTab(state, doc, content, data, codex) {
  const sections = [
    { title: '공격 카드', icon: '⚔', filter: (card) => String(card.type || '').toUpperCase() === 'ATTACK' },
    { title: '스킬 카드', icon: '✧', filter: (card) => String(card.type || '').toUpperCase() === 'SKILL' },
    { title: '파워 카드', icon: '☼', filter: (card) => String(card.type || '').toUpperCase() === 'POWER' },
  ];

  let hasEntries = false;
  sections.forEach((section) => {
    const entries = applyFilter(state, getBaseCodexCards(data).filter(section.filter), codex, 'cards');
    if (!entries.length) return;
    hasEntries = true;
    renderSection(state, doc, content, section.title, section.icon, entries, (entry, index, navList, entryDoc) => makeCardEntry(state, entry, index, navList, entryDoc), entries);
  });

  if (!hasEntries) renderEmpty(content);
}

function renderItemsTab(state, doc, content, data, gs, codex) {
  const items = Object.values(data.items || {});
  if (state.filter === 'all' && !state.search) {
    renderSetView(state, doc, content, data, gs);
  }

  const entries = applyFilter(state, items, codex, 'items');
  if (!entries.length) {
    renderEmpty(content);
    return;
  }

  renderSection(state, doc, content, '전체 유물', '❖', entries, (entry, index, navList, entryDoc) => makeItemCard(state, entry, index, navList, entryDoc), entries);
}

export function openCodexRuntime(state, ui, deps = {}) {
  ensureCodexState(deps.gs);
  resetCodexUiState(state, deps);

  const doc = getCodexDoc(deps);
  showCodexModal(doc);

  injectCodexModalStructure(doc, {
    onSearchChange: (value) => {
      state.search = value.toLowerCase();
      ui.renderCodexContent(state.deps);
    },
    onSortChange: (value) => {
      state.sort = value;
      ui.renderCodexContent(state.deps);
    },
    onClose: () => {
      state.deps?.audioEngine?.playClick?.();
      ui.closeCodex(state.deps);
    },
    onTabSelect: (tab) => {
      state.deps?.audioEngine?.playClick?.();
      ui.setCodexTab(tab, state.deps);
    },
  });

  renderProgress(state, ui, doc, deps.gs, deps.data);
  setCodexTabState(doc, state.tab);
  renderFilterBar(state, ui, doc, deps.data);
  ui.renderCodexContent(deps);
}

export function closeCodexRuntime(state, deps = {}) {
  const doc = getCodexDoc(deps);
  closeCodexModal(doc, {
    onBeforeHide: () => closePopup(state, doc),
  });
}

export function setCodexTabRuntime(state, ui, tab, deps = {}) {
  const doc = getCodexDoc(deps);
  state.deps = deps;

  transitionCodexTab(doc, state, tab, {
    force: !!deps._force,
    onBeforeRender: (nextTab) => {
      setCodexTabState(doc, nextTab);
    },
    onRender: () => {
      renderFilterBar(state, ui, doc, deps.data);
      ui.renderCodexContent(deps);
    },
  });
}

export function renderCodexContentRuntime(state, ui, deps = {}) {
  state.deps = deps;
  const { gs, data } = deps;
  if (!gs || !data) return;

  const doc = getCodexDoc(deps);
  const content = doc.getElementById('codexContent');
  if (!content) return;

  const codex = ensureCodexState(gs);
  content.textContent = '';

  const enemies = Object.values(data.enemies || {});
  const inscriptions = Object.values(data.inscriptions || {});

  if (state.tab === 'enemies') {
    renderEnemyTab(state, doc, content, enemies, codex);
  } else if (state.tab === 'cards') {
    renderCardsTab(state, doc, content, data, codex);
  } else if (state.tab === 'items') {
    renderItemsTab(state, doc, content, data, gs, codex);
  } else if (state.tab === 'inscriptions') {
    renderCodexInscriptions(doc, content, inscriptions, gs);
  }

  renderProgress(state, ui, doc, gs, data);
}

export function bindCodexGlobalKeys(state) {
  if (typeof document === 'undefined') return;

  document.addEventListener('keydown', (event) => {
    const popup = document.getElementById('cxDetailPopup');
    if (!popup?.classList.contains('open')) return;
    if (event.key === 'Escape') closePopup(state, document);
    if (event.key === 'ArrowRight') navigateCodexPopup(state, 1);
    if (event.key === 'ArrowLeft') navigateCodexPopup(state, -1);
  });
}
