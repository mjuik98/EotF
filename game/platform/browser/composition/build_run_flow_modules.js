import { RunModeUI } from '../../../ui/run/run_mode_ui.js';
import { RunStartUI } from '../../../ui/run/run_start_ui.js';
import { RunSetupUI } from '../../../ui/run/run_setup_ui.js';
import { RunReturnUI } from '../../../ui/run/run_return_ui.js';

export function buildRunFlowModules() {
  return {
    RunModeUI,
    RunStartUI,
    RunSetupUI,
    RunReturnUI,
  };
}
