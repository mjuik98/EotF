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

    const totalFloors = Math.max(1, Math.floor(Number(region.floors) || 1));
    const midBossFloor = Math.max(2, Math.min(totalFloors - 2, Math.floor(totalFloors / 2)));

    gs.mapNodes = [];
    gs.currentNode = null;

    for (let floor = 1; floor <= totalFloors; floor++) {
      const isBossFloor = floor === totalFloors;
      const isPreBossFloor = floor === totalFloors - 1;
      const isMiniBossFloor = floor === midBossFloor && !isBossFloor && !isPreBossFloor;

      if (isFirstStage && floor === 1) {
        gs.mapNodes.push({
          id: `${floor}-0`,
          floor,
          pos: 0,
          total: 1,
          type: 'combat',
          visited: false,
          accessible: true,
        });
        continue;
      }

      if (isBossFloor) {
        gs.mapNodes.push({
          id: `${floor}-0`,
          floor,
          pos: 0,
          total: 1,
          type: 'boss',
          visited: false,
          accessible: false,
        });
        continue;
      }

      if (isPreBossFloor) {
        gs.mapNodes.push({
          id: `${floor}-0`,
          floor,
          pos: 0,
          total: 1,
          type: 'shop',
          visited: false,
          accessible: false,
        });
        continue;
      }

      if (isMiniBossFloor) {
        gs.mapNodes.push({
          id: `${floor}-0`,
          floor,
          pos: 0,
          total: 1,
          type: 'mini_boss',
          visited: false,
          accessible: false,
        });
        continue;
      }

      const count = isFirstStage
        ? Math.floor(Math.random() * 3) + 1
        : (Math.random() < 0.5 ? 2 : 3);
      const isLateGame = floor >= Math.ceil(totalFloors * 0.5);

      let eliteAssigned = false;
      let shopAssigned = false;
      let eventAssigned = false;

      for (let i = 0; i < count; i++) {
        let type = 'combat';

        if (!eliteAssigned && isLateGame && count > 1 && Math.random() < 0.35) {
          type = 'elite';
          eliteAssigned = true;
        } else {
          const pool = ['combat', 'combat', 'combat', 'event', 'shop', 'rest'];
          const filteredPool = pool.filter((t) => {
            if (t === 'shop' && shopAssigned) return false;
            if (t === 'event' && eventAssigned) return false;
            return true;
          });
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
