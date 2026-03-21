import { createLazyHelpPauseModule } from './create_lazy_help_pause_module.js';
import { createLazyMetaProgressionModule } from './create_lazy_meta_progression_module.js';

export function buildScreenOverlayBrowserModules() {
  return {
    MetaProgressionUI: createLazyMetaProgressionModule(),
    HelpPauseUI: createLazyHelpPauseModule(),
  };
}
