export const MapGenerationUI = {
  generateMap(regionIdx, deps = {}) {
    const gs = deps.gs;
    const getRegionData = deps.getRegionData || window.getRegionData;
    const getBaseRegionIndex = deps.getBaseRegionIndex || window.getBaseRegionIndex;
    if (!gs || typeof getRegionData !== 'function') return;

    const region = getRegionData(regionIdx, gs);
    if (!region) return;
    const baseRegionIndex = typeof getBaseRegionIndex === 'function'
      ? getBaseRegionIndex(regionIdx)
      : Math.max(0, Math.floor(Number(regionIdx) || 0));
    const isFirstStage = baseRegionIndex === 0;

    gs.mapNodes = [];
    gs.currentNode = null;

    for (let floor = 1; floor <= region.floors; floor++) {
      const isBossFloor = floor === region.floors;
      const isPreBossFloor = floor === region.floors - 1;
      const preBossSupportType = isPreBossFloor
        ? (Math.random() < 0.5 ? 'shop' : 'rest')
        : null;
      const isLateGame = floor >= Math.ceil(region.floors * 0.5);
      const count = (isBossFloor || isPreBossFloor)
        ? 1
        : (isFirstStage
          ? (floor === 1 ? 1 : (Math.floor(Math.random() * 3) + 1))
          : (Math.random() < 0.5 ? 2 : 3));
      let eliteAssigned = false;
      let shopAssigned = false;
      let eventAssigned = false;

      for (let i = 0; i < count; i++) {
        let type;
        if (isBossFloor) {
          type = 'boss';
        } else if (floor === 1 && !isPreBossFloor) {
          type = 'combat';
        } else if (isPreBossFloor && i === 0) {
          // 보스 직전 층의 첫 노드는 상점/휴식 중 하나를 강제 배치
          type = preBossSupportType;
          if (type === 'shop') shopAssigned = true;
        } else if (!eliteAssigned && isLateGame && count > 1 && Math.random() < 0.35) {
          type = 'elite';
          eliteAssigned = true;
        } else {
          const pool = ['combat', 'combat', 'combat', 'event', 'shop', 'rest'];
          const filteredPool = pool.filter(t => (t !== 'shop' || !shopAssigned) && (t !== 'event' || !eventAssigned));
          type = filteredPool[Math.floor(Math.random() * filteredPool.length)] || 'combat';
          if (type === 'shop') shopAssigned = true;
          if (type === 'event') eventAssigned = true;
        }

        gs.mapNodes.push({
          id: `${floor}-${i}`,
          floor,
          pos: i,
          total: count,
          type,
          visited: false,
          accessible: floor === 1,
        });
      }
    }

    gs.currentFloor = 0;
    deps.updateNextNodes?.();
    deps.updateUI?.();

    const entryRegion = getRegionData(regionIdx, gs);
    if (entryRegion?.quote && typeof deps.showWorldMemoryNotice === 'function') {
      setTimeout(() => deps.showWorldMemoryNotice(entryRegion.quote), 600);
    }
  },
};
