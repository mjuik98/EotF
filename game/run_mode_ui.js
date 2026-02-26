function _getDoc(deps) {
  return deps?.doc || document;
}

export const RunModeUI = {
  refresh(deps = {}) {
    const gs = deps.gs || window.GS;
    const runRules = deps.runRules || window.RunRules;
    if (!gs || !runRules) return;

    const doc = _getDoc(deps);
    const panel = doc.getElementById('runModePanel');
    if (!panel) return;

    runRules.ensureMeta(gs.meta);
    const meta = gs.meta;
    if (!meta.runConfig) meta.runConfig = { ascension: 0, endless: false, blessing: 'none', curse: 'none' };
    const cfg = meta.runConfig;
    const maxAsc = Math.max(0, meta.maxAscension || 0);
    const ascUnlocked = !!meta.unlocks?.ascension;
    const endlessUnlocked = !!meta.unlocks?.endless;

    const ascValueEl = doc.getElementById('ascensionValue');
    const ascCapEl = doc.getElementById('ascensionCap');
    if (ascValueEl) ascValueEl.textContent = `A${cfg.ascension}`;
    if (ascCapEl) ascCapEl.textContent = `최고 A${maxAsc}`;

    panel.querySelectorAll('[onclick^="shiftAscension"]').forEach(btn => {
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
      if (cfg.ascension > 0) chunks.push(`승천 A${cfg.ascension}: 적 능력치 상승`);
      else chunks.push('승천 A0: 기본 난이도');
      
      if (cfg.endless) chunks.push('엔들리스: 최종 지역 이후 루프 진행');
      
      if (blessing.id !== 'none') chunks.push(`축복: ${blessing.desc}`);
      if (curse.id !== 'none') chunks.push(`저주: ${curse.desc}`);
      
      if (!ascUnlocked) chunks.push('승천은 2회차부터 해금');
      if (!endlessUnlocked) chunks.push('엔들리스는 승리 누적으로 해금');
      
      descEl.textContent = chunks.join('  ·  ');
      descEl.style.display = chunks.length > 0 ? 'block' : 'none';
    }
  },

  shiftAscension(delta, deps = {}) {
    const gs = deps.gs;
    const runRules = deps.runRules;
    if (!gs || !runRules) return;

    runRules.ensureMeta(gs.meta);
    const meta = gs.meta;
    if (!meta.unlocks?.ascension) {
      this.refresh(deps);
      return;
    }

    const cur = Number.isFinite(meta.runConfig.ascension) ? meta.runConfig.ascension : 0;
    const maxAsc = Math.max(0, meta.maxAscension || 0);
    const step = delta < 0 ? -1 : 1;
    meta.runConfig.ascension = Math.max(0, Math.min(maxAsc, cur + step));

    this.refresh(deps);
    if (typeof deps.saveMeta === 'function') deps.saveMeta();
  },

  toggleEndlessMode(deps = {}) {
    const gs = deps.gs;
    const runRules = deps.runRules;
    if (!gs || !runRules) return;

    runRules.ensureMeta(gs.meta);
    const meta = gs.meta;
    if (!meta.unlocks?.endless) {
      if (typeof deps.notice === 'function') {
        deps.notice('엔들리스는 아직 해금되지 않았습니다.');
      }
      this.refresh(deps);
      return;
    }

    meta.runConfig.endless = !meta.runConfig.endless;
    this.refresh(deps);
    if (typeof deps.saveMeta === 'function') deps.saveMeta();
  },

  cycleBlessing(deps = {}) {
    const gs = deps.gs;
    const runRules = deps.runRules;
    if (!gs || !runRules) return;

    runRules.ensureMeta(gs.meta);
    const meta = gs.meta;
    meta.runConfig.blessing = runRules.nextBlessingId(meta.runConfig.blessing || 'none');
    this.refresh(deps);
    if (typeof deps.saveMeta === 'function') deps.saveMeta();
  },

  cycleCurse(deps = {}) {
    const gs = deps.gs;
    const runRules = deps.runRules;
    if (!gs || !runRules) return;

    runRules.ensureMeta(gs.meta);
    const meta = gs.meta;
    meta.runConfig.curse = runRules.nextCurseId(meta.runConfig.curse || 'none');
    this.refresh(deps);
    if (typeof deps.saveMeta === 'function') deps.saveMeta();
  },

  refreshInscriptions(deps = {}) {
    const gs = deps.gs;
    if (!gs?.meta) return;
    const doc = _getDoc(deps);
    const row = doc.getElementById('inscriptionRow');
    const container = doc.getElementById('inscriptionToggles');
    if (!row || !container) return;

    const insc = gs.meta.inscriptions || {};
    const hasAny = Object.values(insc).some(v => v !== undefined);
    if (!hasAny) {
      row.style.display = 'none';
      return;
    }

    row.style.display = 'flex';
    const labels = { echo_boost: '⚡Echo+', resilience: '🛡️HP+', fortune: '💰Gold+' };
    container.textContent = '';
    const frag = doc.createDocumentFragment();
    Object.entries(insc).forEach(([key, val]) => {
      const pill = doc.createElement('div');
      pill.className = `inscription-pill ${val ? 'active' : ''}`;
      pill.textContent = labels[key] || key;
      pill.onclick = () => this.toggleInscription(key, deps);
      frag.appendChild(pill);
    });
    container.appendChild(frag);
  },

  toggleInscription(key, deps = {}) {
    const gs = deps.gs;
    if (!gs?.meta?.inscriptions) return;
    gs.meta.inscriptions[key] = !gs.meta.inscriptions[key];
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
  }
};

