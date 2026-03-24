import {
  DescriptionUtils,
  RARITY_LABELS,
  RARITY_TEXT_COLORS,
} from '../../ports/presentation/public_combat_card_support_capabilities.js';
import {
  buildStackedToastClassName,
  createStackedToastQueue,
} from './feedback_ui_toast_stack.js';
import {
  buildCombatSummaryToastView,
  buildItemToastView,
  computeItemToastDuration,
} from './feedback_ui_toast_views.js';

const STACK_TOAST_EXIT_DELAY_MS = 320;
const ITEM_TOAST_MERGE_WINDOW_MS = 900;

function getDoc(deps) {
  return deps?.doc || document;
}

function highlightDescription(desc) {
  if (!desc) return '';
  return DescriptionUtils?.highlight?.(desc) || desc;
}

const toastStack = createStackedToastQueue({
  getDoc,
});

export function enqueueStackedToast(config) {
  toastStack.enqueue(config);
}

export function showCombatSummaryToast(dealt, taken, kills, deps = {}) {
  enqueueStackedToast({
    deps,
    durationMs: 4000,
    removeDelayMs: STACK_TOAST_EXIT_DELAY_MS,
    height: 132,
    createEl: (doc) => {
      return buildCombatSummaryToastView(doc, {
        dealt,
        taken,
        kills,
        className: buildStackedToastClassName('combat-stat-summary stack-toast--summary'),
      });
    },
    onBeforeRemove: (el) => {
      toastStack.markToastExiting(el);
    },
  });
}

export function showItemToastQueued(item, deps = {}, options = {}) {
  if (!item) return false;
  const rarity = item.rarity || 'common';

  enqueueStackedToast({
    deps,
    key: `item:${rarity}:${options?.typeLabel || ''}:${item.name || ''}:${item.desc || ''}`,
    mergeWindowMs: ITEM_TOAST_MERGE_WINDOW_MS,
    durationMs: computeItemToastDuration(item, options),
    removeDelayMs: STACK_TOAST_EXIT_DELAY_MS,
    height: 108,
    createEl: (doc, config) => {
      return buildItemToastView(doc, {
        item,
        rarity,
        options,
        className: buildStackedToastClassName('item-toast stack-toast--item'),
        highlightDescription,
        rarityLabels: RARITY_LABELS,
        rarityTextColors: RARITY_TEXT_COLORS,
        mergedCount: config?.mergedCount || 1,
      });
    },
    onBeforeRemove: (el) => toastStack.markToastExiting(el),
  });

  return true;
}
