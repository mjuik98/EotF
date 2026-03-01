function _getDoc(deps) {
  return deps?.doc || document;
}

function _getMeta(gs) {
  return gs?.meta || null;
}

function _ensureRunConfig(meta) {
  if (!meta) return null;
  if (!meta.runConfig) {
    meta.runConfig = { ascension: 0, endless: false, blessing: 'none', curse: 'none', disabledInscriptions: [] };
  }
  if (!Array.isArray(meta.runConfig.disabledInscriptions)) {
    meta.runConfig.disabledInscriptions = [];
  }
  return meta.runConfig;
}

function _getInscriptionLevel(meta, runConfig, id) {
  if (!meta?.inscriptions) return 0;
  if (runConfig?.disabledInscriptions?.includes(id)) return 0;
  const val = meta.inscriptions[id];
  if (typeof val === 'boolean') return val ? 1 : 0;
  return Math.max(0, Math.floor(Number(val) || 0));
}

function _getActiveSynergies(meta, runConfig, data) {
  if (!data?.synergies) return [];
  const active = [];
  outer: for (const [id, syn] of Object.entries(data.synergies)) {
    const reqs = id.split('+');
    for (const req of reqs) {
      if (_getInscriptionLevel(meta, runConfig, req) < 1) continue outer;
    }
    active.push({ id, syn });
  }
  return active;
}

export const RunModeUI = {
  refresh(deps = {}) {
    const gs = deps.gs;
    const runRules = deps.runRules;
    if (!gs || !runRules) return;

    const doc = _getDoc(deps);
    const panel = doc.getElementById('runModePanel');
    if (!panel) return;

    const meta = _getMeta(gs);
    if (!meta) return;
    runRules.ensureMeta(meta);
    const cfg = _ensureRunConfig(meta);

    const maxAsc = Math.max(0, meta.maxAscension || 0);
    const ascUnlocked = !!meta.unlocks?.ascension;
    const endlessUnlocked = !!meta.unlocks?.endless;

    const ascValueEl = doc.getElementById('ascensionValue');
    const ascCapEl = doc.getElementById('ascensionCap');
    if (ascValueEl) ascValueEl.textContent = `A${cfg.ascension}`;
    if (ascCapEl) ascCapEl.textContent = `Max A${maxAsc}`;

    panel.querySelectorAll('[onclick^="shiftAscension"]').forEach((btn) => {
      btn.disabled = !ascUnlocked || maxAsc <= 0;
    });

    const endlessBtn = doc.getElementById('endlessToggleBtn');
    if (endlessBtn) {
      const endlessOn = !!cfg.endless;
      endlessBtn.disabled = !endlessUnlocked;
      endlessBtn.textContent = endlessOn ? 'ON' : 'OFF';
      endlessBtn.style.borderColor = endlessOn ? 'rgba(0,255,204,0.6)' : '';
      endlessBtn.style.color = endlessOn ? 'var(--cyan)' : '';
    }

    const blessing = runRules.blessings[cfg.blessing] || runRules.blessings.none;
    const curse = runRules.curses[cfg.curse] || runRules.curses.none;
    const blessingBtn = doc.getElementById('blessingCycleBtn');
    const curseBtn = doc.getElementById('curseCycleBtn');
    if (blessingBtn) blessingBtn.textContent = blessing.name;
    if (curseBtn) curseBtn.textContent = curse.name;

    const descEl = doc.getElementById('runModeDesc');
    if (descEl) {
      const chunks = [];
      if (cfg.ascension > 0) chunks.push(`Ascension A${cfg.ascension}: enemy scaling increased`);
      else chunks.push('Ascension A0: normal run');

      if (cfg.endless) chunks.push('Endless: run loops after the final region');
      if (blessing.id !== 'none') chunks.push(`Blessing: ${blessing.desc}`);
      if (curse.id !== 'none') chunks.push(`Curse: ${curse.desc}`);
      if (!ascUnlocked) chunks.push('Ascension unlocks after chapter 2');
      if (!endlessUnlocked) chunks.push('Endless unlocks via meta progression');

      descEl.textContent = chunks.join(' | ');
      descEl.style.display = chunks.length > 0 ? 'block' : 'none';
    }
  },

  shiftAscension(delta, deps = {}) {
    const gs = deps.gs;
    const runRules = deps.runRules;
    if (!gs || !runRules) return;

    const meta = _getMeta(gs);
    if (!meta) return;
    runRules.ensureMeta(meta);
    const cfg = _ensureRunConfig(meta);

    if (!meta.unlocks?.ascension) {
      this.refresh(deps);
      return;
    }

    const cur = Number.isFinite(cfg.ascension) ? cfg.ascension : 0;
    const maxAsc = Math.max(0, meta.maxAscension || 0);
    const step = delta < 0 ? -1 : 1;
    cfg.ascension = Math.max(0, Math.min(maxAsc, cur + step));

    this.refresh(deps);
    if (typeof deps.saveMeta === 'function') deps.saveMeta();
  },

  toggleEndlessMode(deps = {}) {
    const gs = deps.gs;
    const runRules = deps.runRules;
    if (!gs || !runRules) return;

    const meta = _getMeta(gs);
    if (!meta) return;
    runRules.ensureMeta(meta);
    const cfg = _ensureRunConfig(meta);

    if (!meta.unlocks?.endless) {
      if (typeof deps.notice === 'function') {
        deps.notice('Endless mode is not unlocked yet.');
      }
      this.refresh(deps);
      return;
    }

    cfg.endless = !cfg.endless;
    this.refresh(deps);
    if (typeof deps.saveMeta === 'function') deps.saveMeta();
  },

  cycleBlessing(deps = {}) {
    const gs = deps.gs;
    const runRules = deps.runRules;
    if (!gs || !runRules) return;

    const meta = _getMeta(gs);
    if (!meta) return;
    runRules.ensureMeta(meta);
    const cfg = _ensureRunConfig(meta);

    cfg.blessing = runRules.nextBlessingId(cfg.blessing || 'none');
    this.refresh(deps);
    if (typeof deps.saveMeta === 'function') deps.saveMeta();
  },

  cycleCurse(deps = {}) {
    const gs = deps.gs;
    const runRules = deps.runRules;
    if (!gs || !runRules) return;

    const meta = _getMeta(gs);
    if (!meta) return;
    runRules.ensureMeta(meta);
    const cfg = _ensureRunConfig(meta);

    cfg.curse = runRules.nextCurseId(cfg.curse || 'none');
    this.refresh(deps);
    if (typeof deps.saveMeta === 'function') deps.saveMeta();
  },

  refreshInscriptions(deps = {}) {
    const gs = deps.gs;
    const data = deps.data || globalThis.DATA;
    const meta = _getMeta(gs);
    if (!meta || !data?.inscriptions) return;

    const doc = _getDoc(deps);
    const row = doc.getElementById('inscriptionRow');
    const container = doc.getElementById('inscriptionToggles');
    if (!row || !container) return;

    const runConfig = _ensureRunConfig(meta);
    if (!runConfig) return;

    const insc = meta.inscriptions || {};
    const earnedInsc = Object.entries(insc).filter(([, v]) => Number(v) > 0);

    if (earnedInsc.length === 0) {
      row.style.display = 'none';
      return;
    }

    row.style.display = 'flex';
    row.style.flexDirection = 'column';
    row.style.alignItems = 'flex-start';
    container.textContent = '';

    const frag = doc.createDocumentFragment();

    const disableAll = doc.createElement('button');
    const allDisabled = earnedInsc.every(([k]) => runConfig.disabledInscriptions.includes(k));
    disableAll.className = `run-mode-pill ${allDisabled ? 'active' : ''}`;
    disableAll.textContent = 'Start without inscriptions';
    disableAll.style.marginBottom = '12px';
    disableAll.onclick = () => {
      if (allDisabled) runConfig.disabledInscriptions = [];
      else runConfig.disabledInscriptions = earnedInsc.map(([k]) => k);
      this.refreshInscriptions(deps);
      if (typeof deps.saveMeta === 'function') deps.saveMeta();
    };
    frag.appendChild(disableAll);

    const togglesRow = doc.createElement('div');
    togglesRow.className = 'inscription-toggles-container';
    togglesRow.style.display = 'flex';
    togglesRow.style.flexWrap = 'wrap';

    earnedInsc.forEach(([key, val]) => {
      const def = data.inscriptions[key];
      if (!def) return;
      const level = Number(val);
      const disabled = runConfig.disabledInscriptions.includes(key);

      const pill = doc.createElement('div');
      pill.className = `inscription-pill ${disabled ? '' : 'active'}`;
      const label = doc.createElement('span');
      label.textContent = `${def.icon || ''} ${def.name}`.trim();
      const levelSpan = doc.createElement('span');
      levelSpan.style.cssText = 'opacity:0.7;font-size:0.8em;margin-left:4px;';
      levelSpan.textContent = `Lv.${level}`;
      pill.textContent = '';
      pill.append(label, levelSpan);
      pill.title = def.levels?.[Math.min(level, def.maxLevel) - 1]?.desc || def.desc || '';
      pill.onclick = () => this.toggleInscription(key, deps);
      togglesRow.appendChild(pill);
    });

    frag.appendChild(togglesRow);

    const synergies = _getActiveSynergies(meta, runConfig, data);
    if (synergies.length > 0) {
      const synRow = doc.createElement('div');
      synRow.style.marginTop = '12px';
      synRow.style.display = 'flex';
      synRow.style.gap = '8px';
      synRow.style.flexWrap = 'wrap';

      const synTitle = doc.createElement('div');
      synTitle.style.cssText = 'width:100%;font-size:10px;color:var(--text-dim);margin-bottom:4px;';
      synTitle.textContent = 'Active Synergies';
      synRow.appendChild(synTitle);

      synergies.forEach(({ syn }) => {
        const badge = doc.createElement('div');
        badge.style.cssText = 'background:rgba(0,255,204,0.1);border:1px solid var(--cyan);border-radius:12px;padding:4px 10px;font-size:10px;color:var(--cyan);';
        badge.textContent = `+ ${syn.name}`;
        badge.title = syn.desc || '';
        synRow.appendChild(badge);
      });
      frag.appendChild(synRow);
    }

    container.appendChild(frag);
  },

  toggleInscription(key, deps = {}) {
    const gs = deps.gs;
    const meta = _getMeta(gs);
    if (!meta) return;

    const runConfig = _ensureRunConfig(meta);
    if (!runConfig) return;

    const arr = runConfig.disabledInscriptions;
    const idx = arr.indexOf(key);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(key);

    this.refreshInscriptions(deps);
    if (typeof deps.saveMeta === 'function') deps.saveMeta();
  },

  openSettings(deps = {}) {
    const doc = _getDoc(deps);
    const modal = doc.getElementById('runSettingsModal');
    if (modal) {
      modal.style.display = 'flex';
      this.refresh(deps);
      this.refreshInscriptions(deps);
    }
  },

  closeSettings(deps = {}) {
    const doc = _getDoc(deps);
    const modal = doc.getElementById('runSettingsModal');
    if (modal) modal.style.display = 'none';
  },
};