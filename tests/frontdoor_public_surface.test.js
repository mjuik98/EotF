import { describe, expect, it } from 'vitest';

import {
  FrontdoorPublicSurface,
  createFrontdoorApplicationCapabilities,
  createFrontdoorPresentationCapabilities,
} from '../game/features/frontdoor/public.js';

describe('frontdoor_public_surface', () => {
  it('exposes a grouped frontdoor session surface', () => {
    expect(Object.keys(FrontdoorPublicSurface).sort()).toEqual([
      'application',
      'presentation',
      'runtime',
    ]);
  });

  it('keeps grouped capability creators stable', () => {
    expect(typeof createFrontdoorApplicationCapabilities).toBe('function');
    expect(typeof createFrontdoorPresentationCapabilities).toBe('function');
    expect(typeof FrontdoorPublicSurface.application.startRun).toBe('function');
    expect(typeof FrontdoorPublicSurface.application.createFlowActions).toBe('function');
    expect(typeof FrontdoorPublicSurface.application.buildHelpPauseContract).toBe('function');
    expect(typeof FrontdoorPublicSurface.presentation.CharacterSelectUI).toBe('object');
    expect(typeof FrontdoorPublicSurface.runtime.registerBindings).toBe('function');
    expect(typeof FrontdoorPublicSurface.runtime.bootGame).toBe('function');
    expect(typeof FrontdoorPublicSurface.runtime.bootWhenReady).toBe('function');
  });
});
