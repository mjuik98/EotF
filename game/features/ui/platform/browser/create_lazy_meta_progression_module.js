import { importMetaProgressionModule } from './import_meta_progression_module.js';

const LAZY_MODULE_MARKER = '__lazyModule';

export function createLazyMetaProgressionModule() {
  let resolvedModule = null;
  let loadPromise = null;

  async function resolveModule() {
    if (resolvedModule) return resolvedModule;

    if (!loadPromise) {
      loadPromise = Promise.resolve()
        .then(() => importMetaProgressionModule())
        .then((moduleRef) => {
          resolvedModule = moduleRef?.MetaProgressionUI || null;
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

    async selectEndingFragment(...args) {
      return (await resolveModule())?.selectEndingFragment?.(...args);
    },

    async selectFragment(...args) {
      return (await resolveModule())?.selectFragment?.(...args);
    },

    async restartEndingFlow(...args) {
      return (await resolveModule())?.restartEndingFlow?.(...args);
    },

    async restartFromEnding(...args) {
      return (await resolveModule())?.restartFromEnding?.(...args);
    },
  };
}
