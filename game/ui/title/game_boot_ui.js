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
        const badge = doc.createElement('div');
        badge.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);font-family:\'Share Tech Mono\',monospace;font-size:10px;color:rgba(123,47,255,0.5);z-index:5;pointer-events:none;';
        badge.textContent = `珥?${gs.meta.runCount - 1}???뚮젅??쨌 泥섏튂 ${gs.meta.totalKills} 쨌 理쒓퀬 泥댁씤 ${gs.meta.bestChain}`;
        doc.getElementById('titleScreen')?.appendChild(badge);
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
