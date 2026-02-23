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
        const isLateGame = floor >= Math.ceil(region.floors * 0.5);
        const count = isBossFloor ? 1 : (Math.random() < 0.5 ? 2 : 3);
        let eliteAssigned = false;

        for (let i = 0; i < count; i++) {
          let type;
          if (isBossFloor) {
            type = 'boss';
          } else if (floor === 1) {
            type = 'combat';
          } else if (!eliteAssigned && isLateGame && count > 1 && Math.random() < 0.35) {
            type = 'elite';
            eliteAssigned = true;
          } else {
            const pool = ['combat', 'combat', 'combat', 'event', 'shop', 'rest'];
            type = pool[Math.floor(Math.random() * pool.length)];
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
      deps.renderMapOverlay?.();
      deps.updateUI?.();

      const entryRegion = getRegionData(regionIdx, gs);
      if (entryRegion?.quote && typeof deps.showWorldMemoryNotice === 'function') {
        setTimeout(() => deps.showWorldMemoryNotice(entryRegion.quote), 600);
      }
    },
  };

  globalObj.MapGenerationUI = MapGenerationUI;
})(window);
