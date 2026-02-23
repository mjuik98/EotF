'use strict';

(function initGameBootUI(globalObj) {
  const BOOT_BANNER = `
╔══════════════════════════════════════════╗
║  ECHO OF THE FALLEN v11 — SET SYSTEM    ║
║                                          ║
║  ✓ 유물 세트 효과 시스템 (3세트 9유물)  ║
║  ✓ 기억의 미궁 — WASD UI 가이드        ║
║  ✓ 미궁 미니맵 + 출구 표시             ║
║  ✓ 방향키 지원 + 이동 피드백            ║
║  ✓ 세트 보너스 패널 (좌측 패널)         ║
║  ✓ 아이템 툴팁 세트 정보 표시           ║
║  ✓ 세트 아이템 점선 테두리 강조         ║
║  ✓ echo_skill 트리거 (잔향 팔찌 세트)  ║
╚══════════════════════════════════════════╝
  `;

  function _getDoc(deps) {
    return deps?.doc || document;
  }

  const GameBootUI = {
    bootGame(deps = {}) {
      const gs = deps.gs || globalObj.GS;
      const doc = _getDoc(deps);
      const audioEngine = deps.audioEngine || globalObj.AudioEngine;
      const runRules = deps.runRules || globalObj.RunRules;
      const saveSystem = deps.saveSystem || globalObj.SaveSystem;

      try {
        doc.addEventListener('click', () => {
          try {
            audioEngine?.init?.();
            audioEngine?.resume?.();
          } catch (e) {
            // Ignore init failures from blocked gesture contexts.
          }
        }, { once: false });

        try { saveSystem?.loadMeta?.(deps.saveSystemDeps || {}); } catch (e) {}
        try { runRules?.ensureMeta?.(gs?.meta); } catch (e) {}

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

  globalObj.GameBootUI = GameBootUI;
})(window);
