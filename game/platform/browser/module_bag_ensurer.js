function resolveModuleBag(modules) {
  return modules?.legacyModules || modules || {};
}

function resolveGameRoot(modules, legacyModules) {
  return modules?.featureScopes?.core?.GAME || legacyModules?.GAME || modules?.GAME || null;
}

function defineModuleAlias(target, moduleBag, key) {
  if (!target || !moduleBag || target === moduleBag || !key) return;
  if (Object.prototype.hasOwnProperty.call(target, key)) return;

  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: false,
    get() {
      return moduleBag[key];
    },
    set(value) {
      moduleBag[key] = value;
    },
  });
}

export function publishBrowserModuleBag(modules, moduleBag) {
  if (!modules || !moduleBag) return moduleBag;
  const legacyModules = resolveModuleBag(modules);
  const gameRoot = resolveGameRoot(modules, legacyModules);

  Object.assign(legacyModules, moduleBag);
  if (legacyModules !== modules) {
    for (const key of Object.keys(moduleBag)) {
      defineModuleAlias(modules, legacyModules, key);
    }
  }

  if (typeof gameRoot?.register === 'function') {
    for (const [name, moduleObj] of Object.entries(moduleBag)) {
      gameRoot.register(name, moduleObj);
    }
  }

  return moduleBag;
}

export function createBrowserModuleBagEnsurer(options = {}) {
  const {
    resolveFromModules = null,
    loadModuleBag,
    publishModuleBag = publishBrowserModuleBag,
    prepareLoadedModuleBag = null,
  } = options;

  let moduleBagPromise = null;

  return async function ensureBrowserModuleBag(modules) {
    const resolvedModuleBag = typeof resolveFromModules === 'function'
      ? resolveFromModules(modules)
      : null;
    if (resolvedModuleBag) return resolvedModuleBag;

    if (!moduleBagPromise) {
      moduleBagPromise = Promise.resolve()
        .then(() => loadModuleBag?.())
        .catch((error) => {
          moduleBagPromise = null;
          throw error;
        });
    }

    const moduleBag = await moduleBagPromise;
    if (typeof prepareLoadedModuleBag === 'function') {
      prepareLoadedModuleBag(modules, moduleBag);
    }
    return publishModuleBag(modules, moduleBag);
  };
}
