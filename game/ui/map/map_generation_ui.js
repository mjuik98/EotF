import { MAP_RANDOM_NODE_TYPE_POOL } from '../../../data/map_node_data.js';

function _groupByFloor(nodes = []) {
  const byFloor = new Map();
  nodes.forEach((node) => {
    const list = byFloor.get(node.floor);
    if (list) list.push(node);
    else byFloor.set(node.floor, [node]);
  });
  return byFloor;
}

function _linkMapNodes(nodes = [], totalFloors = 1) {
  const byFloor = _groupByFloor(nodes);

  for (let floor = 1; floor < totalFloors; floor++) {
    const parents = byFloor.get(floor) || [];
    const children = byFloor.get(floor + 1) || [];
    if (!parents.length || !children.length) continue;

    const sortedChildren = [...children].sort((a, b) => (a.pos || 0) - (b.pos || 0));
    const childIndexById = new Map(sortedChildren.map((node, idx) => [node.id, idx]));
    const incoming = new Map(sortedChildren.map((node) => [node.id, 0]));

    parents.forEach((node) => { node.children = []; });

    const addEdge = (parent, child) => {
      if (!parent || !child) return false;
      if (!Array.isArray(parent.children)) parent.children = [];
      if (parent.children.includes(child.id)) return false;
      if (parent.children.length >= 3) return false;
      parent.children.push(child.id);
      incoming.set(child.id, (incoming.get(child.id) || 0) + 1);
      return true;
    };

    // 1) 모든 다음 층 노드가 최소 1개 부모를 갖도록 선연결
    sortedChildren.forEach((child, childIdx) => {
      let bestParent = null;
      let bestScore = Infinity;

      parents.forEach((parent) => {
        const parentChildren = Array.isArray(parent.children) ? parent.children.length : 0;
        if (parentChildren >= 3) return;
        const parentRatio = (parent.pos + 1) / (Math.max(1, parent.total) + 1);
        const parentPivot = parentRatio * (sortedChildren.length - 1);
        const score = Math.abs(parentPivot - childIdx) + parentChildren * 0.2;
        if (score < bestScore) {
          bestScore = score;
          bestParent = parent;
        }
      });

      if (bestParent) addEdge(bestParent, child);
    });

    // 2) 모든 부모 노드가 최소 1개 분기를 갖도록 보정
    parents.forEach((parent) => {
      if ((parent.children?.length || 0) > 0 || sortedChildren.length === 0) return;
      const parentRatio = (parent.pos + 1) / (Math.max(1, parent.total) + 1);
      const parentPivot = parentRatio * (sortedChildren.length - 1);
      const nearest = sortedChildren
        .map((child, idx) => ({ child, score: Math.abs(idx - parentPivot) }))
        .sort((a, b) => a.score - b.score)[0]?.child;
      if (nearest) addEdge(parent, nearest);
    });

    // 3) 부모별 목표 분기(1~3)까지 랜덤 보강
    parents.forEach((parent) => {
      const maxBranches = Math.min(3, sortedChildren.length);
      if (maxBranches <= 0) return;
      const desiredBranches = 1 + Math.floor(Math.random() * maxBranches);
      const parentRatio = (parent.pos + 1) / (Math.max(1, parent.total) + 1);
      const parentPivot = parentRatio * (sortedChildren.length - 1);

      const candidates = sortedChildren
        .map((child) => {
          const idx = childIndexById.get(child.id) || 0;
          return { child, score: Math.abs(idx - parentPivot) + Math.random() * 0.35 };
        })
        .sort((a, b) => a.score - b.score)
        .map((entry) => entry.child);

      for (let i = 0; i < candidates.length && (parent.children?.length || 0) < desiredBranches; i++) {
        addEdge(parent, candidates[i]);
      }
    });
  }
}

export const MapGenerationUI = {
  generateMap(regionIdx, deps = {}) {
    const gs = deps.gs;
    const getRegionData = deps.getRegionData;
    const getBaseRegionIndex = deps.getBaseRegionIndex;
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
          children: [],
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
          children: [],
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
          children: [],
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
          children: [],
        });
        continue;
      }

      const prevFloorCount = gs.mapNodes.filter((node) => node.floor === floor - 1).length || 1;
      const maxNodeCount = floor === 1
        ? 5
        : Math.max(1, Math.min(5, prevFloorCount * 3));
      const count = Math.floor(Math.random() * maxNodeCount) + 1;
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
          const filteredPool = MAP_RANDOM_NODE_TYPE_POOL.filter((t) => {
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
          children: [],
        });
      }
    }

    _linkMapNodes(gs.mapNodes, totalFloors);

    gs.currentFloor = 0;
    deps.updateNextNodes?.();
    deps.updateUI?.();

    const entryRegion = getRegionData(regionIdx, gs);
    if (entryRegion?.quote && typeof deps.showWorldMemoryNotice === 'function') {
      setTimeout(() => deps.showWorldMemoryNotice(entryRegion.quote), 600);
    }
  },
};
