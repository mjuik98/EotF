import {
  buildRunFlowModuleCatalog,
  buildRunMapModuleCatalog,
} from './run_module_catalog.js';

export function buildRunMapPublicModules() {
  return buildRunMapModuleCatalog();
}

export function buildRunFlowPublicModules() {
  return buildRunFlowModuleCatalog();
}
