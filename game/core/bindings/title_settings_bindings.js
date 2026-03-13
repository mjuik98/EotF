import { createTitleFeatureFacade } from '../../features/title/public.js';

export function createTitleSettingsBindings(modules, fns) {
  const { bindings } = createTitleFeatureFacade();
  Object.assign(fns, bindings.createTitle(modules, fns, {
    doc: typeof document !== 'undefined' ? document : null,
    win: typeof window !== 'undefined' ? window : null,
  }));
}
