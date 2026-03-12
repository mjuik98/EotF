import { createEventRuntimeDomActions } from './browser/create_event_runtime_dom_actions.js';

export function dismissEventModalRuntime(modal, onDone, deps = {}) {
  return createEventRuntimeDomActions().dismissEventModal(modal, onDone, deps);
}

export function renderEventChoices(event, doc, gs, onResolve) {
  return createEventRuntimeDomActions().renderEventChoices(event, doc, gs, onResolve);
}

export function openEventItemShopRuntime(gsArg, deps = {}, options) {
  return createEventRuntimeDomActions().openEventItemShop(gsArg, deps, options);
}

export function openEventRestSiteRuntime(deps = {}, options) {
  return createEventRuntimeDomActions().openEventRestSite(deps, options);
}

export function openEventShopRuntime(deps = {}, options) {
  return createEventRuntimeDomActions().openEventShop(deps, options);
}

export function renderEventShellRuntime(event, options) {
  return createEventRuntimeDomActions().renderEventShell(event, options);
}

export function showEventCardDiscardOverlay(gs, data, isBurn = false, deps = {}) {
  return createEventRuntimeDomActions().showEventCardDiscard(gs, data, isBurn, deps);
}
