import {
  continueFrontdoorRunUseCase,
  startFrontdoorRunUseCase,
  completeFrontdoorReturn,
  returnToFrontdoorFromPause,
} from './public_application_capabilities.js';
import {
  CharacterSelectUI,
  RunEndScreenUI,
} from './public_presentation_capabilities.js';
import {
  createFrontdoorRuntimeCapabilities,
} from './runtime/public_frontdoor_runtime_surface.js';

export function createFrontdoorApplicationCapabilities() {
  return Object.freeze({
    continueRun: continueFrontdoorRunUseCase,
    startRun: startFrontdoorRunUseCase,
    completeReturn: completeFrontdoorReturn,
    returnFromPause: returnToFrontdoorFromPause,
  });
}

export function createFrontdoorPresentationCapabilities() {
  return Object.freeze({
    CharacterSelectUI,
    RunEndScreenUI,
  });
}

export const FrontdoorPublicSurface = Object.freeze({
  application: createFrontdoorApplicationCapabilities(),
  presentation: createFrontdoorPresentationCapabilities(),
  runtime: createFrontdoorRuntimeCapabilities(),
});
