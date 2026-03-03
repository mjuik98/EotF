function _getDoc(deps) {
  return deps?.doc || document;
}

export const GameBootUI = {
  bootGame(deps = {}) {
    const gs = deps.gs;
    const doc = _getDoc(deps);
    const audioEngine = deps.audioEngine;
    const runRules = deps.runRules;
    const saveSystem = deps.saveSystem;

    try {
      doc.addEventListener('click', () => {
        try {
          audioEngine?.init?.();
          audioEngine?.resume?.();
        } catch {
          // Ignore init failures from blocked gesture contexts.
        }
      }, { once: false });

      try { saveSystem?.loadMeta?.(deps.saveSystemDeps || {}); } catch (e) { console.error('[Boot] loadMeta error:', e); }
      try { runRules?.ensureMeta?.(gs?.meta); } catch (e) { console.error('[Boot] ensureMeta error:', e); }

      setTimeout(() => {
        deps.initTitleCanvas?.();
        if (typeof globalThis.resizeTitleCanvas === 'function') {
          globalThis.resizeTitleCanvas();
        }
      }, 100);

      try { deps.updateUI?.(); } catch (e) { console.warn('updateUI error:', e); }
      deps.refreshRunModePanel?.();

      if ((gs?.meta?.runCount || 0) > 1) {
        doc.querySelector('.title-run-stats')?.remove();
        const badge = doc.createElement('div');
        badge.className = 'title-run-stats';

        const runCount = gs.meta.runCount - 1;
        const totalKills = gs.meta.totalKills || 0;
        const bestChain = gs.meta.bestChain || 0;

        badge.innerHTML = `
          <div class="stat-item">
            <span class="stat-label">TOTAL RUNS</span>
            <span class="stat-value">${runCount}</span>
          </div>
          <div class="stat-sep"></div>
          <div class="stat-item">
            <span class="stat-label">KILLS</span>
            <span class="stat-value">${totalKills}</span>
          </div>
          <div class="stat-sep"></div>
          <div class="stat-item">
            <span class="stat-label">BEST CHAIN</span>
            <span class="stat-value">${bestChain}</span>
          </div>
        `;
        doc.getElementById('mainTitleSubScreen')?.appendChild(badge);
      }
    } catch (e) {
      console.error('Boot error:', e);
    }
  },

  bootWhenReady(deps = {}) {
    const doc = _getDoc(deps);
    if (doc.readyState === 'loading') {
      doc.addEventListener('DOMContentLoaded', () => this.bootGame(deps));
    } else {
      this.bootGame(deps);
    }
  },
};
