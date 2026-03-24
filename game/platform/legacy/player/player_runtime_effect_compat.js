import { GAME } from '../../../core/global_bridge.js';

export function resolvePlayerRuntimeEffectCompat(deps = {}) {
  const win = deps.win || (typeof window !== 'undefined' ? window : null);
  const legacyRoot = deps.legacyRoot || deps.gameRoot || win?.GAME || GAME;

  return {
    classMechanics: deps.classMechanics || deps.ClassMechanics || legacyRoot?.Modules?.ClassMechanics,
    endPlayerTurn: deps.endPlayerTurn || win?.endPlayerTurn || legacyRoot?.endPlayerTurn,
    screenShake: deps.screenShake || win?.ScreenShake || legacyRoot?.ScreenShake,
    setTimeoutFn: deps.setTimeoutFn || win?.setTimeout?.bind(win) || setTimeout,
    updateClassSpecialUI: deps.updateClassSpecialUI || win?.updateClassSpecialUI || legacyRoot?.updateClassSpecialUI,
    updateNoiseWidget: deps.updateNoiseWidget || win?.updateNoiseWidget || legacyRoot?.updateNoiseWidget,
  };
}
