import { playUiClick } from '../../integration/ui_support_capabilities.js';
import {
  renderCardsCodexTab,
  renderEnemyCodexTab,
  renderItemsCodexTab,
} from './codex_ui_content_runtime.js';
import { renderCodexInscriptions } from './codex_ui_inscriptions.js';
import {
  applyCodexRuntimeFilter,
  createCodexRuntimeCardEntry,
  createCodexRuntimeEnemyCard,
  createCodexRuntimeItemCard,
  renderCodexRuntimeEmpty,
  renderCodexRuntimeFilterBar,
  renderCodexRuntimeProgress,
  renderCodexRuntimeSection,
  renderCodexRuntimeSetView,
} from './codex_ui_runtime_helpers.js';
import { setCodexTabState } from './codex_ui_structure.js';

export function createCodexModalCallbacks(state, ui) {
  return {
    onSearchChange: (value) => {
      state.search = value.toLowerCase();
      ui.renderCodexContent(state.deps);
    },
    onSortChange: (value) => {
      state.sort = value;
      ui.renderCodexContent(state.deps);
    },
    onClose: () => {
      playUiClick(state.deps?.audioEngine);
      ui.closeCodex(state.deps);
    },
    onTabSelect: (tab) => {
      playUiClick(state.deps?.audioEngine);
      ui.setCodexTab(tab, state.deps);
    },
  };
}

export function renderCodexTabContent(state, ui, doc, deps, codex, getBaseCodexCards) {
  const { gs, data } = deps;
  const content = doc.getElementById('codexContent');
  if (!content) return false;

  content.textContent = '';
  const enemies = Object.values(data.enemies || {});
  const inscriptions = Object.values(data.inscriptions || {});

  if (state.tab === 'enemies') {
    renderEnemyCodexTab(state, doc, content, enemies, codex, {
      applyFilter: applyCodexRuntimeFilter,
      renderSection: renderCodexRuntimeSection,
      renderEmpty: renderCodexRuntimeEmpty,
      makeEnemyCard: createCodexRuntimeEnemyCard,
    });
  } else if (state.tab === 'cards') {
    renderCardsCodexTab(state, doc, content, data, codex, {
      applyFilter: applyCodexRuntimeFilter,
      renderSection: renderCodexRuntimeSection,
      renderEmpty: renderCodexRuntimeEmpty,
      makeCardEntry: createCodexRuntimeCardEntry,
      getBaseCodexCards,
    });
  } else if (state.tab === 'items') {
    renderItemsCodexTab(state, doc, content, data, gs, codex, {
      applyFilter: applyCodexRuntimeFilter,
      renderEmpty: renderCodexRuntimeEmpty,
      renderSection: renderCodexRuntimeSection,
      renderSetView: renderCodexRuntimeSetView,
      makeItemCard: createCodexRuntimeItemCard,
    });
  } else if (state.tab === 'inscriptions') {
    renderCodexInscriptions(doc, content, inscriptions, gs);
  }

  renderCodexRuntimeProgress(state, ui, doc, gs, data);
  return true;
}

export function applyCodexTabTransition(state, ui, doc, deps, transitionCodexTab) {
  return transitionCodexTab(doc, state, deps.tab, {
    force: !!deps._force,
    onBeforeRender: (nextTab) => {
      setCodexTabState(doc, nextTab);
    },
    onRender: () => {
      renderCodexRuntimeFilterBar(state, ui, doc, deps.data);
      ui.renderCodexContent(deps);
    },
  });
}
