import { PUBLIC_DEP_ACCESSOR_CONTRACTS } from './deps_factory_public_accessors.js';

export function createPublicDepAccessorExportBindings(getPublicDepAccessors) {
  return Object.freeze(
    Object.fromEntries(
      Object.keys(PUBLIC_DEP_ACCESSOR_CONTRACTS).map((accessorName) => ([
        accessorName,
        (...args) => getPublicDepAccessors()[accessorName](...args),
      ])),
    ),
  );
}
