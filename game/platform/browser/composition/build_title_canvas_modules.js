import { createTitleFeatureFacade } from '../../../features/title/public.js';

export function buildTitleCanvasModules() {
  return createTitleFeatureFacade().modules.canvas;
}
