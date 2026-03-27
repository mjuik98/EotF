import { createTitleBindingCapabilities } from '../../features/title/ports/public_binding_capabilities.js';
import { resolveBrowserRuntime } from '../runtime_environment.js';

export function createTitleSettingsBindings(modules, fns) {
  const bindings = createTitleBindingCapabilities();
  const runtime = resolveBrowserRuntime();
  Object.assign(fns, bindings.createTitle(modules, fns, {
    doc: runtime.doc,
    win: runtime.win,
  }));
}
