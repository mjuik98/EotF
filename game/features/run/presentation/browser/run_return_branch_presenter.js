function getRunReturnDoc(deps) {
  return deps?.doc || deps?.win?.document || null;
}

export function getBranchRoutes(deps) {
  const routes = deps?.data?.branchRoutes;
  return (routes && typeof routes === 'object') ? routes : {};
}

export function normalizeRouteOptions(rawRoutes = []) {
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

export function showBranchChoiceOverlay(routes, deps = {}) {
  const options = normalizeRouteOptions(routes);
  if (options.length === 0) return Promise.resolve(null);
  if (options.length === 1) return Promise.resolve(options[0]);

  const doc = getRunReturnDoc(deps);
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
      doc.removeEventListener?.('keydown', onKeyDown, true);
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

      const applyHoverState = () => {
        card.style.transform = 'translateY(-2px)';
        card.style.borderColor = 'rgba(123,47,255,0.65)';
        card.style.background = 'rgba(123,47,255,0.12)';
      };
      const clearHoverState = () => {
        card.style.transform = '';
        card.style.borderColor = 'rgba(255,255,255,0.14)';
        card.style.background = 'rgba(255,255,255,0.04)';
      };
      card.addEventListener('mouseenter', applyHoverState);
      card.addEventListener('mouseleave', clearHoverState);
      card.addEventListener('focus', applyHoverState);
      card.addEventListener('blur', clearHoverState);
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
      cleanupAndResolve(options[0]);
    };
    doc.addEventListener?.('keydown', onKeyDown, true);

    panel.append(title, subtitle, grid, skipHint);
    overlay.appendChild(panel);
    doc.body.appendChild(overlay);
  });
}

export async function resolveBranchTargetRegion(gs, deps = {}) {
  const getBaseRegionIndex = deps.getBaseRegionIndex || null;
  const getRegionCount = deps.getRegionCount || null;
  const stageCount = typeof getRegionCount === 'function'
    ? Math.max(1, Number(getRegionCount()) || 1)
    : 5;

  const baseRegion = typeof getBaseRegionIndex === 'function'
    ? getBaseRegionIndex(gs.currentRegion)
    : (Math.max(0, Math.floor(Number(gs.currentRegion) || 0)) % stageCount);

  const routesTable = getBranchRoutes(deps);
  const routeKey = `after_region_${baseRegion}`;
  const routeOptions = normalizeRouteOptions(routesTable[routeKey]);
  if (routeOptions.length === 0) return null;

  const picked = await showBranchChoiceOverlay(routeOptions, deps);
  return Number.isFinite(Number(picked?.regionId))
    ? Math.max(0, Math.floor(Number(picked.regionId)))
    : null;
}
