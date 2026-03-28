import { AppConfig } from './app_config.js';

const MS_PER_MINUTE = 60 * 1000;

function _minuteBucket(ts) {
  return Math.floor(Number(ts) / MS_PER_MINUTE) * MS_PER_MINUTE;
}

function _clampTopN(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return AppConfig.metricsTopN;
  return Math.max(1, Math.min(50, Math.floor(n)));
}

function _createState() {
  return {
    totalEvents: 0,
    totalErrors: 0,
    eventCounts: new Map(),
    errorCounts: new Map(),
    minuteEventCounts: new Map(),
    minuteErrorCounts: new Map(),
  };
}

const _state = _createState();

function _incrementCount(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function _pruneMinuteMap(map, oldestMinuteTs) {
  for (const key of map.keys()) {
    if (key < oldestMinuteTs) map.delete(key);
  }
}

function _pruneOldBuckets(nowTs = Date.now()) {
  const nowMinute = _minuteBucket(nowTs);
  const oldestMinuteTs = nowMinute - (AppConfig.metricsWindowMinutes - 1) * MS_PER_MINUTE;
  _pruneMinuteMap(_state.minuteEventCounts, oldestMinuteTs);
  _pruneMinuteMap(_state.minuteErrorCounts, oldestMinuteTs);
}

function _buildTopEntries(map, keyName, topN) {
  return [...map.entries()]
    .sort((a, b) => (b[1] - a[1]) || String(a[0]).localeCompare(String(b[0])))
    .slice(0, topN)
    .map(([key, count]) => ({ [keyName]: key, count }));
}

function _sumMapValues(map) {
  let total = 0;
  for (const value of map.values()) total += value;
  return total;
}

function _countActiveMinutes(eventMap, errorMap) {
  const activeMinutes = new Set([
    ...eventMap.keys(),
    ...errorMap.keys(),
  ]);
  return activeMinutes.size;
}

function _toRate(errors, events) {
  if (!events) return 0;
  return Number((errors / events).toFixed(4));
}

function _toPerMinute(total, activeMinutes) {
  if (!activeMinutes) return 0;
  return Number((total / activeMinutes).toFixed(2));
}

function _buildPerMinuteSeries(nowTs) {
  const points = [];
  const nowMinute = _minuteBucket(nowTs);
  const firstMinute = nowMinute - (AppConfig.metricsWindowMinutes - 1) * MS_PER_MINUTE;

  for (let i = 0; i < AppConfig.metricsWindowMinutes; i += 1) {
    const minuteTs = firstMinute + i * MS_PER_MINUTE;
    const events = _state.minuteEventCounts.get(minuteTs) || 0;
    const errors = _state.minuteErrorCounts.get(minuteTs) || 0;
    points.push({
      minuteTs,
      events,
      errors,
      errorRate: _toRate(errors, events),
    });
  }

  return points;
}

export function recordRuntimeEvent(eventName, nowTs = Date.now()) {
  const event = String(eventName || 'unknown:event');
  _state.totalEvents += 1;
  _incrementCount(_state.eventCounts, event);
  _incrementCount(_state.minuteEventCounts, _minuteBucket(nowTs));
  _pruneOldBuckets(nowTs);
}

export function recordRuntimeError(code, nowTs = Date.now()) {
  const errorCode = String(code || 'unknown');
  _state.totalErrors += 1;
  _incrementCount(_state.errorCounts, errorCode);
  _incrementCount(_state.minuteErrorCounts, _minuteBucket(nowTs));
  _pruneOldBuckets(nowTs);
}

export function getRuntimeMetrics(options = {}) {
  const nowTs = Number.isFinite(Number(options.nowTs)) ? Number(options.nowTs) : Date.now();
  const topN = _clampTopN(options.topN);
  _pruneOldBuckets(nowTs);

  const recentEvents = _sumMapValues(_state.minuteEventCounts);
  const recentErrors = _sumMapValues(_state.minuteErrorCounts);
  const activeMinutes = _countActiveMinutes(_state.minuteEventCounts, _state.minuteErrorCounts);

  return {
    windowMinutes: AppConfig.metricsWindowMinutes,
    totals: {
      events: _state.totalEvents,
      errors: _state.totalErrors,
      uniqueEvents: _state.eventCounts.size,
      uniqueErrors: _state.errorCounts.size,
    },
    recent: {
      events: recentEvents,
      errors: recentErrors,
      activeMinutes,
      eventsPerMinute: _toPerMinute(recentEvents, activeMinutes),
      errorsPerMinute: _toPerMinute(recentErrors, activeMinutes),
      errorRate: _toRate(recentErrors, recentEvents),
    },
    topEvents: _buildTopEntries(_state.eventCounts, 'event', topN),
    topErrors: _buildTopEntries(_state.errorCounts, 'code', topN),
    perMinute: _buildPerMinuteSeries(nowTs),
  };
}

export function resetRuntimeMetrics() {
  _state.totalEvents = 0;
  _state.totalErrors = 0;
  _state.eventCounts.clear();
  _state.errorCounts.clear();
  _state.minuteEventCounts.clear();
  _state.minuteErrorCounts.clear();
}
