import { createLazyCodexModule } from '../../../features/codex/platform/browser/create_lazy_codex_module.js';

export function registerCodexModules() {
  return {
    CodexUI: createLazyCodexModule(),
  };
}
