import {
  applyCodexFilter,
  buildCodexProgress,
  ensureCodexState,
  getBaseCodexCards,
  getCodexDoc,
  getCodexFilterDefinitions,
  getCodexRecord,
  getEnemyTypeClass,
  isSeenCodexCard,
} from './codex_ui_helpers.js';
import {
  renderCardsCodexTab,
  renderEnemyCodexTab,
  renderItemsCodexTab,
} from './codex_ui_content_runtime.js';
import {
  closeCodexDetailPopup,
  openCardCodexPopup,
  openEnemyCodexPopup,
  openItemCodexPopup,
} from './codex_ui_popup_runtime.js';
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
  injectCodexModalStructure,
  setCodexTabState,
} from './codex_ui_structure.js';
import {
  closeCodexModal,
  navigateCodexPopup,
  resetCodexUiState,
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

function makeEnemyCard(state, enemy, index, navList, doc) {
  const codex = ensureCodexState(state.deps?.gs);
  return createCodexEnemyCard(doc, enemy, index, {
    gs: state.deps?.gs,
    typeClass: getEnemyTypeClass(enemy),
    onOpen: (entry) => openEnemyCodexPopup(state, entry, navList.filter((candidate) => codex.enemies.has(candidate.id))),
  });
}

function makeCardEntry(state, cardEntry, index, navList, doc) {
  const codex = ensureCodexState(state.deps?.gs);
  return createCodexCardEntry(doc, cardEntry, index, {
    gs: state.deps?.gs,
    onOpen: (entry) => openCardCodexPopup(state, entry, navList.filter((candidate) => isSeenCodexCard(codex, candidate.id))),
  });
}

function makeItemCard(state, item, index, navList, doc) {
  const codex = ensureCodexState(state.deps?.gs);
  return createCodexItemCard(doc, item, index, {
    gs: state.deps?.gs,
    data: state.deps?.data,
    onOpen: (entry) => openItemCodexPopup(state, entry, navList.filter((candidate) => codex.items.has(candidate.id))),
  });
}

function renderSetView(state, doc, container, data, gs) {
  const items = Object.values(data.items || {});
  const codex = ensureCodexState(gs);
  renderCodexSetView(doc, container, data, gs, {
    onOpenItem: (item) => openItemCodexPopup(state, item, items.filter((entry) => codex.items.has(entry.id))),
  });
}

function renderEmpty(container, message) {
  renderCodexEmpty(container, message);
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
    onBeforeHide: () => closeCodexDetailPopup(state, doc),
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
    renderEnemyCodexTab(state, doc, content, enemies, codex, {
      applyFilter,
      renderSection,
      renderEmpty,
      makeEnemyCard,
    });
  } else if (state.tab === 'cards') {
    renderCardsCodexTab(state, doc, content, data, codex, {
      applyFilter,
      renderSection,
      renderEmpty,
      makeCardEntry,
      getBaseCodexCards,
    });
  } else if (state.tab === 'items') {
    renderItemsCodexTab(state, doc, content, data, gs, codex, {
      applyFilter,
      renderEmpty,
      renderSection,
      renderSetView,
      makeItemCard,
    });
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
    if (event.key === 'Escape') closeCodexDetailPopup(state, document);
    if (event.key === 'ArrowRight') navigateCodexPopup(state, 1);
    if (event.key === 'ArrowLeft') navigateCodexPopup(state, -1);
  });
}
