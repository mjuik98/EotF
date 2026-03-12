import { createTitleFeatureFacade } from '../../../features/title/public.js';

export function buildTitleCanvasModules() {
  return createTitleFeatureFacade().moduleCapabilities.canvas;
}
