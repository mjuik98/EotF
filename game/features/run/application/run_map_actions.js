import { setNodeMovementLocked } from '../ports/public_state_capabilities.js';

export function createRunMapActions(context) {
  const { fns, modules, ports } = context;

  return {
    generateMap(regionIdx) {
      const deps = ports.getCanvasDeps({
        getBaseRegionIndex: modules.getBaseRegionIndex,
        getRegionData: modules.getRegionData,
        showWorldMemoryNotice: fns.showWorldMemoryNotice,
        updateNextNodes: fns.updateNextNodes,
        updateUI: fns.updateUI,
      });
      modules.MapGenerationUI?.generateMap?.(regionIdx, deps);
    },

    renderMinimap() {
      const deps = ports.getCanvasDeps({
        getFloorStatusText: fns.getFloorStatusText,
        minimapCanvas: modules._canvasRefs?.minimapCanvas,
        minimapCtx: modules._canvasRefs?.minimapCtx,
        moveToNode: fns.moveToNode,
        moveToNodeHandlerName: 'moveToNode',
        nodeMeta: modules.NODE_META,
      });
      modules.MapUI?.renderMinimap?.(deps);
    },

    updateNextNodes() {
      const deps = ports.getCanvasDeps({
        closeDeckView: fns.closeDeckView,
        getFloorStatusText: fns.getFloorStatusText,
        minimapCanvas: modules._canvasRefs?.minimapCanvas,
        minimapCtx: modules._canvasRefs?.minimapCtx,
        moveToNode: fns.moveToNode,
        moveToNodeHandlerName: 'moveToNode',
        nodeMeta: modules.NODE_META,
        showDeckView: fns.showDeckView,
        showFullMap: fns.showFullMap,
        togglePause: fns.togglePause,
      });
      modules.MapUI?.updateNextNodes?.(deps);
    },

    showFullMap() {
      const deps = ports.getCanvasDeps({
        getFloorStatusText: fns.getFloorStatusText,
        getRegionData: modules.getRegionData,
        minimapCanvas: modules._canvasRefs?.minimapCanvas,
        minimapCtx: modules._canvasRefs?.minimapCtx,
        moveToNode: fns.moveToNode,
        moveToNodeHandlerName: 'moveToNode',
        nodeMeta: modules.NODE_META,
      });
      modules.MapUI?.showFullMap?.(deps);
    },

    moveToNode(node) {
      const deps = ports.getCanvasDeps({
        nodeHandoff: ports.getRunNodeHandoffDeps(),
        renderMinimap: fns.renderMinimap,
        setNodeMovementLocked,
        updateNextNodes: fns.updateNextNodes,
        updateUI: fns.updateUI,
      });
      modules.MapNavigationUI?.moveToNode?.(node, deps);
    },
  };
}
