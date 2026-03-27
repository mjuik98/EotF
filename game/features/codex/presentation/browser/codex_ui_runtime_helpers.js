import {
  applyCodexFilter,
  buildCodexRewardRoadmap,
  buildCodexProgress,
  buildRecentCodexDiscoveries,
  ensureCodexState,
  getCodexFilterDefinitions,
  getCodexRecord,
  getEnemyTypeClass,
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
import {
  openCardCodexPopup,
  openEnemyCodexPopup,
  openItemCodexPopup,
} from './codex_ui_popup_runtime.js';

export function renderCodexRuntimeProgress(state, ui, doc, gs, data) {
  const progress = {
    ...buildCodexProgress(gs, data),
    rewardRoadmap: buildCodexRewardRoadmap(gs?.meta),
    recentDiscoveries: buildRecentCodexDiscoveries(gs?.meta, { data }),
  };
  renderCodexProgress(doc, progress, {
    onSelectTab: (tab) => ui.setCodexTab(tab, state.deps),
  });
}

export function renderCodexRuntimeFilterBar(state, ui, doc, data) {
  renderCodexFilterBar(doc, {
    definitions: getCodexFilterDefinitions(data)[state.tab] || [],
    filter: state.filter,
    showUnknown: state.showUnknown,
    onFilterChange: (nextFilter) => {
      state.filter = nextFilter;
      renderCodexRuntimeFilterBar(state, ui, doc, data);
      ui.renderCodexContent(state.deps);
    },
    onToggleUnknown: () => {
      state.showUnknown = !state.showUnknown;
      renderCodexRuntimeFilterBar(state, ui, doc, data);
      ui.renderCodexContent(state.deps);
    },
  });
}

export function applyCodexRuntimeFilter(state, entries, codex, category) {
  return applyCodexFilter(entries, codex, category, {
    search: state.search,
    filter: state.filter,
    sort: state.sort,
    showUnknown: state.showUnknown,
    getRecord: (recordCategory, id) => getCodexRecord(state.deps?.gs, recordCategory, id),
  });
}

export function renderCodexRuntimeSection(state, doc, container, title, icon, entries, buildCard, navList) {
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

export function createCodexRuntimeEnemyCard(state, enemy, index, navList, doc) {
  const codex = ensureCodexState(state.deps?.gs);
  return createCodexEnemyCard(doc, enemy, index, {
    gs: state.deps?.gs,
    typeClass: getEnemyTypeClass(enemy),
    onOpen: (entry) => openEnemyCodexPopup(state, entry, navList.filter((candidate) => codex.enemies.has(candidate.id))),
  });
}

export function createCodexRuntimeCardEntry(state, cardEntry, index, navList, doc) {
  const codex = ensureCodexState(state.deps?.gs);
  return createCodexCardEntry(doc, cardEntry, index, {
    gs: state.deps?.gs,
    onOpen: (entry) => openCardCodexPopup(state, entry, navList.filter((candidate) => isSeenCodexCard(codex, candidate.id))),
  });
}

export function createCodexRuntimeItemCard(state, item, index, navList, doc) {
  const codex = ensureCodexState(state.deps?.gs);
  return createCodexItemCard(doc, item, index, {
    gs: state.deps?.gs,
    data: state.deps?.data,
    onOpen: (entry) => openItemCodexPopup(state, entry, navList.filter((candidate) => codex.items.has(candidate.id))),
  });
}

export function renderCodexRuntimeSetView(state, doc, container, data, gs) {
  const items = Object.values(data.items || {});
  const codex = ensureCodexState(gs);
  renderCodexSetView(doc, container, data, gs, {
    onOpenItem: (item) => openItemCodexPopup(state, item, items.filter((entry) => codex.items.has(entry.id))),
  });
}

export function renderCodexRuntimeEmpty(container, message) {
  renderCodexEmpty(container, message);
}
