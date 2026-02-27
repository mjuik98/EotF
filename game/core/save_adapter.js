// ═══════════════════════════════════════════════
//  SaveAdapter — 저장소 접근 추상화 계층
//  클라우드/IndexedDB로 전환 시 이 파일만 교체하면 됩니다.
// ═══════════════════════════════════════════════



export const SaveAdapter = {
    /**
     * 키에 해당하는 데이터를 읽어옵니다.
     * @param {string} key
     * @returns {any|null}
     */
    load(key) {
        try {
            const raw = window.localStorage.getItem(key);
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
            window.localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                // 용량 초과 시 오래된 데이터 정리 시도 (현재는 단순 알림)
                console.warn('[SaveAdapter] 저장 공간 부족 - QuotaExceededError');
                this._notifySaveFailed('저장 공간 부족');
            } else {
                console.error('[SaveAdapter] 저장 실패:', e);
            }
            return false;
        }
    },

    _notifySaveFailed(reason) {
        if (typeof document === 'undefined') return;
        const el = document.createElement('div');
        el.textContent = `⚠️ 저장 실패: ${reason}`;
        el.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#ff3366;color:white;padding:12px 20px;border-radius:8px;z-index:9999;font-family:sans-serif;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.5);';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 4000);
    },

    /**
     * 키에 해당하는 데이터를 삭제합니다.
     * @param {string} key
     */
    remove(key) {
        try {
            window.localStorage.removeItem(key);
        } catch (e) { /* silent */ }
    },

    /**
     * 키에 해당하는 데이터가 존재하는지 확인합니다.
     * @param {string} key
     * @returns {boolean}
     */
    has(key) {
        try {
            return window.localStorage.getItem(key) !== null;
        } catch (e) {
            return false;
        }
    },
};
