import { playClassSelect } from '../public_audio_support_capabilities.js';
import { buildUiHelpPauseContract } from './build_ui_help_pause_contract.js';

export function buildUiShellContractBuilders(ctx) {
  const {
    getRefs,
    buildBaseDeps,
    getRaf,
    getSyncVolumeUIFallback,
  } = ctx;

  return {
    feedback: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps('ui'),
        audioEngine: refs.AudioEngine,
        screenShake: refs.ScreenShake,
        requestAnimationFrame: getRaf(),
      };
    },

    codex: () => ({
      ...buildBaseDeps('ui'),
    }),

    deckModal: () => ({
      ...buildBaseDeps('ui'),
    }),

    tooltip: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps('ui'),
        setBonusSystem: refs.SetBonusSystem,
      };
    },

    screen: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps('ui'),
        onEnterTitle: () => refs.animateTitle?.(),
      };
    },

    classSelect: () => {
      const baseDeps = buildBaseDeps('ui');
      const refs = getRefs();
      return {
        ...baseDeps,
        playClassSelect: (cls) => {
          try {
            playClassSelect(refs.AudioEngine, cls);
          } catch (e) {
            baseDeps.logger?.warn?.('Audio error:', e);
          }
        },
      };
    },

    settings: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps('ui'),
        audioEngine: refs.AudioEngine,
        ScreenShake: refs.ScreenShake,
        HitStop: refs.HitStop,
        ParticleSystem: refs.ParticleSystem,
        openSettings: refs.openSettings,
        closeSettings: refs.closeSettings,
        setSettingsTab: refs.setSettingsTab,
      };
    },

    helpPause: () => buildUiHelpPauseContract({
        buildBaseDeps,
        getRefs,
        getSyncVolumeUIFallback,
      }),
  };
}
