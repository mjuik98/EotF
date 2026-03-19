import { createRunRuleCapabilities } from './public_rule_capabilities.js';
import { createRunRuntimeCapabilities } from './public_runtime_capabilities.js';

export function createRunSystemCapabilities() {
  return {
    rules: createRunRuleCapabilities(),
    runtime: createRunRuntimeCapabilities(),
  };
}
