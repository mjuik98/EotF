import { SettingsManager } from '../../platform/browser/settings_manager.js';
import {
  getInputBindingCode,
  inputCodeToLabel,
  keyboardEventMatchesCode,
} from '../../ports/public_input_capabilities.js';

export const eventMatchesCode = keyboardEventMatchesCode;
export const keyCodeToLabel = inputCodeToLabel;

export function getCurrentInputBindings() {
  return SettingsManager.get('keybindings') ?? {};
}

export function getKeybindingCode(actionId, fallback = undefined) {
  return getInputBindingCode(actionId, fallback, getCurrentInputBindings());
}
