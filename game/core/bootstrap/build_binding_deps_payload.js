import { buildBindingFeatureRefs } from './build_binding_feature_refs.js';
import { buildBindingDepsHelpers } from './build_binding_deps_helpers.js';
import { buildBindingDepsRefs } from './build_binding_deps_refs.js';
import { buildBindingRuntimePorts } from './build_binding_runtime_ports.js';

export function buildBindingDepsPayload({ modules, fns, deps }) {
  const refs = {
    ...buildBindingDepsRefs({ modules, fns }),
    ...buildBindingDepsHelpers({ modules, deps }),
  };

  return {
    ...refs,
    runtimePorts: buildBindingRuntimePorts({ modules }),
    featureRefs: buildBindingFeatureRefs(refs),
  };
}
