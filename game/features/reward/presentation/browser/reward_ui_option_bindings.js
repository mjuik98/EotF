import { bindTooltipTrigger, createTooltipTriggerEvent } from '../../../ui/ports/public_tooltip_support_capabilities.js';

function callTooltipMethod(deps, method, ...args) {
  const tooltipUI = deps?.tooltipUI || deps?.TooltipUI;
  if (typeof tooltipUI?.[method] !== 'function') return;
  tooltipUI[method](...args);
}

export function hideRewardTooltips(deps) {
  callTooltipMethod(deps, 'hideTooltip', deps);
  callTooltipMethod(deps, 'hideItemTooltip', deps);
  callTooltipMethod(deps, 'hideGeneralTooltip', deps);
}

export function bindRewardTooltipHandlers(wrapper, deps, show, hideMethod) {
  if (typeof show !== 'function') return;
  bindTooltipTrigger(wrapper, {
    label: wrapper.getAttribute?.('aria-label') || '',
    show,
    hide() {
      callTooltipMethod(deps, hideMethod, deps);
    },
  });
}

export function createRewardTooltipTrigger(event, wrapper) {
  return createTooltipTriggerEvent(event, wrapper);
}

export function invokeRewardTooltip(deps, method, ...args) {
  callTooltipMethod(deps, method, ...args);
}
