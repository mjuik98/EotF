import { createRunMapRuntimePorts } from '../ports/create_run_map_runtime_ports.js';

export function createRunMapActions(context) {
  const runtimePorts = context.ports.getRunMapRuntimePorts?.()
    || createRunMapRuntimePorts(context);

  return {
    generateMap(regionIdx) {
      return runtimePorts.generateMap?.(regionIdx);
    },

    renderMinimap() {
      return runtimePorts.renderMinimap?.();
    },

    updateNextNodes() {
      return runtimePorts.updateNextNodes?.();
    },

    showFullMap() {
      return runtimePorts.showFullMap?.();
    },

    moveToNode(node) {
      return runtimePorts.moveToNode?.(node);
    },
  };
}
