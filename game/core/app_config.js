const DEFAULT_CONFIG = Object.freeze({
  appName: 'echo-of-the-fallen',
  env: 'production',
  logLevel: 'warn',
  eventHistoryMax: 100,
  eventDedupeWindowMs: 350,
  strictEventContracts: true,
  metricsWindowMinutes: 15,
  metricsTopN: 10,
});

function readViteEnv() {
  if (typeof import.meta === 'undefined' || !import.meta.env) return {};
  return import.meta.env;
}

function readWindowConfig() {
  if (typeof globalThis === 'undefined') return {};
  const value = globalThis.__GAME_CONFIG__;
  if (!value || typeof value !== 'object') return {};
  return value;
}

function normalizeEnv(rawEnv) {
  const env = String(rawEnv || '').toLowerCase();
  if (env === 'development' || env === 'dev') return 'development';
  if (env === 'test') return 'test';
  return 'production';
}

function clampNumber(value, fallback, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, num));
}

function resolveConfig() {
  const viteEnv = readViteEnv();
  const winCfg = readWindowConfig();
  const nodeEnv =
    typeof process !== 'undefined' && process?.env?.NODE_ENV
      ? process.env.NODE_ENV
      : undefined;

  const env = normalizeEnv(winCfg.env || viteEnv.MODE || nodeEnv || DEFAULT_CONFIG.env);

  return Object.freeze({
    appName: String(winCfg.appName || DEFAULT_CONFIG.appName),
    env,
    logLevel: String(winCfg.logLevel || DEFAULT_CONFIG.logLevel).toLowerCase(),
    eventHistoryMax: clampNumber(
      winCfg.eventHistoryMax,
      DEFAULT_CONFIG.eventHistoryMax,
      10,
      1000,
    ),
    eventDedupeWindowMs: clampNumber(
      winCfg.eventDedupeWindowMs,
      DEFAULT_CONFIG.eventDedupeWindowMs,
      0,
      5000,
    ),
    strictEventContracts:
      typeof winCfg.strictEventContracts === 'boolean'
        ? winCfg.strictEventContracts
        : DEFAULT_CONFIG.strictEventContracts,
    metricsWindowMinutes: clampNumber(
      winCfg.metricsWindowMinutes,
      DEFAULT_CONFIG.metricsWindowMinutes,
      1,
      240,
    ),
    metricsTopN: clampNumber(
      winCfg.metricsTopN,
      DEFAULT_CONFIG.metricsTopN,
      1,
      50,
    ),
  });
}

export const AppConfig = resolveConfig();

export function isDevMode() {
  return AppConfig.env === 'development' || AppConfig.env === 'test';
}
