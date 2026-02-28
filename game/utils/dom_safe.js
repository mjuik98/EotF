import { DescriptionUtils } from './description_utils.js';
import { SecurityUtils } from './security.js';

export const DomSafe = {
    setText(el, text) {
        if (!el) return;
        el.textContent = text ?? '';
    },

    setEscapedHtml(el, text) {
        if (!el) return;
        el.innerHTML = SecurityUtils.escapeHtml(text ?? '');
    },

    setHighlightedText(el, text) {
        if (!el) return;
        el.innerHTML = DescriptionUtils.highlight(text ?? '');
    },
};

