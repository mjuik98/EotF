import { createTitleBindingCapabilities } from '../../features/title/ports/public_binding_capabilities.js';

export function createTitleSettingsBindings(modules, fns) {
  const bindings = createTitleBindingCapabilities();
  Object.assign(fns, bindings.createTitle(modules, fns, {
    doc: typeof document !== 'undefined' ? document : null,
    win: typeof window !== 'undefined' ? window : null,
  }));
}
