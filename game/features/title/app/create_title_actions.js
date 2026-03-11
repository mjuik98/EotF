import { playUiClick } from '../../../domain/audio/audio_event_helpers.js';
import { createTitleFlowActions } from './title_flow_actions.js';
import { createTitleSettingsActions } from './title_settings_actions.js';
import { createTitleSystemActions } from './title_system_actions.js';

export function createTitleActions(ports) {
  const { doc, fns, modules, win } = ports;

  const context = {
    doc,
    fns,
    modules,
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
