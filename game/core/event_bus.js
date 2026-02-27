/**
 * event_bus.js — 글로벌 이벤트 버스 (Pub/Sub)
 *
 * 게임 내 모든 모듈이 느슨하게 결합되어 통신할 수 있는 중앙 이벤트 시스템.
 * 상태 변경 알림, UI 업데이트 트리거, 모듈 간 통신에 사용됩니다.
 */
class GameEventBus {
    constructor() {
        /** @type {Map<string, Set<Function>>} */
        this._listeners = new Map();

        /** @type {Array<{event: string, data: any, timestamp: number}>} */
        this._history = [];
        this._historyMax = 50;

        /** @type {boolean} */
        this._debug = false;
    }

    /**
     * 이벤트 구독
     * @param {string} event — 이벤트 이름 (예: 'player:damage', 'combat:start')
     * @param {Function} callback — 콜백 함수 (data) => void
     * @returns {Function} unsubscribe 함수
     */
    on(event, callback) {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, new Set());
        }
        this._listeners.get(event).add(callback);

        // unsubscribe 함수 반환
        return () => this.off(event, callback);
    }

    /**
     * 이벤트 한번만 구독
     */
    once(event, callback) {
        const wrapper = (data) => {
            this.off(event, wrapper);
            callback(data);
        };
        return this.on(event, wrapper);
    }

    /**
     * 이벤트 구독 해제
     */
    off(event, callback) {
        const set = this._listeners.get(event);
        if (set) {
            set.delete(callback);
            if (set.size === 0) this._listeners.delete(event);
        }
    }

    /**
     * 이벤트 발행
     * @param {string} event — 이벤트 이름
     * @param {any} data — 이벤트 데이터
     */
    emit(event, data = null) {
        if (this._debug) {
            console.log(`[EventBus] ${event}`, data);
        }

        // 히스토리 기록
        this._history.push({ event, data, timestamp: Date.now() });
        if (this._history.length > this._historyMax) this._history.shift();

        // 리스너 호출
        const set = this._listeners.get(event);
        if (set) {
            set.forEach(cb => {
                try {
                    cb(data);
                } catch (err) {
                    console.error(`[EventBus] Error in listener for '${event}':`, err);
                }
            });
        }

        // 와일드카드 리스너 ('*')
        const wildcard = this._listeners.get('*');
        if (wildcard) {
            wildcard.forEach(cb => {
                try { cb({ event, data }); } catch (e) { /* silent */ }
            });
        }
    }

    /**
     * 특정 이벤트의 모든 리스너 제거
     */
    clear(event) {
        if (event) {
            this._listeners.delete(event);
        } else {
            this._listeners.clear();
        }
    }

    /**
     * 디버그 모드 토글
     */
    setDebug(enabled) {
        this._debug = enabled;
    }

    /**
     * 이벤트 히스토리 조회 (디버깅용)
     */
    getHistory(filter) {
        if (!filter) return [...this._history];
        return this._history.filter(h => h.event.includes(filter));
    }
}

/** 싱글턴 인스턴스 */
export const EventBus = new GameEventBus();
