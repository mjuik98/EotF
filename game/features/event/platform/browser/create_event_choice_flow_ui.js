import { presentEventChoiceResolution } from '../../presentation/browser/event_choice_resolution_presenter.js';
import { renderEventContinueChoice } from '../../presentation/event_continue_choice_presenter.js';
import {
  dismissEventModalRuntime,
  renderEventChoices,
} from '../event_runtime_dom.js';

export function createEventChoiceFlowUi() {
  return {
    dismissModal(doc, onDone, deps = {}) {
      return dismissEventModalRuntime(doc?.getElementById?.('eventModal') || null, onDone, deps);
    },

    presentResolution(payload = {}) {
      return presentEventChoiceResolution({
        ...payload,
        renderChoices: renderEventChoices,
        renderContinueChoice: renderEventContinueChoice,
      });
    },
  };
}
