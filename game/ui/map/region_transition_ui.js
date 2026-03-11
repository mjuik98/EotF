function _getDoc(deps) {
  return deps?.doc || document;
}

function _getGS(deps) {
  return deps?.gs;
}

function _getWin(deps, doc) {
  return deps?.win || doc?.defaultView || null;
}

function _getDescriptionUtils(deps) {
  return deps?.descriptionUtils || deps?.DescriptionUtils || null;
}

export const RegionTransitionUI = {
  advanceToNextRegion(deps = {}) {
    const gs = _getGS(deps);
    if (!gs) {
      console.error('[RegionTransitionUI] Missing gs');
      return;
    }

    const now = Date.now();
    if (gs.stats && typeof gs.stats === 'object') {
      if (!gs.stats.regionClearTimes || typeof gs.stats.regionClearTimes !== 'object' || Array.isArray(gs.stats.regionClearTimes)) {
        gs.stats.regionClearTimes = {};
      }
      const regionIndex = Math.max(0, Math.floor(Number(gs.currentRegion) || 0));
      const regionStartTs = Number(gs.stats._regionStartTs);
      if (Number.isFinite(regionStartTs) && regionStartTs > 0) {
        gs.stats.regionClearTimes[regionIndex] = Math.max(0, now - regionStartTs);
      }
      gs.stats._regionStartTs = now;
    }

    const rawTargetRegionId = deps.targetRegionId;
    let targetRegionId = null;
    if (rawTargetRegionId !== null && rawTargetRegionId !== undefined && rawTargetRegionId !== '') {
      const parsedTargetRegionId = Number(rawTargetRegionId);
      if (Number.isFinite(parsedTargetRegionId)) {
        targetRegionId = Math.max(0, Math.floor(parsedTargetRegionId));
      }
    }

    gs.currentRegion++;
    if (!gs.regionRoute || typeof gs.regionRoute !== 'object' || Array.isArray(gs.regionRoute)) {
      gs.regionRoute = {};
    }
    if (targetRegionId !== null) {
      gs.regionRoute[String(gs.currentRegion)] = targetRegionId;
    } else {
      delete gs.regionRoute[String(gs.currentRegion)];
    }
    gs.currentFloor = 0;
    deps.mazeSystem?.close?.();

    const getRegionData = deps.getRegionData;
    const region = getRegionData?.(gs.currentRegion, gs);
    if (!region) {
      console.error('[RegionTransitionUI] No region data for region', gs.currentRegion);
      return;
    }

    const getBaseRegionIndex = deps.getBaseRegionIndex;
    const baseRegion = getBaseRegionIndex ? getBaseRegionIndex(gs.currentRegion) : gs.currentRegion;
    deps.audioEngine?.startAmbient?.(baseRegion);

    const doc = _getDoc(deps);
    const win = _getWin(deps, doc);
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
    desc.innerHTML = _getDescriptionUtils(deps)?.highlight?.(region.ruleDesc) || region.ruleDesc || '';

    overlay.append(subHead, title, rule, desc);

    if (region.quote) {
      const quote = doc.createElement('div');
      quote.style.cssText = "font-family:'Crimson Pro',serif;font-size:15px;font-style:italic;color:rgba(238,240,255,0.45);max-width:380px;text-align:center;line-height:1.8;animation:fadeInUp 1s ease 1.5s both;opacity:0;border-top:1px solid rgba(255,255,255,0.05);padding-top:16px;margin-top:4px;";
      quote.textContent = region.quote;
      overlay.appendChild(quote);
    }

    const closeBtn = doc.createElement('button');
    closeBtn.type = 'button';
    closeBtn.textContent = '닫기';
    closeBtn.style.cssText = "margin-top:14px;font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.25em;color:var(--echo);background:rgba(123,47,255,0.12);border:1px solid var(--border);border-radius:8px;padding:10px 22px;cursor:pointer;animation:fadeInUp 0.7s ease 1.7s both;opacity:0;";
    overlay.appendChild(closeBtn);

    doc.body.appendChild(overlay);

    let closed = false;
    const closeOverlay = () => {
      if (closed) return;
      closed = true;
      overlay.style.transition = 'opacity 0.8s';
      overlay.style.opacity = '0';
      const setTimeoutFn = deps.setTimeoutFn || win?.setTimeout?.bind?.(win) || setTimeout;
      setTimeoutFn(() => {
        overlay.remove();
        if (gs.stats && typeof gs.stats === 'object') {
          gs.stats._regionStartTs = Date.now();
        }
        if (typeof deps.generateMap === 'function') deps.generateMap(gs.currentRegion);
        if (typeof deps.updateUI === 'function') deps.updateUI();
        if (typeof deps.showRunFragment === 'function') deps.showRunFragment();
      }, 800);
    };
    closeBtn.addEventListener('click', closeOverlay);

    deps.particleSystem?.burstEffect?.((win?.innerWidth || 0) / 2, (win?.innerHeight || 0) / 2);
    deps.screenShake?.shake?.(8, 0.5);
    deps.audioEngine?.playBossPhase?.();
  },
};
