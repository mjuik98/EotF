'use strict';

(function initMapGenerationUI(globalObj) {
  const MapGenerationUI = {
    generateMap(regionIdx, deps = {}) {
      const gs = deps.gs || globalObj.GS;
      const getRegionData = deps.getRegionData || globalObj.getRegionData;
      if (!gs || typeof getRegionData !== 'function') return;

      const region = getRegionData(regionIdx, gs);
      if (!region) return;

      gs.mapNodes = [];
      gs.currentNode = null;

      for (let floor = 1; floor <= region.floors; floor++) {
        const isBossFloor = floor === region.floors;
        const isPreBossFloor = floor === region.floors - 1;
        const isLateGame = floor >= Math.ceil(region.floors * 0.5);
        const count = isBossFloor ? 1 : (Math.random() < 0.5 ? 2 : 3);
        let eliteAssigned = false;
        let shopAssigned = false;
        let eventAssigned = false;

        for (let i = 0; i < count; i++) {
          let type;
          if (isBossFloor) {
            type = 'boss';
          } else if (floor === 1) {
            type = 'combat';
          } else if (isPreBossFloor && i === 0) {
            // 보스 직전 층의 첫 노드는 상점 고정
            type = 'shop';
            shopAssigned = true;
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

  globalObj.MapGenerationUI = MapGenerationUI;
})(window);
