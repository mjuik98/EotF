export function resolveRestFillParticleBounds(doc, refs = {}) {
  const target = refs.target
    || doc?.querySelector?.('.game-canvas-wrapper-special')
    || doc?.querySelector?.('#gameCanvas')
    || doc?.querySelector?.('#hudOverlay');
  if (target?.getBoundingClientRect) {
    const rect = target.getBoundingClientRect();
    if (rect.width > 8 && rect.height > 8) {
      return {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };
    }
  }

  const win = doc?.defaultView;
  const viewportW = Math.max(1, Math.floor(win?.innerWidth || doc?.documentElement?.clientWidth || 1));
  const viewportH = Math.max(1, Math.floor(win?.innerHeight || doc?.documentElement?.clientHeight || 1));
  return {
    left: 0,
    top: 0,
    width: viewportW,
    height: viewportH,
  };
}
