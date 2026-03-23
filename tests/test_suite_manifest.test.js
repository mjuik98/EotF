import { describe, expect, it } from 'vitest';
import {
  isGuardrailTestFile,
  partitionTestFiles,
} from '../scripts/test_suite_manifest.mjs';

describe('test suite manifest', () => {
  it('routes assembly and architecture-oriented test files into the guardrail suite', () => {
    expect(isGuardrailTestFile('tests/compat_lint_guardrails.test.js')).toBe(true);
    expect(isGuardrailTestFile('tests/feature_compat_structure.test.js')).toBe(true);
    expect(isGuardrailTestFile('tests/composition_module_registrars.test.js')).toBe(true);
    expect(isGuardrailTestFile('tests/bootstrap_payload_assembly.test.js')).toBe(true);
  });

  it('keeps gameplay and runtime regressions in the fast suite', () => {
    expect(isGuardrailTestFile('tests/runtime_state_flow.test.js')).toBe(false);
    expect(isGuardrailTestFile('tests/help_pause_ui_runtime.test.js')).toBe(false);
    expect(isGuardrailTestFile('tests/character_select_info_panel.test.js')).toBe(false);
  });

  it('partitions mixed test file lists without dropping coverage', () => {
    const files = [
      'tests/runtime_state_flow.test.js',
      'tests/compat_lint_guardrails.test.js',
      'tests/composition_module_registrars.test.js',
      'tests/help_pause_ui_runtime.test.js',
    ];

    expect(partitionTestFiles(files)).toEqual({
      fast: [
        'tests/runtime_state_flow.test.js',
        'tests/help_pause_ui_runtime.test.js',
      ],
      guardrails: [
        'tests/compat_lint_guardrails.test.js',
        'tests/composition_module_registrars.test.js',
      ],
    });
  });
});
