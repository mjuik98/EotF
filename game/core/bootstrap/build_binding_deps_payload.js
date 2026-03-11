import { buildBindingDepsHelpers } from './build_binding_deps_helpers.js';
import { buildBindingDepsRefs } from './build_binding_deps_refs.js';

export function buildBindingDepsPayload({ modules, fns, deps }) {
  return {
    ...buildBindingDepsRefs({ modules, fns }),
    ...buildBindingDepsHelpers({ modules, deps }),
  };
}
