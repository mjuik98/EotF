/**
 * 보안 관련 유틸리티 함수 모음
 */
export const SecurityUtils = {
    /**
     * HTML 특수 문자를 이스케이프하여 XSS를 방지합니다.
     * @param {any} text - 이스케이프할 텍스트
     * @returns {string} 이스케이프된 텍스트
     */
    escapeHtml(text) {
        if (text === null || text === undefined) return '';
        const s = String(text);
        return s.replace(/[&<>"']/g, (m) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[m]));
    },

    /**
     * 속성값을 생성할 때 사용할 수 있도록 이스케이프합니다.
     */
    escapeAttr(text) {
        return this.escapeHtml(text).replace(/\(/g, '&#40;').replace(/\)/g, '&#41;');
    },

    /**
     * 텍스트 노드를 안전하게 생성합니다.
     * @param {string} text 
     * @returns {Text}
     */
    createText(text) {
        return document.createTextNode(text);
    },

    /**
     * 안전한 요소 생성을 도와주는 래퍼
     */
    createSafeElement(tag, className = '', text = '') {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (text) el.textContent = text;
        return el;
    }
};
