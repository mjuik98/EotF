import { AudioEngine } from '../../../engine/audio.js';


const BOOT_BANNER = `
╔══════════════════════════════════════════╗
║  ECHO OF THE FALLEN — SET SYSTEM     ║
║                                          ║
╚══════════════════════════════════════════╝
  `;

function _getDoc(deps) {
  return deps?.doc || document;
}

export const GameBootUI = {
  bootGame(deps = {}) {
    const gs = deps.gs || window.GS;
    const doc = _getDoc(deps);
    const audioEngine = deps.audioEngine || window.AudioEngine;
    const runRules = deps.runRules || window.RunRules;
    const saveSystem = deps.saveSystem || window.SaveSystem;

    try {
      doc.addEventListener('click', () => {
        try {
          audioEngine?.init?.();
          audioEngine?.resume?.();
        } catch (e) {
          // Ignore init failures from blocked gesture contexts.
        }
      }, { once: false });

      try { saveSystem?.loadMeta?.(deps.saveSystemDeps || {}); } catch (e) { console.error('[Boot] loadMeta error:', e); }
      try { runRules?.ensureMeta?.(gs?.meta); } catch (e) { console.error('[Boot] ensureMeta error:', e); }

      deps.initTitleCanvas?.();
      try { deps.updateUI?.(); } catch (e) { console.warn('updateUI error:', e); }
      deps.refreshRunModePanel?.();

      if ((gs?.meta?.runCount || 0) > 1) {
        const badge = doc.createElement('div');
        badge.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);font-family:\'Share Tech Mono\',monospace;font-size:10px;color:rgba(123,47,255,0.5);z-index:5;pointer-events:none;';
        badge.textContent = `총 ${gs.meta.runCount - 1}회 플레이 · 처치 ${gs.meta.totalKills} · 최고 체인 ${gs.meta.bestChain}`;
        doc.getElementById('titleScreen')?.appendChild(badge);
      }
    } catch (e) {
      console.error('Boot error:', e);
    }

    console.log(BOOT_BANNER);
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
