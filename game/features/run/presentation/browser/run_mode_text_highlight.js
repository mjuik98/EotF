import { DescriptionUtils } from '../../integration/ui_support_capabilities.js';

export function highlightRunModeText(text) {
  return DescriptionUtils.highlight(text || '');
}
