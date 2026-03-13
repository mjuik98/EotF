function normalizePresetSlot(slot) {
  return Math.max(0, Math.min(3, Math.floor(Number(slot) || 0)));
}

function cloneRunConfig(config) {
  return {
    ascension: Math.max(0, Math.floor(Number(config?.ascension) || 0)),
    endless: !!config?.endless,
    curse: String(config?.curse || 'none'),
    disabledInscriptions: Array.isArray(config?.disabledInscriptions)
      ? [...new Set(config.disabledInscriptions.map((id) => String(id)))]
      : [],
  };
}

export function ensureRunConfigMeta(meta) {
  if (!meta) return null;
  if (!meta.runConfig) {
    meta.runConfig = { ascension: 0, endless: false, curse: 'none', disabledInscriptions: [] };
  }
  if (!Array.isArray(meta.runConfig.disabledInscriptions)) {
    meta.runConfig.disabledInscriptions = [];
  }
  if ('blessing' in meta.runConfig) delete meta.runConfig.blessing;
  return meta.runConfig;
}

export function selectRunCurse(meta, runRules, id) {
  const cfg = ensureRunConfigMeta(meta);
  if (!cfg) return null;
  cfg.curse = runRules?.curses?.[id] ? id : 'none';
  return cfg.curse;
}

export function shiftRunAscension(meta, delta) {
  const cfg = ensureRunConfigMeta(meta);
  if (!cfg || !meta?.unlocks?.ascension) return Number(cfg?.ascension) || 0;

  const cur = Number.isFinite(cfg.ascension) ? cfg.ascension : 0;
  const maxAsc = Math.max(0, meta.maxAscension || 0);
  cfg.ascension = Math.max(0, Math.min(maxAsc, cur + (delta < 0 ? -1 : 1)));
  return cfg.ascension;
}

export function toggleRunEndless(meta) {
  const cfg = ensureRunConfigMeta(meta);
  if (!cfg || !meta?.unlocks?.endless) return !!cfg?.endless;
  cfg.endless = !cfg.endless;
  return cfg.endless;
}

export function toggleRunInscription(meta, key) {
  const cfg = ensureRunConfigMeta(meta);
  if (!cfg) return [];

  const inscriptionId = String(key || '');
  if (!inscriptionId) return cfg.disabledInscriptions;

  const disabled = cfg.disabledInscriptions;
  const idx = disabled.indexOf(inscriptionId);
  if (idx >= 0) disabled.splice(idx, 1);
  else disabled.push(inscriptionId);
  return disabled;
}

export function saveRunConfigPreset(meta, { slot, name } = {}) {
  const cfg = ensureRunConfigMeta(meta);
  if (!cfg) return null;

  const idx = normalizePresetSlot(slot);
  if (!Array.isArray(meta.runConfigPresets)) {
    meta.runConfigPresets = [null, null, null, null];
  }

  const existing = meta.runConfigPresets[idx];
  const fallbackName = existing?.name || `프리셋 ${idx + 1}`;
  const preset = {
    id: existing?.id || `preset-${idx + 1}`,
    name: String(name || fallbackName).trim().slice(0, 32) || fallbackName,
    config: cloneRunConfig(cfg),
  };
  meta.runConfigPresets[idx] = preset;
  return preset;
}

export function loadRunConfigPreset(meta, slot, runRules) {
  const cfg = ensureRunConfigMeta(meta);
  if (!cfg || !Array.isArray(meta?.runConfigPresets)) return null;

  const idx = normalizePresetSlot(slot);
  const preset = meta.runConfigPresets[idx];
  if (!preset?.config) return null;

  Object.assign(cfg, cloneRunConfig(preset.config));
  cfg.ascension = Math.max(0, Math.min(meta.maxAscension || 0, cfg.ascension));
  if (!meta.unlocks?.endless) cfg.endless = false;
  if (!runRules?.curses?.[cfg.curse]) cfg.curse = 'none';
  return cfg;
}

export function deleteRunConfigPreset(meta, slot) {
  if (!Array.isArray(meta?.runConfigPresets)) return false;
  const idx = normalizePresetSlot(slot);
  if (!meta.runConfigPresets[idx]) return false;

  meta.runConfigPresets[idx] = null;
  meta.runConfigPresets = meta.runConfigPresets.slice(0, 4);
  return true;
}
