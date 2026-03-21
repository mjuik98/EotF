import { importDeckModalModule } from './import_deck_modal_module.js';

const LAZY_MODULE_MARKER = '__lazyModule';

export function createLazyDeckModalModule() {
  let resolvedModule = null;
  let loadPromise = null;

  async function resolveModule() {
    if (resolvedModule) return resolvedModule;

    if (!loadPromise) {
      loadPromise = Promise.resolve()
        .then(() => importDeckModalModule())
        .then((moduleRef) => {
          resolvedModule = moduleRef?.DeckModalUI || null;
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

    async resetFilter(...args) {
      return (await resolveModule())?.resetFilter?.(...args);
    },

    async showDeckView(...args) {
      return (await resolveModule())?.showDeckView?.(...args);
    },

    async renderDeckModal(...args) {
      return (await resolveModule())?.renderDeckModal?.(...args);
    },

    async setDeckFilter(...args) {
      return (await resolveModule())?.setDeckFilter?.(...args);
    },

    async closeDeckView(...args) {
      return (await resolveModule())?.closeDeckView?.(...args);
    },
  };
}
