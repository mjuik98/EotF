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
  createCodexUiState,
  navigateCodexPopup,
  resetCodexUiState,
  setCodexPopupNavigation,
  showCodexModal,
  transitionCodexTab,
} from './codex_ui_controller.js';

const _state = createCodexUiState();

const _getDoc = getCodexDoc;
const _ensureCodex = ensureCodexState;
const _safeHtml = highlightCodexDescription;
const _getBaseCards = getBaseCodexCards;
const _isSeenCard = isSeenCodexCard;
const _getRecords = getCodexRecord;
const _filterDefs = getCodexFilterDefinitions;

function _renderProgress(doc, gs, data) {
  const progress = buildCodexProgress(gs, data);
  renderCodexProgress(doc, progress, {
    onSelectTab: (tab) => CodexUI.setCodexTab(tab, _state.deps),
  });
}

function _renderFilterBar(doc, data) {
  renderCodexFilterBar(doc, {
    definitions: _filterDefs(data)[_state.tab] || [],
    filter: _state.filter,
    showUnknown: _state.showUnknown,
    onFilterChange: (nextFilter) => {
      _state.filter = nextFilter;
      _renderFilterBar(doc, data);
      CodexUI.renderCodexContent(_state.deps);
    },
    onToggleUnknown: () => {
      _state.showUnknown = !_state.showUnknown;
      _renderFilterBar(doc, data);
      CodexUI.renderCodexContent(_state.deps);
    },
  });
}

function _applyFilter(entries, codex, category) {
  return applyCodexFilter(entries, codex, category, {
    search: _state.search,
    filter: _state.filter,
    sort: _state.sort,
    showUnknown: _state.showUnknown,
    getRecord: (recordCategory, id) => _getRecords(_state.deps?.gs, recordCategory, id),
  });
}

function _renderSection(doc, container, title, icon, entries, buildCard, navList) {
  const codex = _ensureCodex(_state.deps?.gs);
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

function _makeEnemyCard(enemy, index, navList, doc) {
  const codex = _ensureCodex(_state.deps?.gs);
  return createCodexEnemyCard(doc, enemy, index, {
    gs: _state.deps?.gs,
    typeClass: getEnemyTypeClass(enemy),
    onOpen: (entry) => _openEnemyPopup(entry, navList.filter((candidate) => codex.enemies.has(candidate.id))),
  });
}

function _makeCardEntry(cardEntry, index, navList, doc) {
  const codex = _ensureCodex(_state.deps?.gs);
  return createCodexCardEntry(doc, cardEntry, index, {
    gs: _state.deps?.gs,
    onOpen: (entry) => _openCardPopup(entry, navList.filter((candidate) => _isSeenCard(codex, candidate.id))),
  });
}

function _makeItemCard(item, index, navList, doc) {
  const codex = _ensureCodex(_state.deps?.gs);
  return createCodexItemCard(doc, item, index, {
    gs: _state.deps?.gs,
    data: _state.deps?.data,
    onOpen: (entry) => _openItemPopup(entry, navList.filter((candidate) => codex.items.has(candidate.id))),
  });
}

function _renderSetView(doc, container, data, gs) {
  const items = Object.values(data.items || {});
  const codex = _ensureCodex(gs);
  renderCodexSetView(doc, container, data, gs, {
    onOpenItem: (item) => _openItemPopup(item, items.filter((entry) => codex.items.has(entry.id))),
  });
}

function _renderEmpty(container, message) {
  renderCodexEmpty(container, message);
}

function _getPopupOverlay(doc) {
  return ensureCodexPopupOverlay(doc, () => _closePopup(doc));
}

function _openPopup(doc) {
  _getPopupOverlay(doc);
  openCodexPopup(doc);
}

function _closePopup(doc) {
  closeCodexPopup(doc);
  clearCodexPopupNavigation(_state);
}

function _setPopupTheme(doc, theme) {
  setCodexPopupTheme(doc, theme.bg1, theme.bg2, theme.border, theme.glow);
}

function _quoteBlock(quote) {
  return buildCodexQuoteBlock(quote);
}

function _navBlock() {
  return buildCodexNavBlock(_state.popupList, _state.popupIndex);
}

function _bindNavButtons(doc, openFn) {
  setCodexPopupNavigation(_state, null, null, openFn);
  doc.getElementById('cxNavPrev')?.addEventListener('click', () => _navPopup(-1));
  doc.getElementById('cxNavNext')?.addEventListener('click', () => _navPopup(1));
}

function _navPopup(dir) {
  navigateCodexPopup(_state, dir);
}

function _mountPopup(doc, payload, openFn) {
  _getPopupOverlay(doc);
  _setPopupTheme(doc, payload.theme);
  const box = doc.getElementById('cxPopupBox');
  if (!box) return;
  box.innerHTML = payload.html;
  doc.getElementById('cxPopupClose')?.addEventListener('click', () => _closePopup(doc));
  _bindNavButtons(doc, openFn);
  _openPopup(doc);
}

function _openEnemyPopup(enemy, list) {
  if (list !== undefined) setCodexPopupNavigation(_state, enemy, list, _openEnemyPopup);
  const doc = _getDoc(_state.deps);
  const payload = buildEnemyPopupPayload(enemy, {
    gs: _state.deps?.gs,
    safeHtml: _safeHtml,
    quoteHtml: _quoteBlock(enemy.quote),
    navHtml: _navBlock(),
  });
  _mountPopup(doc, payload, _openEnemyPopup);
}

function _openCardPopup(card, list) {
  if (list !== undefined) setCodexPopupNavigation(_state, card, list, _openCardPopup);
  const doc = _getDoc(_state.deps);
  const payload = buildCardPopupPayload(card, {
    gs: _state.deps?.gs,
    data: _state.deps?.data,
    safeHtml: _safeHtml,
    quoteHtml: _quoteBlock(card.quote),
    navHtml: _navBlock(),
  });
  _mountPopup(doc, payload, _openCardPopup);
}

function _openItemPopup(item, list) {
  if (list !== undefined) setCodexPopupNavigation(_state, item, list, _openItemPopup);
  const doc = _getDoc(_state.deps);
  const payload = buildItemPopupPayload(item, {
    gs: _state.deps?.gs,
    data: _state.deps?.data,
    safeHtml: _safeHtml,
    quoteHtml: _quoteBlock(item.quote),
    navHtml: _navBlock(),
  });
  _mountPopup(doc, payload, _openItemPopup);
}

function _renderEnemyTab(doc, content, enemies, codex) {
  const sections = [
    { title: '일반 적', icon: '✦', filter: (enemy) => !enemy.isBoss && !enemy.isElite && !enemy.isMiniBoss },
    { title: '엘리트 적', icon: '◆', filter: (enemy) => !!enemy.isElite && !enemy.isBoss },
    { title: '중간 보스', icon: '◈', filter: (enemy) => !!enemy.isMiniBoss },
    { title: '보스', icon: '✹', filter: (enemy) => !!enemy.isBoss },
  ];

  let hasEntries = false;
  sections.forEach((section) => {
    const entries = _applyFilter(enemies.filter(section.filter), codex, 'enemies');
    if (!entries.length) return;
    hasEntries = true;
    _renderSection(doc, content, section.title, section.icon, entries, _makeEnemyCard, entries);
  });

  if (!hasEntries) _renderEmpty(content);
}

function _renderCardsTab(doc, content, data, codex) {
  const sections = [
    { title: '공격 카드', icon: '⚔', filter: (card) => String(card.type || '').toUpperCase() === 'ATTACK' },
    { title: '스킬 카드', icon: '✧', filter: (card) => String(card.type || '').toUpperCase() === 'SKILL' },
    { title: '파워 카드', icon: '☼', filter: (card) => String(card.type || '').toUpperCase() === 'POWER' },
  ];

  let hasEntries = false;
  sections.forEach((section) => {
    const entries = _applyFilter(_getBaseCards(data).filter(section.filter), codex, 'cards');
    if (!entries.length) return;
    hasEntries = true;
    _renderSection(doc, content, section.title, section.icon, entries, _makeCardEntry, entries);
  });

  if (!hasEntries) _renderEmpty(content);
}

function _renderItemsTab(doc, content, data, gs, codex) {
  const items = Object.values(data.items || {});
  if (_state.filter === 'all' && !_state.search) {
    _renderSetView(doc, content, data, gs);
  }

  const entries = _applyFilter(items, codex, 'items');
  if (!entries.length) {
    _renderEmpty(content);
    return;
  }

  _renderSection(doc, content, '전체 유물', '❖', entries, _makeItemCard, entries);
}

export const CodexUI = {
  openCodex(deps = {}) {
    _ensureCodex(deps.gs);
    resetCodexUiState(_state, deps);

    const doc = _getDoc(deps);
    showCodexModal(doc);

    injectCodexModalStructure(doc, {
      onSearchChange: (value) => {
        _state.search = value.toLowerCase();
        CodexUI.renderCodexContent(_state.deps);
      },
      onSortChange: (value) => {
        _state.sort = value;
        CodexUI.renderCodexContent(_state.deps);
      },
      onClose: () => {
        _state.deps?.audioEngine?.playClick?.();
        CodexUI.closeCodex(_state.deps);
      },
      onTabSelect: (tab) => {
        _state.deps?.audioEngine?.playClick?.();
        CodexUI.setCodexTab(tab, _state.deps);
      },
    });

    _renderProgress(doc, deps.gs, deps.data);
    setCodexTabState(doc, _state.tab);
    _renderFilterBar(doc, deps.data);
    this.renderCodexContent(deps);
  },

  closeCodex(deps = {}) {
    const doc = _getDoc(deps);
    closeCodexModal(doc, {
      onBeforeHide: () => _closePopup(doc),
    });
  },

  setCodexTab(tab, deps = {}) {
    const doc = _getDoc(deps);
    _state.deps = deps;

    transitionCodexTab(doc, _state, tab, {
      force: !!deps._force,
      onBeforeRender: (nextTab) => {
        setCodexTabState(doc, nextTab);
      },
      onRender: () => {
        _renderFilterBar(doc, deps.data);
        this.renderCodexContent(deps);
      },
    });
  },

  renderCodexContent(deps = {}) {
    _state.deps = deps;
    const { gs, data } = deps;
    if (!gs || !data) return;

    const doc = _getDoc(deps);
    const content = doc.getElementById('codexContent');
    if (!content) return;

    const codex = _ensureCodex(gs);
    content.textContent = '';

    const enemies = Object.values(data.enemies || {});
    const inscriptions = Object.values(data.inscriptions || {});

    if (_state.tab === 'enemies') {
      _renderEnemyTab(doc, content, enemies, codex);
    } else if (_state.tab === 'cards') {
      _renderCardsTab(doc, content, data, codex);
    } else if (_state.tab === 'items') {
      _renderItemsTab(doc, content, data, gs, codex);
    } else if (_state.tab === 'inscriptions') {
      renderCodexInscriptions(doc, content, inscriptions, gs);
    }

    _renderProgress(doc, gs, data);
  },
};

if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (event) => {
    const popup = document.getElementById('cxDetailPopup');
    if (!popup?.classList.contains('open')) return;
    if (event.key === 'Escape') _closePopup(document);
    if (event.key === 'ArrowRight') _navPopup(1);
    if (event.key === 'ArrowLeft') _navPopup(-1);
  });
}
