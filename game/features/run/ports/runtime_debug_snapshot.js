import {
  resolveNodePosition,
  resolveNodeTotal,
  toFiniteNumber,
} from '../../../shared/runtime/runtime_debug_snapshot_utils.js';

function collectRunStartOverlaySummary(doc) {
  const activeOverlayIds = [
    'runStartHandoffBlackoutOverlay',
    'runEntryTransitionOverlay',
    'runStageFadeTransitionOverlay',
  ].filter((id) => !!doc?.getElementById?.(id));

  return {
    active: activeOverlayIds.length > 0,
    activeOverlayIds,
  };
}

function collectMapSummary(gs) {
  const currentFloor = toFiniteNumber(gs?.currentFloor, 0);
  const mapNodes = Array.isArray(gs?.mapNodes) ? gs.mapNodes : [];
  const nextNodes = mapNodes
    .filter((node) => Number(node?.floor) === currentFloor + 1 && node?.accessible)
    .map((node, index) => ({
      id: node?.id || node?.nodeId || `${node?.floor ?? 'f'}-${node?.lane ?? node?.idx ?? 'x'}`,
      type: node?.type || null,
      floor: toFiniteNumber(node?.floor, currentFloor + 1),
      pos: resolveNodePosition(node, index),
      total: resolveNodeTotal(mapNodes, toFiniteNumber(node?.floor, currentFloor + 1)),
      visited: !!node?.visited,
      xRatio: Number(
        (
          (resolveNodePosition(node, index) + 1)
          / (resolveNodeTotal(mapNodes, toFiniteNumber(node?.floor, currentFloor + 1)) + 1)
        ).toFixed(3)
      ),
    }));

  return {
    coordinateSystem: 'map floor increases downward, node position increases rightward',
    currentRegion: toFiniteNumber(gs?.currentRegion, 0),
    currentFloor,
    currentNode: gs?.currentNode?.id || gs?.currentNode?.type || gs?.currentNode || null,
    currentNodeType: gs?.currentNode?.type || null,
    canChoosePath: !!(gs?.currentScreen === 'game' && !gs?.combat?.active && nextNodes.length > 0),
    nextNodes,
    reachableNodeIds: nextNodes.map((node) => node.id),
    accessibleNodeCount: nextNodes.length,
  };
}

export function collectRunRuntimeDebugSnapshot({ modules, doc }) {
  const gs = modules?.featureScopes?.core?.GS || modules?.GS || {};
  return {
    map: collectMapSummary(gs),
    overlays: {
      runStart: collectRunStartOverlaySummary(doc),
    },
  };
}
