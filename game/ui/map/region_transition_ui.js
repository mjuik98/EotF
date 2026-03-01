function _getDoc(deps) {
  return deps?.doc || document;
}

function _getGS(deps) {
  return deps?.gs;
}

export const RegionTransitionUI = {
  advanceToNextRegion(deps = {}) {
    const gs = _getGS(deps);
    if (!gs) return;

    gs.currentRegion++;
    gs.currentFloor = 0;
    deps.mazeSystem?.close?.();

    const getRegionData = deps.getRegionData || globalThis.getRegionData;
    const region = getRegionData?.(gs.currentRegion, gs);
    if (!region) return;

    const getBaseRegionIndex = deps.getBaseRegionIndex || globalThis.getBaseRegionIndex;
    const baseRegion = getBaseRegionIndex ? getBaseRegionIndex(gs.currentRegion) : gs.currentRegion;
    deps.audioEngine?.startAmbient?.(baseRegion);

    const doc = _getDoc(deps);
    const overlay = doc.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(3,3,10,0.95);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;z-index:2000;animation:fadeIn 0.8s ease both;';
    const subHead = doc.createElement('div');
    subHead.style.cssText = "font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.5em;color:var(--text-dim);animation:fadeInUp 0.8s ease both;";
    subHead.textContent = 'NEW REGION';

    const title = doc.createElement('div');
    title.style.cssText = `font-family:'Cinzel Decorative',serif;font-size:clamp(24px,4vw,48px);font-weight:900;color:${region.accent || 'var(--echo)'};text-shadow:0 0 30px ${region.accent || 'var(--echo-glow)'};animation:titleReveal 1s ease 0.3s both;opacity:0;`;
    title.textContent = region.name;

    const rule = doc.createElement('div');
    rule.style.cssText = "font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--echo);animation:fadeInUp 1s ease 0.8s both;opacity:0;";
    rule.textContent = region.rule;

    const desc = doc.createElement('div');
    desc.style.cssText = "font-size:13px;font-style:italic;color:var(--text-dim);max-width:400px;text-align:center;line-height:1.7;animation:fadeInUp 1s ease 1.1s both;opacity:0;";
    if (globalThis.DescriptionUtils) {
      desc.innerHTML = globalThis.DescriptionUtils.highlight(region.ruleDesc) || '';
    } else {
      desc.innerHTML = region.ruleDesc || '';
    }

    overlay.append(subHead, title, rule, desc);

    if (region.quote) {
      const quote = doc.createElement('div');
      quote.style.cssText = "font-family:'Crimson Pro',serif;font-size:15px;font-style:italic;color:rgba(238,240,255,0.45);max-width:380px;text-align:center;line-height:1.8;animation:fadeInUp 1s ease 1.5s both;opacity:0;border-top:1px solid rgba(255,255,255,0.05);padding-top:16px;margin-top:4px;";
      quote.textContent = region.quote;
      overlay.appendChild(quote);
    }
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

    deps.particleSystem?.burstEffect?.(globalThis.innerWidth / 2, globalThis.innerHeight / 2);
    deps.screenShake?.shake?.(8, 0.5);
    deps.audioEngine?.playBossPhase?.();
  },
};
