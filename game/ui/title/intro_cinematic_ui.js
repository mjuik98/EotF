import { playIntroCinematicRuntime } from './intro_cinematic_runtime.js';

export const IntroCinematicUI = {
  play(deps = {}, onComplete) {
    playIntroCinematicRuntime(deps, onComplete);
  },
};
