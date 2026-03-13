import {
  createItemTooltipElement,
  positionItemTooltipElement,
  removeItemTooltipElement,
  resolveItemTooltipState,
} from './tooltip_item_render_ui.js';

export function hideItemTooltipUi(deps = {}) {
  const win = deps?.win || window;
  removeItemTooltipElement(win);
}

export function showItemTooltipUi(event, itemId, deps = {}) {
  const data = deps.data;
  const gs = deps.gs;
  const setBonusSystem = deps.setBonusSystem;
  if (!data?.items) return;

  const item = data.items[itemId];
  if (!item) return;

  const doc = deps?.doc || document;
  const win = deps?.win || window;
  removeItemTooltipElement(win);
  const state = resolveItemTooltipState(itemId, item, data, gs, setBonusSystem);
  const el = createItemTooltipElement(doc, item, data, state);
  positionItemTooltipElement(event, el, doc, win);
  win.__itemTooltipEl = el;
}
