function _getDoc(deps) {
  return deps?.doc || document;
}

function _afterScreenTransition(deps, delay, cb) {
  setTimeout(() => {
    deps.updateUI?.();
    deps.updateNextNodes?.();
    cb?.();
  }, delay);
}

function _getBranchRoutes(deps) {
  const routes = deps?.data?.branchRoutes;
  return (routes && typeof routes === 'object') ? routes : {};
}

function _normalizeRouteOptions(rawRoutes = []) {
  if (!Array.isArray(rawRoutes)) return [];
  return rawRoutes
    .map((route) => {
      if (!route || typeof route !== 'object') return null;
      const regionId = Number(route.regionId);
      if (!Number.isFinite(regionId)) return null;
      return {
        regionId: Math.max(0, Math.floor(regionId)),
        label: route.label || `Region ${regionId}`,
        difficulty: route.difficulty || 'Unknown',
        rewardMod: Number.isFinite(Number(route.rewardMod)) ? Number(route.rewardMod) : 1,
      };
    })
    .filter(Boolean);
}

function _showBranchChoiceOverlay(routes, deps = {}) {
  const options = _normalizeRouteOptions(routes);
  if (options.length === 0) return Promise.resolve(null);
  if (options.length === 1) return Promise.resolve(options[0]);

  const doc = _getDoc(deps);
  if (!doc?.body) return Promise.resolve(options[0]);

  return new Promise((resolve) => {
    const overlay = doc.createElement('div');
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:4000',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'background:rgba(3,3,10,0.94)',
      'backdrop-filter:blur(12px)',
    ].join(';');

    const panel = doc.createElement('div');
    panel.style.cssText = [
      'width:min(920px,92vw)',
      'border:1px solid rgba(123,47,255,0.3)',
      'border-radius:14px',
      'background:linear-gradient(180deg, rgba(20,16,40,0.95), rgba(8,8,20,0.98))',
      'padding:24px',
      'box-shadow:0 20px 60px rgba(0,0,0,0.45)',
    ].join(';');

    const title = doc.createElement('div');
    title.style.cssText = "font-family:'Cinzel',serif;font-size:18px;letter-spacing:0.12em;color:var(--echo-bright,#b388ff);text-align:center;margin-bottom:8px;";
    title.textContent = 'Choose The Next Route';

    const subtitle = doc.createElement('div');
    subtitle.style.cssText = "font-size:12px;color:rgba(230,230,245,0.7);text-align:center;margin-bottom:18px;";
    subtitle.textContent = 'The echo diverges. Select a path before entering the next region.';

    const grid = doc.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;';

    const cleanupAndResolve = (option) => {
      overlay.remove();
      resolve(option || options[0]);
    };

    options.forEach((option, idx) => {
      const card = doc.createElement('button');
      card.type = 'button';
      card.style.cssText = [
        'text-align:left',
        'border:1px solid rgba(255,255,255,0.14)',
        'border-radius:10px',
        'background:rgba(255,255,255,0.04)',
        'padding:14px',
        'cursor:pointer',
        'color:#f6f7ff',
        'transition:transform 0.15s ease,border-color 0.15s ease,background 0.15s ease',
      ].join(';');

      const heading = doc.createElement('div');
      heading.style.cssText = "font-family:'Cinzel',serif;font-size:16px;color:#ffffff;margin-bottom:8px;";
      heading.textContent = option.label;

      const info = doc.createElement('div');
      info.style.cssText = 'font-size:12px;line-height:1.5;color:rgba(235,235,250,0.8);';
      const rewardText = `${Math.round(Math.max(0, option.rewardMod) * 100)}%`;
      info.innerHTML = `Difficulty: <b>${option.difficulty}</b><br>Reward Mod: <b>${rewardText}</b>`;

      if (idx === 0) {
        const recommended = doc.createElement('div');
        recommended.style.cssText = 'display:inline-block;margin-top:10px;padding:4px 8px;border-radius:999px;font-size:10px;letter-spacing:0.08em;color:#0d2a1e;background:#38d39f;';
        recommended.textContent = 'RECOMMENDED';
        card.append(heading, info, recommended);
      } else {
        card.append(heading, info);
      }

      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-2px)';
        card.style.borderColor = 'rgba(123,47,255,0.65)';
        card.style.background = 'rgba(123,47,255,0.12)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.borderColor = 'rgba(255,255,255,0.14)';
        card.style.background = 'rgba(255,255,255,0.04)';
      });
      card.addEventListener('click', () => cleanupAndResolve(option));
      grid.appendChild(card);
    });

    const skipHint = doc.createElement('div');
    skipHint.style.cssText = 'margin-top:12px;text-align:center;font-size:11px;color:rgba(220,220,235,0.5);';
    skipHint.textContent = 'Press ESC to pick the recommended route.';

    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      doc.removeEventListener('keydown', onKeyDown, true);
      cleanupAndResolve(options[0]);
    };
    doc.addEventListener('keydown', onKeyDown, true);

    panel.append(title, subtitle, grid, skipHint);
    overlay.appendChild(panel);
    doc.body.appendChild(overlay);
  });
}

async function _resolveBranchTargetRegion(gs, deps = {}) {
  const getBaseRegionIndex = deps.getBaseRegionIndex || globalThis.getBaseRegionIndex;
  const getRegionCount = deps.getRegionCount || globalThis.getRegionCount;
  const stageCount = typeof getRegionCount === 'function'
    ? Math.max(1, Number(getRegionCount()) || 1)
    : 5;
  const cycle = Math.floor(Math.max(0, Number(gs.currentRegion) || 0) / stageCount);

  if (cycle > 0) return null;

  const baseRegion = typeof getBaseRegionIndex === 'function'
    ? getBaseRegionIndex(gs.currentRegion)
    : (Math.max(0, Math.floor(Number(gs.currentRegion) || 0)) % stageCount);

  const routesTable = _getBranchRoutes(deps);
  const routeKey = `after_region_${baseRegion}`;
  const routeOptions = _normalizeRouteOptions(routesTable[routeKey]);
  if (routeOptions.length === 0) return null;

  const picked = await _showBranchChoiceOverlay(routeOptions, deps);
  return Number.isFinite(Number(picked?.regionId))
    ? Math.max(0, Math.floor(Number(picked.regionId)))
    : null;
}

export const RunReturnUI = {
  returnToGame(fromReward, deps = {}) {
    const gs = deps.gs;
    const runRules = deps.runRules;
    if (!gs || !runRules) {
      console.error('[RunReturnUI] Missing gs or runRules');
      return;
    }

    const wasBoss = gs._bossRewardPending;
    const wasLastRegion = gs._bossLastRegion;
    const endlessRun = runRules.isEndless(gs);

    gs._bossRewardPending = false;
    gs._bossLastRegion = false;
    gs._rewardLock = false;
    gs._nodeMoveLock = false;
    gs._eventLock = false;
    gs._endCombatScheduled = false;
    gs._endCombatRunning = false;

    const doc = _getDoc(deps);
    doc.getElementById('combatOverlay')?.classList.remove('active');
    const combatHand = doc.getElementById('combatHandCards');
    if (combatHand) combatHand.textContent = '';
    const enemyZone = doc.getElementById('enemyZone');
    if (enemyZone) enemyZone.textContent = '';
    const nodeOverlay = doc.getElementById('nodeCardOverlay');
    if (nodeOverlay) {
      nodeOverlay.style.display = 'none';
      nodeOverlay.style.pointerEvents = 'none';
    }

    doc.getElementById('rewardScreen')?.classList.remove('active');

    if (fromReward && wasBoss) {
      if (wasLastRegion && !endlessRun) {
        deps.finalizeRunOutcome?.('victory', { echoFragments: 5 });
        if (deps.storySystem?.checkHiddenEnding?.()) deps.storySystem.showHiddenEnding();
        else deps.storySystem?.showNormalEnding?.();
        return;
      }

      deps.switchScreen?.('game');
      _afterScreenTransition(deps, 100, () => {
        void (async () => {
          const targetRegionId = endlessRun ? null : await _resolveBranchTargetRegion(gs, deps);
          deps.advanceToNextRegion?.({ ...deps, targetRegionId });
        })();
      });
      return;
    }

    deps.switchScreen?.('game');
    _afterScreenTransition(deps, 50, () => {
      if (typeof deps.renderMinimap === 'function') {
        setTimeout(() => deps.renderMinimap(), 50);
      }
    });
  },
};
