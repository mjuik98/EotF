import { registerEscapeSurface } from '../../runtime/overlay_escape_support.js';
import {
  createItemDetailSurfaceController,
  resolveSurfaceEntries,
} from './item_detail_surface_controller.js';

export function bindItemDetailDismissStrategy({
  doc,
  win,
  detailPanel,
  shouldDismiss,
  onDismiss,
} = {}) {
  if (!detailPanel || typeof onDismiss !== 'function') return () => {};

  const pointerdown = (event) => {
    if (!shouldDismiss?.({ event, reason: 'pointerdown', detailPanel })) return;
    onDismiss({ event, reason: 'pointerdown', detailPanel });
  };
  const keydown = (event) => {
    if (!shouldDismiss?.({ event, reason: 'keydown', detailPanel })) return;
    onDismiss({ event, reason: 'keydown', detailPanel });
  };

  doc?.addEventListener?.('pointerdown', pointerdown, true);
  win?.addEventListener?.('keydown', keydown);

  return () => {
    doc?.removeEventListener?.('pointerdown', pointerdown, true);
    win?.removeEventListener?.('keydown', keydown);
  };
}

export function createManagedItemDetailSurface({
  doc,
  win,
  detailPanel,
  detailPanelList,
  entriesRoot,
  entries,
  escapeHotkeyKey = detailPanel?.id || 'detail',
  escapePriority = 300,
  escapeScopes = ['run'],
  variant = 'combat',
  strategy = {},
  } = {}) {
  const controller = createItemDetailSurfaceController({
    doc,
    detailPanel,
    detailPanelList,
    entriesRoot,
    entries,
    variant,
    strategy,
  });

  let closeSurface = () => controller.clear();
  const registerSurface = () => {
    if (!detailPanel || !doc) return () => {};
    return registerEscapeSurface(doc, detailPanel, {
      close: () => closeSurface(),
      hotkeyKey: escapeHotkeyKey,
      isVisible: () => detailPanel?.dataset?.open === 'true',
      priority: escapePriority,
      scopes: escapeScopes,
    });
  };
  let resetEscapeSurface = registerSurface();
  controller.closeSurface = () => closeSurface();
  controller.bindDismiss = (context = {}) => {
    if (!strategy.shouldDismiss && !strategy.onDismiss) return () => {};

    const buildDismissContext = (payload = {}) => ({
      doc,
      win,
      detailPanel,
      entriesRoot,
      entries: resolveSurfaceEntries(entriesRoot, entries),
      clear: () => controller.clear(context),
      ...context,
      ...payload,
    });

    closeSurface = () => {
      const payload = buildDismissContext({ event: null, reason: 'escape-surface' });
      if (strategy.onDismiss) {
        strategy.onDismiss(payload);
        return;
      }
      controller.clear(context);
    };
    resetEscapeSurface();
    resetEscapeSurface = registerSurface();

    const cleanup = bindItemDetailDismissStrategy({
      doc,
      win,
      detailPanel,
      shouldDismiss: strategy.shouldDismiss
        ? (payload) => strategy.shouldDismiss(buildDismissContext(payload))
        : undefined,
      onDismiss: strategy.onDismiss
        ? (payload) => strategy.onDismiss(buildDismissContext(payload))
        : () => controller.clear(context),
    });
    return () => {
      cleanup();
      closeSurface = () => controller.clear(context);
      resetEscapeSurface();
      resetEscapeSurface = registerSurface();
    };
  };
  return controller;
}
