import { playUiClick } from '../../../../domain/audio/audio_event_helpers.js';
import { createTitleFlowActions } from './create_title_flow_actions.js';
import { createTitleSettingsActions } from './create_title_settings_actions.js';
import { createTitleSystemActions } from './create_title_system_actions.js';
import { resolveTitleActionModules } from './resolve_title_action_modules.js';

export function createTitleActions(ports) {
  const { doc, fns, modules: moduleRegistry, win } = ports;
  const modules = resolveTitleActionModules(moduleRegistry);

  const context = {
    doc,
    fns,
    modules,
    moduleRegistry,
    ports,
    win,
    playClick: () => playUiClick(modules.AudioEngine),
    saveVolumes: () => modules.GameInit?.saveVolumes?.(modules.AudioEngine),
  };

  return {
    ...createTitleFlowActions(context),
    ...createTitleSettingsActions(context),
    ...createTitleSystemActions(context),
  };
}
