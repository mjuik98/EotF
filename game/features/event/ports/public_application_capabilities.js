import { buildEventSessionApplicationCapabilities } from './public_event_session_application_capabilities.js';
import { buildEventShopApplicationCapabilities } from './public_event_shop_application_capabilities.js';

export function createEventApplicationCapabilities() {
  return {
    ...buildEventSessionApplicationCapabilities(),
    ...buildEventShopApplicationCapabilities(),
  };
}

export * from './public_event_session_application_capabilities.js';
export * from './public_event_shop_application_capabilities.js';
