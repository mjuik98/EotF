import { InscriptionSystem } from '../../systems/inscription_system.js';

function _getDoc(deps) {
  return deps?.doc || document;
}

export const RunModeUI = {
  refresh(deps = {}) {
    const gs = deps.gs;
    const runRules = deps.runRules;
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
    const data = deps.data || window.DATA;
    if (!gs?.meta || !data?.inscriptions) return;
    const doc = _getDoc(deps);
    const row = doc.getElementById('inscriptionRow');
    const container = doc.getElementById('inscriptionToggles');
    if (!row || !container) return;

    if (!gs.meta.runConfig) gs.meta.runConfig = { disabledInscriptions: [] };
    if (!gs.meta.runConfig.disabledInscriptions) gs.meta.runConfig.disabledInscriptions = [];

    const insc = gs.meta.inscriptions || {};
    const earnedInsc = Object.entries(insc).filter(([k, v]) => Number(v) > 0);

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
    const allDisabled = earnedInsc.every(([k]) => gs.meta.runConfig.disabledInscriptions.includes(k));
    disableAll.className = `run-mode-pill ${allDisabled ? 'active' : ''}`;
    disableAll.textContent = '각인 없이 시작';
    disableAll.style.marginBottom = '12px';
    disableAll.onclick = () => {
      if (allDisabled) {
        gs.meta.runConfig.disabledInscriptions = [];
      } else {
        gs.meta.runConfig.disabledInscriptions = earnedInsc.map(([k]) => k);
      }
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
      const disabled = gs.meta.runConfig.disabledInscriptions.includes(key);
      const pill = doc.createElement('div');
      pill.className = `inscription-pill ${disabled ? '' : 'active'}`;
      pill.innerHTML = `${def.icon} ${def.name} <span style="opacity:0.7;font-size:0.8em;">Lv.${level}</span>`;
      pill.title = def.levels[Math.min(level, def.maxLevel) - 1]?.desc || def.desc;
      pill.onclick = () => this.toggleInscription(key, deps);
      togglesRow.appendChild(pill);
    });
    frag.appendChild(togglesRow);

    if (InscriptionSystem?.getActiveSynergies) {
      // 임시 적용된 gs를 위해 깊은 복사 혹은 기존 로직 호출
      // 여기서 InscriptionSystem 은 현재 gs의 상태 (토글 반영 등) 를 기준으로 시너지를 체크
      const synergies = InscriptionSystem.getActiveSynergies(gs, data);
      if (synergies.length > 0) {
        const synRow = doc.createElement('div');
        synRow.style.marginTop = '12px';
        synRow.style.display = 'flex';
        synRow.style.gap = '8px';
        synRow.style.flexWrap = 'wrap';

        const synTitle = doc.createElement('div');
        synTitle.style.cssText = 'width:100%; font-size:10px; color:var(--text-dim); margin-bottom:4px;';
        synTitle.textContent = '활성 시너지';
        synRow.appendChild(synTitle);

        synergies.forEach(({ syn }) => {
          const badge = doc.createElement('div');
          badge.style.cssText = 'background:rgba(0,255,204,0.1); border:1px solid var(--cyan); border-radius:12px; padding:4px 10px; font-size:10px; color:var(--cyan);';
          badge.textContent = `✦ ${syn.name}`;
          badge.title = syn.desc;
          synRow.appendChild(badge);
        });
        frag.appendChild(synRow);
      }
    }

    container.appendChild(frag);
  },

  toggleInscription(key, deps = {}) {
    const gs = deps.gs;
    if (!gs?.meta) return;
    if (!gs.meta.runConfig) gs.meta.runConfig = { disabledInscriptions: [] };
    if (!gs.meta.runConfig.disabledInscriptions) gs.meta.runConfig.disabledInscriptions = [];

    const arr = gs.meta.runConfig.disabledInscriptions;
    const idx = arr.indexOf(key);
    if (idx >= 0) {
      arr.splice(idx, 1);
    } else {
      arr.push(key);
    }
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

