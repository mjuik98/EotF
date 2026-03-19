import { createTitleBindingCapabilities } from '../../features/title/public.js';

export function createTitleSettingsBindings(modules, fns) {
  const bindings = createTitleBindingCapabilities();
  Object.assign(fns, bindings.createTitle(modules, fns, {
    doc: typeof document !== 'undefined' ? document : null,
    win: typeof window !== 'undefined' ? window : null,
  }));
}
