function _getDoc(deps) {
  return deps?.doc || document;
}
const OVERLAY_DISMISS_MS = 320;

function _nextFrame(cb) {
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(cb);
    return;
  }
  setTimeout(cb, 16);
}

function _dismissOverlayWithBlur(overlay) {
  if (!overlay) return;
  if (overlay.dataset.dismissing === '1') return;
  overlay.dataset.dismissing = '1';
  overlay.style.opacity = '1';
  overlay.style.filter = 'blur(0)';
  overlay.style.transform = 'translateY(0) scale(1)';
  overlay.style.transition = 'opacity 0.32s ease, filter 0.32s ease, transform 0.32s ease';
  overlay.style.pointerEvents = 'none';
  _nextFrame(() => {
    overlay.style.opacity = '0';
    overlay.style.filter = 'blur(12px)';
    overlay.style.transform = 'translateY(10px) scale(0.985)';
  });
  setTimeout(() => {
    overlay.removeAttribute('data-dismissing');
    overlay.style.display = 'none';
    overlay.style.pointerEvents = 'none';
    overlay.style.opacity = '';
    overlay.style.filter = '';
    overlay.style.transform = '';
    overlay.style.transition = '';
  }, OVERLAY_DISMISS_MS);
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
        label: route.label || `지역 ${regionId}`,
        difficulty: route.difficulty || '미확인',
        rewardMod: Number.isFinite(Number(route.rewardMod)) ? Number(route.rewardMod) : 1,
      };
    })
    .filter(Boolean)
    .slice(0, 2);
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
    title.textContent = '다음 경로를 선택하세요';

    const subtitle = doc.createElement('div');
    subtitle.style.cssText = "font-size:12px;color:rgba(230,230,245,0.7);text-align:center;margin-bottom:18px;";
    subtitle.textContent = '잔향이 갈라집니다. 다음 지역으로 진입하기 전 경로를 정하세요.';

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
      info.innerHTML = `난이도: <b>${option.difficulty}</b><br>보상 배율: <b>${rewardText}</b>`;

      if (idx === 0) {
        const recommended = doc.createElement('div');
        recommended.style.cssText = 'display:inline-block;margin-top:10px;padding:4px 8px;border-radius:999px;font-size:10px;letter-spacing:0.08em;color:#0d2a1e;background:#38d39f;';
        recommended.textContent = '추천';
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
    skipHint.textContent = 'ESC를 누르면 추천 경로를 즉시 선택합니다.';

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

  // cycle > 0(무한 루프 중)에도 분기가 정의되어 있다면 선택할 수 있도록 제한 제거
  // if (cycle > 0) return null;

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
    if (nodeOverlay && fromReward) {
      _dismissOverlayWithBlur(nodeOverlay);
    } else if (nodeOverlay) {
      nodeOverlay.style.display = 'none';
      nodeOverlay.style.pointerEvents = 'none';
    }
    const rewardScreen = doc.getElementById('rewardScreen');
    let rewardExitDelay = 0;
    let clearRewardExitStyles = () => {};
    if (fromReward && rewardScreen?.classList.contains('active')) {
      rewardExitDelay = OVERLAY_DISMISS_MS;
      doc.getElementById('gameScreen')?.classList.add('active');
      rewardScreen.style.opacity = '1';
      rewardScreen.style.filter = 'blur(0)';
      rewardScreen.style.transform = 'translateY(0) scale(1)';
      rewardScreen.style.transition = 'opacity 0.32s ease, filter 0.32s ease, transform 0.32s ease';
      rewardScreen.style.pointerEvents = 'none';
      _nextFrame(() => {
        rewardScreen.style.opacity = '0';
        rewardScreen.style.filter = 'blur(12px)';
        rewardScreen.style.transform = 'translateY(10px) scale(0.985)';
      });
      clearRewardExitStyles = () => {
        rewardScreen.style.pointerEvents = '';
        rewardScreen.style.opacity = '';
        rewardScreen.style.filter = '';
        rewardScreen.style.transform = '';
        rewardScreen.style.transition = '';
      };
    } else {
      rewardScreen?.classList.remove('active');
    }
    if (fromReward && wasBoss) {
      if (wasLastRegion && !endlessRun) {
        setTimeout(() => {
          rewardScreen?.classList.remove('active');
          clearRewardExitStyles();
          deps.finalizeRunOutcome?.('victory', {
            echoFragments: 5,
            bossCleared: true,
          });
          if (deps.storySystem?.checkHiddenEnding?.()) deps.storySystem.showHiddenEnding();
          else deps.storySystem?.showNormalEnding?.();
        }, rewardExitDelay);
        return;
      }
      setTimeout(() => {
        deps.switchScreen?.('game');
        clearRewardExitStyles();
        _afterScreenTransition(deps, 100, () => {
          void (async () => {
            const targetRegionId = await _resolveBranchTargetRegion(gs, deps);
            deps.advanceToNextRegion?.({ ...deps, targetRegionId });
          })();
        });
      }, rewardExitDelay);
      return;
    }
    setTimeout(() => {
      deps.switchScreen?.('game');
      clearRewardExitStyles();
      _afterScreenTransition(deps, 50, () => {
        if (typeof deps.renderMinimap === 'function') {
          setTimeout(() => deps.renderMinimap(), 50);
        }
      });
    }, rewardExitDelay);
  },
};


