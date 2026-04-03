import { registerFrontdoorBindings } from '../../../features/frontdoor/ports/runtime/public_frontdoor_runtime_surface.js';
import { registerRunEntryBindings } from '../../../features/run/ports/runtime/public_run_runtime_surface.js';

export function initRootEventHandlers(deps, doc, options = {}) {
  const actions = deps.actions || {};
  const {
    isEscapeKey,
    isVisibleModal,
  } = options;

  registerFrontdoorBindings({
    actions,
    audio: deps.audioEngine,
    doc,
    getIsTitleScreen: () => deps.gs?.currentScreen === 'title',
    isEscapeKey,
    isVisibleModal: (element) => isVisibleModal(element, doc),
  });

  registerRunEntryBindings({
    actions,
    audio: deps.audioEngine,
    doc,
    feedbackUI: deps.FeedbackUI,
    mazeSystem: deps.MazeSystem,
  });
}
