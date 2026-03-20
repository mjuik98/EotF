export function createDepsAccessors(contractMap, depsCreator) {
  const accessors = {};

  for (const [accessorName, contractName] of Object.entries(contractMap || {})) {
    accessors[accessorName] = (overrides = {}) => depsCreator(contractName, overrides);
  }

  return Object.freeze(accessors);
}

export function buildContractDepAccessors(contractMap, depsFactory = null, options = {}) {
  const {
    createDeps,
    createDepsAccessors,
  } = options;
  const injectedAccessorFactory =
    typeof depsFactory?.createDepsAccessors === 'function'
      ? depsFactory.createDepsAccessors
      : null;
  const injectedDepsCreator =
    typeof depsFactory === 'function'
      ? depsFactory
      : typeof depsFactory?.createDeps === 'function'
        ? depsFactory.createDeps
        : null;

  if (!depsFactory || injectedAccessorFactory || injectedDepsCreator) {
    const depsAccessorFactory = injectedAccessorFactory || createDepsAccessors;
    const depsCreator = injectedDepsCreator || createDeps;
    if (typeof depsAccessorFactory === 'function' && typeof depsCreator === 'function') {
      return depsAccessorFactory(contractMap, depsCreator);
    }
  }

  const accessors = {};
  for (const accessorName of Object.keys(contractMap || {})) {
    accessors[accessorName] = (overrides = {}) => ({
      ...(depsFactory?.[accessorName]?.() || {}),
      ...overrides,
    });
  }

  return Object.freeze(accessors);
}

export function buildFeatureContractAccessors(contractMap, depsFactory = null, options = {}) {
  const {
    buildContractDepAccessors,
    createDeps,
    createDepsAccessors,
  } = options;
  const resolvedFactory = depsFactory || {};
  const buildAccessors =
    typeof resolvedFactory.buildContractDepAccessors === 'function'
      ? resolvedFactory.buildContractDepAccessors
      : buildContractDepAccessors;
  if (typeof buildAccessors === 'function') {
    return buildAccessors(contractMap, resolvedFactory);
  }

  const createDepsFn =
    typeof resolvedFactory === 'function'
      ? resolvedFactory
      : typeof resolvedFactory.createDeps === 'function'
        ? resolvedFactory.createDeps
        : createDeps;
  const createAccessors =
    typeof resolvedFactory.createDepsAccessors === 'function'
      ? resolvedFactory.createDepsAccessors
      : createDepsAccessors;
  if (typeof createAccessors === 'function' && typeof createDepsFn === 'function') {
    return createAccessors(contractMap, createDepsFn);
  }

  const accessors = {};
  for (const accessorName of Object.keys(contractMap || {})) {
    accessors[accessorName] = (overrides = {}) => ({
      ...(resolvedFactory?.[accessorName]?.() || {}),
      ...overrides,
    });
  }
  return Object.freeze(accessors);
}
