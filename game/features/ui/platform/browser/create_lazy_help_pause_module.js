import { importHelpPauseModule } from './import_help_pause_module.js';

const LAZY_MODULE_MARKER = '__lazyModule';

export function createLazyHelpPauseModule() {
  let resolvedModule = null;
  let loadPromise = null;

  async function resolveModule() {
    if (resolvedModule) return resolvedModule;

    if (!loadPromise) {
      loadPromise = Promise.resolve()
        .then(() => importHelpPauseModule())
        .then((moduleRef) => {
          resolvedModule = moduleRef?.HelpPauseUI || null;
          return resolvedModule;
        })
        .catch((error) => {
          loadPromise = null;
          throw error;
        });
    }

    return loadPromise;
  }

  return {
    [LAZY_MODULE_MARKER]: true,

    async isHelpOpen(...args) {
      return (await resolveModule())?.isHelpOpen?.(...args);
    },

    async swallowEscape(...args) {
      return (await resolveModule())?.swallowEscape?.(...args);
    },

    async handleGlobalHotkey(...args) {
      return (await resolveModule())?.handleGlobalHotkey?.(...args);
    },

    async showMobileWarning(...args) {
      return (await resolveModule())?.showMobileWarning?.(...args);
    },

    async toggleHelp(...args) {
      return (await resolveModule())?.toggleHelp?.(...args);
    },

    async abandonRun(...args) {
      return (await resolveModule())?.abandonRun?.(...args);
    },

    async confirmReturnToTitle(...args) {
      return (await resolveModule())?.confirmReturnToTitle?.(...args);
    },

    async confirmAbandon(...args) {
      return (await resolveModule())?.confirmAbandon?.(...args);
    },

    async togglePause(...args) {
      return (await resolveModule())?.togglePause?.(...args);
    },

    async bindGlobalHotkeys(...args) {
      return (await resolveModule())?.bindGlobalHotkeys?.(...args);
    },
  };
}
