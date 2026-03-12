import { createTitleFeatureFacade } from '../../../features/title/public.js';

export function buildTitleFlowModules() {
  return createTitleFeatureFacade().moduleCapabilities.flow;
}
