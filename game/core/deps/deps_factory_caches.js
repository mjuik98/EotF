export function createDepsFactoryCaches({
  createDepContractCatalog,
  createPublicDepAccessors,
  runtime,
  createDeps,
}) {
  let contractCatalog = null;
  let publicDepAccessors = null;

  function getContractCatalog() {
    if (!contractCatalog) {
      contractCatalog = createDepContractCatalog(runtime, createDeps);
    }
    return contractCatalog;
  }

  function getPublicDepAccessors() {
    if (!publicDepAccessors) {
      publicDepAccessors = createPublicDepAccessors(createDeps);
    }
    return publicDepAccessors;
  }

  return Object.freeze({
    getContractCatalog,
    getPublicDepAccessors,
  });
}
