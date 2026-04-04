import { createRunWorldRenderRuntimePorts } from '../ports/create_run_world_render_runtime_ports.js';

export function createWorldRenderActions(context) {
  const runtimePorts = context.ports.getRunWorldRenderRuntimePorts?.()
    || createRunWorldRenderRuntimePorts(context);

  return {
    gameLoop(timestamp) {
      return runtimePorts.gameLoop?.(timestamp);
    },

    renderGameWorld(dt, ctx, w, h) {
      return runtimePorts.renderGameWorld?.(dt, ctx, w, h);
    },

    renderRegionBackground(ctx, w, h) {
      return runtimePorts.renderRegionBackground?.(ctx, w, h);
    },

    renderDynamicLights(ctx, w, h) {
      return runtimePorts.renderDynamicLights?.(ctx, w, h);
    },

    renderNodeInfo(ctx, w, h) {
      return runtimePorts.renderNodeInfo?.(ctx, w, h);
    },

    getFloorStatusText(regionId, floor) {
      return runtimePorts.getFloorStatusText?.(regionId, floor) || '';
    },

    wrapCanvasText(ctx, text, x, y, maxW, lineH) {
      return runtimePorts.wrapCanvasText?.(ctx, text, x, y, maxW, lineH);
    },

    roundRect(ctx, x, y, w, h, r) {
      return runtimePorts.roundRect?.(ctx, x, y, w, h, r);
    },

    roundRectTop(ctx, x, y, w, h, r) {
      return runtimePorts.roundRectTop?.(ctx, x, y, w, h, r);
    },
  };
}
