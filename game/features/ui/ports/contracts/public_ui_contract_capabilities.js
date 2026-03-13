import { buildUiShellContractBuilders } from './build_ui_shell_contracts.js';

export function createUiContractCapabilities() {
  return {
    buildShell: buildUiShellContractBuilders,
  };
}
