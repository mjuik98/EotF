'use strict';

import { GS } from './game_state.js';



  function _getGS(deps) {
    return deps?.gs || GS;
  }

  function _getDoc(deps) {
    return deps?.doc || document;
  }

  export const MetaProgressionUI = {
    selectFragment(effect, deps = {}) {
      const gs = _getGS(deps);
      if (!gs?.meta) return;

      const meta = gs.meta;
      switch (effect) {
        case 'echo_boost':
          meta.inscriptions.echo_boost = true;
          break;
        case 'resilience':
          meta.inscriptions.resilience = true;
          break;
        case 'fortune':
          meta.inscriptions.fortune = true;
          break;
        default:
          return;
      }

      meta.echoFragments--;
      setTimeout(() => {
        if (typeof deps.switchScreen === 'function') deps.switchScreen('title');
        if (typeof deps.clearSelectedClass === 'function') deps.clearSelectedClass();
        if (typeof deps.refreshRunModePanel === 'function') deps.refreshRunModePanel();
      }, 500);
    },

    restartFromEnding(deps = {}) {
      const doc = _getDoc(deps);
      doc.getElementById('endingScreen')?.remove();
      if (typeof deps.switchScreen === 'function') deps.switchScreen('title');
      if (typeof deps.clearSelectedClass === 'function') deps.clearSelectedClass();
      if (typeof deps.refreshRunModePanel === 'function') deps.refreshRunModePanel();
    },
  };
