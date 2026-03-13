import { createRunRuleCapabilities } from './public_rule_capabilities.js';
import { createRunRuntimeCapabilities } from './runtime/public_run_runtime_surface.js';

export function createRunSystemCapabilities() {
  return {
    rules: createRunRuleCapabilities(),
    runtime: createRunRuntimeCapabilities(),
  };
}
