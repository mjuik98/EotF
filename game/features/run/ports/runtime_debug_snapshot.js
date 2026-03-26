import {
  isVisibleElement,
  resolveNodePosition,
  resolveNodeTotal,
  toFiniteNumber,
} from '../../ui/ports/public_runtime_debug_support_capabilities.js';

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

function collectMapSurfaceSummary(doc, view) {
  const nodeCards = typeof doc?.querySelectorAll === 'function'
    ? Array.from(doc.querySelectorAll('.node-card'))
    : [];
  const relicPanel = doc?.getElementById?.('ncRelicPanel') || null;

  return {
    nodeCardCount: nodeCards.length,
    relicPanelVisible: isVisibleElement(relicPanel, view),
  };
}

export function collectRunRuntimeDebugSnapshot({ modules, doc, win }) {
  const gs = modules?.featureScopes?.core?.GS || modules?.GS || {};
  const view = win || doc?.defaultView || null;
  const mapSummary = collectMapSummary(gs);
  const mapSurface = {
    ...collectMapSurfaceSummary(doc, view),
    currentNodeId: mapSummary.currentNode,
    reachableNodeIds: mapSummary.reachableNodeIds,
  };
  return {
    map: {
      ...mapSummary,
      resources: {
        currentRegion: mapSummary.currentRegion,
        currentFloor: mapSummary.currentFloor,
        accessibleNodeCount: mapSummary.accessibleNodeCount,
      },
      ui: mapSurface,
      surface: {
        ...mapSurface,
      },
    },
    overlays: {
      runStart: collectRunStartOverlaySummary(doc),
    },
  };
}
