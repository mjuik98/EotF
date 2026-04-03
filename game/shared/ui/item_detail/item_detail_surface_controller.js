import {
  createUiSurfaceStateController,
} from '../state/ui_surface_state_controller.js';
import { renderItemDetailPanelContent } from './item_detail_panel_content.js';
import { resolveItemDetailPanelVariant } from './item_detail_panel_variants.js';

export function applyItemDetailPanelStyles(detailPanel, panelList, options = {}) {
  const variant = resolveItemDetailPanelVariant(options);
  if (detailPanel) {
    detailPanel.style.cssText = variant.panelStyle;
    if (detailPanel.dataset) detailPanel.dataset.detailVariant = variant.name;
  }
  if (panelList) {
    panelList.style.cssText = `display:flex;flex-direction:column;gap:${variant.gap};opacity:1;transform:translateY(0);transition:opacity .14s ease,transform .18s ease;will-change:opacity,transform`;
    if (panelList.dataset) panelList.dataset.detailVariant = variant.name;
  }
}

function getEntries(entriesRoot, entries) {
  if (Array.isArray(entries)) return entries.filter(Boolean);
  return Array.from(entriesRoot?.children || []).filter(Boolean);
}

export function resolveSurfaceEntries(entriesRoot, entries) {
  return typeof entries === 'function'
    ? getEntries(entriesRoot, entries())
    : getEntries(entriesRoot, entries);
}

export function setItemDetailPanelState(detailPanel, {
  open = false,
  itemId = '',
  pinned = false,
} = {}) {
  const controller = createUiSurfaceStateController({ element: detailPanel });
  if (open) {
    controller.open({
      pinned,
      values: { itemId },
    });
    return;
  }
  controller.close({ clearKeys: ['itemId'] });
}

export function markItemDetailActiveEntry({
  entriesRoot,
  entries,
  activeEntry = null,
} = {}) {
  getEntries(entriesRoot, entries).forEach((entry) => {
    if (entry === activeEntry) {
      if (entry.dataset) entry.dataset.active = 'true';
      entry.setAttribute?.('aria-pressed', 'true');
      return;
    }
    if (entry?.dataset) delete entry.dataset.active;
    entry?.setAttribute?.('aria-pressed', 'false');
  });
}

export function clearItemDetailSurface({
  detailPanel,
  detailPanelList,
  entriesRoot,
  entries,
} = {}) {
  if (detailPanelList) detailPanelList.textContent = '';
  setItemDetailPanelState(detailPanel, { open: false });
  markItemDetailActiveEntry({ entriesRoot, entries, activeEntry: null });
}

export function createItemDetailSurfaceController({
  doc,
  detailPanel,
  detailPanelList,
  entriesRoot,
  entries,
  variant = 'combat',
  strategy = {},
} = {}) {
  const buildBaseContext = (context = {}) => ({
    doc,
    detailPanel,
    detailPanelList,
    entriesRoot,
    entries: resolveSurfaceEntries(entriesRoot, entries),
    variant,
    ...context,
  });

  return {
    clear(context = {}) {
      const nextContext = buildBaseContext(context);
      strategy.beforeClear?.(nextContext);
      clearItemDetailSurface(nextContext);
      strategy.afterClear?.(nextContext);
      return nextContext;
    },

    show(context = {}) {
      const nextContext = buildBaseContext(context);
      if (!nextContext.detailPanelList || !nextContext.detail) {
        return this.clear(nextContext);
      }

      const showContext = strategy.resolveShowState
        ? { ...nextContext, ...strategy.resolveShowState(nextContext) }
        : nextContext;

      renderItemDetailSurface(showContext);
      strategy.afterShow?.(showContext);
      return showContext;
    },
  };
}

export function renderItemDetailSurface({
  doc,
  detailPanel,
  detailPanelList,
  entriesRoot,
  entries,
  activeEntry = null,
  detail,
  variant = 'combat',
  itemId = '',
  pinned = false,
} = {}) {
  if (!detailPanelList || !detail) {
    clearItemDetailSurface({ detailPanel, detailPanelList, entriesRoot, entries });
    return;
  }

  renderItemDetailPanelContent(doc, detailPanelList, detail, { variant });
  setItemDetailPanelState(detailPanel, {
    open: true,
    itemId,
    pinned,
  });
  markItemDetailActiveEntry({ entriesRoot, entries, activeEntry });
}
