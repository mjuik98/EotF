/**
 * 보안 관련 유틸리티 함수 모음
 */
export const SecurityUtils = {
    /**
     * HTML 특수 문자를 이스케이프하여 XSS를 방지합니다.
     * @param {string} text - 이스케이프할 텍스트
     * @returns {string} 이스케이프된 텍스트
     */
    escapeHtml(text) {
        if (typeof text !== 'string') return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * 텍스트 노드를 안전하게 생성합니다.
     * @param {string} text 
     * @returns {Text}
     */
    createText(text) {
        return document.createTextNode(text);
    }
};
