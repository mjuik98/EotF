const LAZY_MODULE_MARKER = '__lazyModule';

function createLazyFeatureModule({ loadModule, methods = [], nestedMethods = {} }) {
  let resolvedModule = null;
  let loadPromise = null;

  async function resolveModule() {
    if (resolvedModule) return resolvedModule;

    if (!loadPromise) {
      loadPromise = Promise.resolve()
        .then(() => loadModule())
        .then((moduleRef) => {
          resolvedModule = moduleRef;
          return moduleRef;
        })
        .catch((error) => {
          loadPromise = null;
          throw error;
        });
    }

    return loadPromise;
  }

  const lazyModule = {
    [LAZY_MODULE_MARKER]: true,
  };

  for (const methodName of methods) {
    lazyModule[methodName] = async (...args) => {
      const moduleRef = await resolveModule();
      return moduleRef?.[methodName]?.(...args);
    };
  }

  for (const [namespace, namespaceMethods] of Object.entries(nestedMethods)) {
    lazyModule[namespace] = {};

    for (const methodName of namespaceMethods) {
      lazyModule[namespace][methodName] = async (...args) => {
        const moduleRef = await resolveModule();
        return moduleRef?.[namespace]?.[methodName]?.(...args);
      };
    }
  }

  return lazyModule;
}

export function createLazyEventModule() {
  return createLazyFeatureModule({
    loadModule: () => import('../../presentation/browser/event_ui.js').then((mod) => mod.EventUI),
    methods: [
      'triggerRandomEvent',
      'updateEventGoldBar',
      'showEvent',
      'resolveEvent',
      'showShop',
      'showRestSite',
      'showCardDiscard',
      'showItemShop',
    ],
    nestedMethods: {
      api: [
        'showEvent',
        'resolveEvent',
        'showShop',
        'showRestSite',
        'showItemShop',
      ],
    },
  });
}
