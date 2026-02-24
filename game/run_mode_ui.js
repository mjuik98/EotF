'use strict';

(function initRunModeUI(globalObj) {
  function _getDoc(deps) {
    return deps?.doc || document;
  }

  const RunModeUI = {
    refresh(deps = {}) {
      const gs = deps.gs;
      const runRules = deps.runRules;
      if (!gs || !runRules) return;

      const doc = _getDoc(deps);
      const panel = doc.getElementById('runModePanel');
      if (!panel) return;

      runRules.ensureMeta(gs.meta);
      const meta = gs.meta;
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
        chunks.push(`축복 - ${blessing.desc}`);
        if (curse.id !== 'none') chunks.push(`저주 - ${curse.desc}`);
        if (!ascUnlocked) chunks.push('승천은 2회차부터 해금');
        if (!endlessUnlocked) chunks.push('엔들리스는 승리 누적으로 해금');
        descEl.textContent = chunks.join(' · ');
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
      container.innerHTML = Object.entries(insc).map(([key, val]) => `
        <div class="inscription-pill ${val ? 'active' : ''}" onclick="toggleInscription('${key}')">${labels[key] || key}</div>
      `).join('');
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

  // 전역 함수 연결 (HTML onclick 연동용)
  globalObj.openRunSettings = function (deps = {}) {
    RunModeUI.openSettings({ gs: globalObj.GS, runRules: globalObj.RunRules, ...deps });
  };
  globalObj.closeRunSettings = function (deps = {}) {
    RunModeUI.closeSettings(deps);
  };
  globalObj.toggleEndlessMode = function (deps = {}) {
    RunModeUI.toggleEndlessMode({ gs: globalObj.GS, runRules: globalObj.RunRules, ...deps });
  };
  globalObj.cycleRunBlessing = function (deps = {}) {
    RunModeUI.cycleBlessing({ gs: globalObj.GS, runRules: globalObj.RunRules, ...deps });
  };
  globalObj.cycleRunCurse = function (deps = {}) {
    RunModeUI.cycleCurse({ gs: globalObj.GS, runRules: globalObj.RunRules, ...deps });
  };
  globalObj.shiftAscension = function (delta, deps = {}) {
    RunModeUI.shiftAscension(delta, { gs: globalObj.GS, runRules: globalObj.RunRules, ...deps });
  };
  globalObj.toggleInscription = function (key, deps = {}) {
    RunModeUI.toggleInscription(key, { gs: globalObj.GS, ...deps });
  };

  globalObj.RunModeUI = RunModeUI;
})(window);
