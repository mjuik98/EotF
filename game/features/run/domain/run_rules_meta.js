export function ensureRunMeta(meta, { curses, data, ensureCodexState, ensureCodexRecords, ensureClassProgressionMeta }) {
  if (!meta || typeof meta !== 'object') return;

  if (!meta.worldMemory || typeof meta.worldMemory !== 'object') meta.worldMemory = {};
  if (!meta.inscriptions || typeof meta.inscriptions !== 'object') {
    meta.inscriptions = { echo_boost: false, resilience: false, fortune: false };
  }
  if (!Array.isArray(meta.storyPieces)) meta.storyPieces = [];

  ensureCodexState({ meta });
  ensureCodexRecords({ meta });

  if (!meta.unlocks || typeof meta.unlocks !== 'object') meta.unlocks = {};
  if (typeof meta.unlocks.ascension !== 'boolean') meta.unlocks.ascension = (meta.runCount || 1) > 1;
  if (typeof meta.unlocks.endless !== 'boolean') meta.unlocks.endless = false;

  if (!Number.isFinite(meta.maxAscension)) {
    meta.maxAscension = meta.unlocks.ascension ? 1 : 0;
  }

  if (!meta.runConfig || typeof meta.runConfig !== 'object') {
    meta.runConfig = { ascension: 0, endless: false, curse: 'none', disabledInscriptions: [] };
  }
  if (!Array.isArray(meta.runConfig.disabledInscriptions)) {
    meta.runConfig.disabledInscriptions = [];
  }
  if (typeof meta.runConfig.endless !== 'boolean' && typeof meta.runConfig.endlessMode === 'boolean') {
    meta.runConfig.endless = meta.runConfig.endlessMode;
  }
  if (!Number.isFinite(meta.runConfig.ascension)) meta.runConfig.ascension = 0;
  if (typeof meta.runConfig.endless !== 'boolean') meta.runConfig.endless = false;
  if ('blessing' in meta.runConfig) delete meta.runConfig.blessing;
  if (!curses[meta.runConfig.curse]) meta.runConfig.curse = 'none';
  if (!Array.isArray(meta.runConfigPresets)) meta.runConfigPresets = [];
  if (!meta.progress || typeof meta.progress !== 'object') {
    meta.progress = { echoShards: 0, totalDamage: 0, victories: 0, failures: 0, bossKills: {} };
  }
  if (!Number.isFinite(meta.progress.echoShards)) meta.progress.echoShards = 0;
  if (!Number.isFinite(meta.progress.totalDamage)) meta.progress.totalDamage = 0;
  if (!Number.isFinite(meta.progress.victories)) meta.progress.victories = 0;
  if (!Number.isFinite(meta.progress.failures)) meta.progress.failures = 0;
  if (!meta.progress.bossKills || typeof meta.progress.bossKills !== 'object') meta.progress.bossKills = {};

  meta.maxAscension = Math.max(0, Math.floor(meta.maxAscension));
  meta.runConfig.ascension = Math.max(0, Math.min(meta.maxAscension, Math.floor(meta.runConfig.ascension)));
  if (!meta.unlocks.endless) meta.runConfig.endless = false;
  meta.runConfigPresets = Array.from({ length: 4 }, (_, idx) => {
    const preset = Array.isArray(meta.runConfigPresets) ? meta.runConfigPresets[idx] : null;
    if (!preset || typeof preset !== 'object') return null;

    const config = preset.config && typeof preset.config === 'object' ? preset.config : {};
    const ascension = Math.max(0, Math.min(meta.maxAscension, Math.floor(Number(config.ascension) || 0)));
    const endless = meta.unlocks.endless ? !!config.endless : false;
    const curse = curses[config.curse] ? config.curse : 'none';
    const disabledInscriptions = Array.isArray(config.disabledInscriptions)
      ? [...new Set(config.disabledInscriptions.map((id) => String(id)))]
      : [];
    return {
      id: String(preset.id || `preset-${idx + 1}`),
      name: String(preset.name || `Preset ${idx + 1}`).slice(0, 32),
      config: {
        ascension,
        endless,
        curse,
        disabledInscriptions,
      },
    };
  });

  const classIds = Object.keys(data?.classes || {});
  ensureClassProgressionMeta(meta, classIds);
}
