import { AppConfig, isDevMode } from '../core/app_config.js';

const LOG_LEVEL_ORDER = Object.freeze({
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 99,
});

function resolveLevel(levelName) {
  const normalized = String(levelName || '').toLowerCase();
  return LOG_LEVEL_ORDER[normalized] || LOG_LEVEL_ORDER.warn;
}

function nowIso() {
  return new Date().toISOString();
}

function buildPrefix(level, context) {
  const safeContext = context || AppConfig.appName;
  return `[${level.toUpperCase()}][${safeContext}][${nowIso()}]`;
}

const _state = {
  isDev: isDevMode(),
  level: resolveLevel(AppConfig.logLevel),
};

export const Logger = {
  setLevel(levelName) {
    _state.level = resolveLevel(levelName);
  },

  getLevel() {
    const entry = Object.entries(LOG_LEVEL_ORDER).find(([, value]) => value === _state.level);
    return entry ? entry[0] : 'warn';
  },

  setDev(enabled) {
    _state.isDev = !!enabled;
  },

  _shouldLog(levelName) {
    return _state.level <= resolveLevel(levelName);
  },

  _emit(levelName, args, context = AppConfig.appName) {
    if (!_state.isDev && (levelName === 'debug' || levelName === 'info' || levelName === 'warn')) {
      return;
    }
    if (!this._shouldLog(levelName)) return;

    const prefix = buildPrefix(levelName, context);
    if (levelName === 'error') {
      console.error(prefix, ...args);
    } else if (levelName === 'warn') {
      console.warn(prefix, ...args);
    } else if (levelName === 'info') {
      console.info(prefix, ...args);
    } else {
      console.debug(prefix, ...args);
    }
  },

  debug(...args) {
    this._emit('debug', args);
  },

  info(...args) {
    this._emit('info', args);
  },

  log(...args) {
    this.info(...args);
  },

  warn(...args) {
    this._emit('warn', args);
  },

  error(...args) {
    this._emit('error', args);
  },

  child(context) {
    const safeContext = String(context || AppConfig.appName);
    return {
      debug: (...args) => Logger._emit('debug', args, safeContext),
      info: (...args) => Logger._emit('info', args, safeContext),
      log: (...args) => Logger._emit('info', args, safeContext),
      warn: (...args) => Logger._emit('warn', args, safeContext),
      error: (...args) => Logger._emit('error', args, safeContext),
    };
  },

  group(label) {
    if (!_state.isDev) return;
    console.group(`[GROUP] ${label}`);
  },

  groupCollapsed(label) {
    if (!_state.isDev) return;
    console.groupCollapsed(`[GROUP] ${label}`);
  },

  groupEnd() {
    if (!_state.isDev) return;
    console.groupEnd();
  },

  time(label) {
    if (!_state.isDev) return;
    console.time(label);
  },

  timeEnd(label) {
    if (!_state.isDev) return;
    console.timeEnd(label);
  },
};
