const LAZY_MODULE_MARKER = '__lazyModule';

function createLazyFeatureModule({ loadModule, methods = [] }) {
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

  return lazyModule;
}

export function createLazyCodexModule() {
  return createLazyFeatureModule({
    loadModule: () => import('../../presentation/browser/codex_ui.js').then((mod) => mod.CodexUI),
    methods: [
      'openCodex',
      'closeCodex',
      'setCodexTab',
      'renderCodexContent',
    ],
  });
}
