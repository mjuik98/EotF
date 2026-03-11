import { buildBindingDepsPayload } from './build_binding_deps_payload.js';

export function initBindingDeps({ modules, fns, deps }) {
  deps.initDepsFactory(buildBindingDepsPayload({ modules, fns, deps }));
}
