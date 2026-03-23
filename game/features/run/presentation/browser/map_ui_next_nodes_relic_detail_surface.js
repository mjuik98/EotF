import { runOnNextFrame } from './map_ui_next_nodes_render_helpers.js';
import {
  resolveItemDetailState,
  buildItemDetailViewModel,
  applyItemDetailPanelStyles,
  createManagedItemDetailSurface,
  setItemDetailPanelState,
} from './relic_detail_shared_ui.js';
import {
  createUiSurfaceStateController,
} from '../../../../shared/ui/state/ui_surface_state_controller.js';
import {
  applyRelicDetailLayout,
} from './map_relic_detail_layout.js';

const RELIC_DETAIL_HOVER_SAFE_DELAY = 90;

export function createRelicDetailSurfaceRuntime(options = {}) {
  const {
    doc,
    win,
    panel,
    list,
    data,
    gs,
    setBonusSystem = null,
    deps = {},
    onAnimate = null,
    onTitleHintVisible = null,
  } = options;

  const setTimer = deps?.setTimeout
    || win?.setTimeout?.bind?.(win)
    || null;
  const clearTimer = deps?.clearTimeout
    || win?.clearTimeout?.bind?.(win)
    || null;
  const setTitleHintVisible = typeof onTitleHintVisible === 'function'
    ? onTitleHintVisible
    : () => {};
  const animateDetailPanel = typeof onAnimate === 'function'
    ? onAnimate
    : () => {};

  const detailPanel = doc.createElement('div');
  detailPanel.className = 'nc-relic-detail';
  detailPanel.id = 'mapRelicDetailPanel';
  setItemDetailPanelState(detailPanel, { open: false });

  const detailSurfaceState = createUiSurfaceStateController({ element: detailPanel });
  const detailList = doc.createElement('div');
  detailList.className = 'nc-relic-detail-list';
  detailPanel.appendChild(detailList);
  applyItemDetailPanelStyles(detailPanel, detailList, { variant: 'compact' });

  let pendingClearTimer = null;
  const cancelPendingClear = () => {
    if (pendingClearTimer == null) return;
    if (typeof clearTimer === 'function') clearTimer(pendingClearTimer);
    pendingClearTimer = null;
  };

  const detailSurface = createManagedItemDetailSurface({
    doc,
    win,
    detailPanel,
    detailPanelList: detailList,
    entriesRoot: list,
    variant: 'compact',
    strategy: {
      shouldDismiss({ event, reason, detailPanel: activePanel }) {
        if (!detailSurfaceState.isOpen()) return false;
        if (reason === 'keydown') return event?.key === 'Escape';
        const target = event?.target;
        return !list?.contains?.(target) && !activePanel?.contains?.(target);
      },
      onDismiss({ clear }) {
        cancelPendingClear();
        clear();
        setTitleHintVisible(true);
      },
    },
  });

  const clearDetail = () => {
    cancelPendingClear();
    detailSurface.clear();
    setTitleHintVisible(true);
  };

  const scheduleDetailClear = (event = null) => {
    if (detailSurfaceState.isPinned()) return;
    const relatedTarget = event?.relatedTarget;
    if (relatedTarget && (detailPanel?.contains?.(relatedTarget) || list?.contains?.(relatedTarget))) return;
    cancelPendingClear();
    if (typeof setTimer !== 'function') {
      clearDetail();
      return;
    }
    pendingClearTimer = setTimer(() => {
      pendingClearTimer = null;
      if (detailSurfaceState.isPinned()) return;
      clearDetail();
    }, RELIC_DETAIL_HOVER_SAFE_DELAY);
  };

  const renderDetail = (itemId, item, activeSlot, options = {}) => {
    cancelPendingClear();
    const state = resolveItemDetailState(itemId, item, data, gs, setBonusSystem);
    const detail = buildItemDetailViewModel(itemId, item, data, state);
    detailSurface.show({
      activeEntry: activeSlot,
      detail,
      itemId,
      pinned: options.pinned === true,
    });
    setTitleHintVisible(false);
    applyRelicDetailLayout(panel, detailPanel, win, activeSlot);
    animateDetailPanel(detailPanel, activeSlot);
    runOnNextFrame(() => applyRelicDetailLayout(panel, detailPanel, win, activeSlot), deps);
  };

  detailPanel.__mapRelicDismissHandlers?.();
  detailPanel.__mapRelicDismissHandlers = detailSurface.bindDismiss();
  detailPanel.addEventListener('mouseenter', cancelPendingClear);
  detailPanel.addEventListener('mouseleave', (event) => {
    scheduleDetailClear(event);
  });

  return {
    detailPanel,
    detailSurfaceState,
    clearDetail,
    renderDetail,
    scheduleDetailClear,
  };
}
