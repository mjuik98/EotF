import { HelpPauseUI } from '../../ports/public_help_pause_ui.js';
import { createLazyMetaProgressionModule } from './create_lazy_meta_progression_module.js';

export function buildScreenOverlayBrowserModules() {
  return {
    MetaProgressionUI: createLazyMetaProgressionModule(),
    HelpPauseUI,
  };
}
