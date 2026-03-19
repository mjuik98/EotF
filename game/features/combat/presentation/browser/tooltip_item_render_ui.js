import { createItemTooltipElement } from './tooltip_item_element.js';
import { resolveItemTooltipState } from './tooltip_item_state.js';

export {
  createItemTooltipElement,
  resolveItemTooltipState,
};

export function removeItemTooltipElement(win, setTimeoutFn = setTimeout) {
  if (!win.__itemTooltipEl) return null;
  const el = win.__itemTooltipEl;
  win.__itemTooltipEl = null;
  el.style.animation = 'itemTipOut 0.14s ease forwards';
  setTimeoutFn(() => {
    if (el.parentNode) el.parentNode.removeChild(el);
  }, 140);
  return el;
}

export function positionItemTooltipElement(event, element, doc, win) {
  const rect = event.currentTarget.getBoundingClientRect();
  const margin = 10;
  element.style.left = '0px';
  element.style.top = '0px';
  doc.body.appendChild(element);

  const realRect = element.getBoundingClientRect();
  const actualH = Math.max(460, realRect.height || 460);
  const actualW = Math.max(268, realRect.width || 268);

  let x = rect.right + 14;
  let y = rect.top - 10;
  if (x + actualW + margin > win.innerWidth) x = rect.left - actualW - 14;
  if (x < margin) x = margin;
  if (x + actualW + margin > win.innerWidth) x = Math.max(margin, win.innerWidth - actualW - margin);
  if (y + actualH + margin > win.innerHeight) y = win.innerHeight - actualH - margin;
  if (y < margin) y = margin;

  element.style.left = `${Math.round(x)}px`;
  element.style.top = `${Math.round(y)}px`;
  return { x: Math.round(x), y: Math.round(y) };
}
