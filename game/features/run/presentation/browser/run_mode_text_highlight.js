import { DescriptionUtils } from '../../../ui/ports/public_text_support_capabilities.js';

export function highlightRunModeText(text) {
  return DescriptionUtils.highlight(text || '');
}
