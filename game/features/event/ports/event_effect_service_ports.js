import { createEventEffectServices as createBrowserEventEffectServices } from '../platform/browser/event_effect_services.js';

export function resolveEventEffectServices(deps = {}, { audioEngine } = {}) {
  if (deps.eventEffectServices) return deps.eventEffectServices;

  const createEventEffectServices = deps.createEventEffectServices || createBrowserEventEffectServices;
  return createEventEffectServices({
    audioEngine,
    playItemGet: deps.playItemGet,
    showItemToast: deps.showItemToast,
  });
}
