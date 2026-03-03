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
    if (ascCapEl) ascCapEl.textContent = `최고 A${maxAsc}`;

    panel.querySelectorAll('[onclick^="shiftAscension"]').forEach((btn) => {
      btn.disabled = !ascUnlocked || maxAsc <= 0;
    });

    const endlessBtn = doc.getElementById('endlessToggleBtn');
    if (endlessBtn) {
      const endlessOn = !!cfg.endless;
      endlessBtn.disabled = !endlessUnlocked;
      endlessBtn.textContent = endlessOn ? '켜짐' : '꺼짐';
      if (endlessOn) endlessBtn.classList.add('active');
      else endlessBtn.classList.remove('active');
    }

    const blessing = runRules.blessings[cfg.blessing] || runRules.blessings.none;
    const curse = runRules.curses[cfg.curse] || runRules.curses.none;
    const blessingBtn = doc.getElementById('blessingCycleBtn');
    const curseBtn = doc.getElementById('curseCycleBtn');
    if (blessingBtn) {
      blessingBtn.textContent = blessing.name;
      if (blessing.id !== 'none') blessingBtn.classList.add('active');
      else blessingBtn.classList.remove('active');
    }
    if (curseBtn) {
      curseBtn.textContent = curse.name;
      if (curse.id !== 'none') curseBtn.classList.add('active');
      else curseBtn.classList.remove('active');
    }

    const descEl = doc.getElementById('runModeDesc');
    if (descEl) {
      const chunks = [];
      if (cfg.ascension > 0) chunks.push(`승천 A${cfg.ascension}: 적의 능력치가 강화됩니다`);
      else chunks.push('승천 A0: 일반적인 탐험입니다');

      if (cfg.endless) chunks.push('무한 모드: 최종 지역 이후 런이 반복됩니다');
      if (blessing.id !== 'none') chunks.push(`축복: ${blessing.desc}`);
      if (curse.id !== 'none') chunks.push(`저주: ${curse.desc}`);
      if (!ascUnlocked) chunks.push('승천 모드는 챕터 2 클리어 후 해금됩니다');
      if (!endlessUnlocked) chunks.push('무한 모드는 메타 진행도를 통해 해금됩니다');

      descEl.innerText = chunks.join('\n');
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
        deps.notice('무한 모드가 아직 해금되지 않았습니다.');
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
    disableAll.textContent = '각인 없이 시작';
    disableAll.style.marginBottom = '12px'; // keep min-margin for layout
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
      label.className = 'inscription-label';
      label.textContent = `${def.icon || ''} ${def.name}`.trim();

      const levelSpan = doc.createElement('span');
      levelSpan.className = 'inscription-level';
      levelSpan.textContent = `레벨 ${level}`;

      pill.append(label, levelSpan);
      pill.title = def.levels?.[Math.min(level, def.maxLevel) - 1]?.desc || def.desc || '';
      pill.onclick = () => this.toggleInscription(key, deps);
      togglesRow.appendChild(pill);
    });

    frag.appendChild(togglesRow);

    const synergies = _getActiveSynergies(meta, runConfig, data);
    if (synergies.length > 0) {
      const synRow = doc.createElement('div');
      synRow.className = 'active-synergies-row';

      const synTitle = doc.createElement('div');
      synTitle.className = 'synergy-title';
      synTitle.textContent = '활성 시너지';
      synRow.appendChild(synTitle);

      synergies.forEach(({ syn }) => {
        const badge = doc.createElement('div');
        badge.className = 'synergy-badge';
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
      modal.classList.remove('fade-out');
      modal.style.display = 'flex';
      modal.classList.add('fade-in');
      this.refresh(deps);
      this.refreshInscriptions(deps);
    }
  },

  closeSettings(deps = {}) {
    const doc = _getDoc(deps);
    const modal = doc.getElementById('runSettingsModal');
    if (!modal) return;

    modal.classList.remove('fade-in');
    modal.classList.add('fade-out');
    const onEnd = () => {
      modal.style.display = 'none';
      modal.classList.remove('fade-out');
      modal.removeEventListener('animationend', onEnd);
    };
    modal.addEventListener('animationend', onEnd);

    // fallback for safety
    setTimeout(() => {
      if (modal.style.display !== 'none') onEnd();
    }, 250);
  },
};
