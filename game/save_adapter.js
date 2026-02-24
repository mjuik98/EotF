'use strict';

// ═══════════════════════════════════════════════
//  SaveAdapter — 저장소 접근 추상화 계층
//  클라우드/IndexedDB로 전환 시 이 파일만 교체하면 됩니다.
// ═══════════════════════════════════════════════

(function initSaveAdapter(globalObj) {

    const SaveAdapter = {
        /**
         * 키에 해당하는 데이터를 읽어옵니다.
         * @param {string} key
         * @returns {any|null}
         */
        load(key) {
            try {
                const raw = globalObj.localStorage.getItem(key);
                return raw !== null ? JSON.parse(raw) : null;
            } catch (e) {
                return null;
            }
        },

        /**
         * 데이터를 저장합니다.
         * @param {string} key
         * @param {any} data
         */
        save(key, data) {
            try {
                globalObj.localStorage.setItem(key, JSON.stringify(data));
            } catch (e) { /* quota exceeded 등 — silent */ }
        },

        /**
         * 키에 해당하는 데이터를 삭제합니다.
         * @param {string} key
         */
        remove(key) {
            try {
                globalObj.localStorage.removeItem(key);
            } catch (e) { /* silent */ }
        },

        /**
         * 키에 해당하는 데이터가 존재하는지 확인합니다.
         * @param {string} key
         * @returns {boolean}
         */
        has(key) {
            try {
                return globalObj.localStorage.getItem(key) !== null;
            } catch (e) {
                return false;
            }
        },
    };

    globalObj.SaveAdapter = SaveAdapter;
})(window);
