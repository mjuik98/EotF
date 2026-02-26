/**
 * 환경별 로깅 유틸리티.
 * 개발 환경에서는 모든 로그를 출력하고, 운영 환경에서는 경고와 에러만 노출합니다.
 */
export const Logger = {
    _isDev: location.hostname === 'localhost' || location.hostname === '127.0.0.1',
    _minLevel: 0, // 0: DEBUG, 1: INFO, 2: WARN, 3: ERROR

    debug(...args) {
        if (this._isDev && this._minLevel <= 0) console.debug('[DEBUG]', ...args);
    },

    info(...args) {
        if (this._isDev && this._minLevel <= 1) console.info('[INFO]', ...args);
    },

    log(...args) {
        this.info(...args);
    },

    warn(...args) {
        if (this._isDev && this._minLevel <= 2) console.warn('[WARN]', ...args);
    },

    error(...args) {
        if (this._minLevel <= 3) console.error('[ERROR]', ...args);
    },

    group(label) {
        if (this._isDev) console.group(`[GROUP] ${label}`);
    },

    groupCollapsed(label) {
        if (this._isDev) console.groupCollapsed(`[GROUP] ${label}`);
    },

    groupEnd() {
        if (this._isDev) console.groupEnd();
    },

    time(label) {
        if (this._isDev) console.time(label);
    },

    timeEnd(label) {
        if (this._isDev) console.timeEnd(label);
    }
};
