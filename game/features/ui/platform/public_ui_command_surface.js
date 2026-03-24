import { createLegacyUiCommandFacade } from '../ports/runtime/public_ui_runtime_surface.js';

export function createPublicLegacyUiCommands(options = {}) {
  return createLegacyUiCommandFacade(options);
}
