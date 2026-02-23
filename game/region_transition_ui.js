'use strict';

(function initRegionTransitionUI(globalObj) {
  function _getDoc(deps) {
    return deps?.doc || document;
  }

  function _getGS(deps) {
    return deps?.gs || globalObj.GS;
  }

  const RegionTransitionUI = {
    advanceToNextRegion(deps = {}) {
      const gs = _getGS(deps);
      if (!gs) return;

      gs.currentRegion++;
      gs.currentFloor = 0;
      deps.mazeSystem?.close?.();

      const getRegionData = deps.getRegionData || globalObj.getRegionData;
      const region = getRegionData?.(gs.currentRegion, gs);
      if (!region) return;

      const getBaseRegionIndex = deps.getBaseRegionIndex || globalObj.getBaseRegionIndex;
      const baseRegion = getBaseRegionIndex ? getBaseRegionIndex(gs.currentRegion) : gs.currentRegion;
      deps.audioEngine?.startAmbient?.(baseRegion);

      const doc = _getDoc(deps);
      const overlay = doc.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(3,3,10,0.95);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;z-index:2000;animation:fadeIn 0.8s ease both;';
      overlay.innerHTML = `
        <div style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.5em;color:var(--text-dim);animation:fadeInUp 0.8s ease both;">NEW REGION</div>
        <div style="font-family:'Cinzel Decorative',serif;font-size:clamp(24px,4vw,48px);font-weight:900;color:${region.accent || 'var(--echo)'};text-shadow:0 0 30px ${region.accent || 'var(--echo-glow)'};animation:titleReveal 1s ease 0.3s both;opacity:0;">${region.name}</div>
        <div style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--echo);animation:fadeInUp 1s ease 0.8s both;opacity:0;">${region.rule}</div>
        <div style="font-size:13px;font-style:italic;color:var(--text-dim);max-width:400px;text-align:center;line-height:1.7;animation:fadeInUp 1s ease 1.1s both;opacity:0;">${region.ruleDesc || ''}</div>
        ${region.quote ? `<div style="font-family:'Crimson Pro',serif;font-size:15px;font-style:italic;color:rgba(238,240,255,0.45);max-width:380px;text-align:center;line-height:1.8;animation:fadeInUp 1s ease 1.5s both;opacity:0;border-top:1px solid rgba(255,255,255,0.05);padding-top:16px;margin-top:4px;">${region.quote}</div>` : ''}
      `;
      doc.body.appendChild(overlay);

      setTimeout(() => {
        overlay.style.transition = 'opacity 0.8s';
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.remove();
          if (typeof deps.generateMap === 'function') deps.generateMap(gs.currentRegion);
          if (typeof deps.updateUI === 'function') deps.updateUI();
          if (typeof deps.showRunFragment === 'function') deps.showRunFragment();
        }, 800);
      }, 2800);

      deps.particleSystem?.burstEffect?.(globalObj.innerWidth / 2, globalObj.innerHeight / 2);
      deps.screenShake?.shake?.(8, 0.5);
      deps.audioEngine?.playBossPhase?.();
    },
  };

  globalObj.RegionTransitionUI = RegionTransitionUI;
})(window);
