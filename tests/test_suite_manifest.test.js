import { describe, expect, it } from 'vitest';
import {
  buildSuiteManifest,
  diffSuiteManifest,
  SUITE_MANIFEST_PATH,
  getSuiteForTestFile,
  partitionTestFiles,
  readSuiteManifest,
  validateSuiteManifestCoverage,
} from '../scripts/test_suite_manifest.mjs';

describe('test suite manifest', () => {
  it('loads an explicit suite manifest from quality config', () => {
    const manifest = readSuiteManifest();

    expect(SUITE_MANIFEST_PATH.endsWith('config/quality/test_suite_manifest.json')).toBe(true);
    expect(manifest.fast.length).toBeGreaterThan(0);
    expect(manifest.guardrails.length).toBeGreaterThan(0);
  });

  it('routes repository tests according to the explicit manifest instead of filename tokens', () => {
    expect(getSuiteForTestFile('tests/compat_lint_guardrails.test.js')).toBe('guardrails');
    expect(getSuiteForTestFile('tests/composition_module_registrars.test.js')).toBe('guardrails');
    expect(getSuiteForTestFile('tests/runtime_state_flow.test.js')).toBe('fast');
    expect(getSuiteForTestFile('tests/help_pause_ui_runtime.test.js')).toBe('fast');
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

  it('verifies the explicit manifest covers repository tests without duplicates or gaps', () => {
    const coverage = validateSuiteManifestCoverage();

    expect(coverage.duplicates).toEqual([]);
    expect(coverage.missing).toEqual([]);
    expect(coverage.extras).toEqual([]);
  });

  it('can rebuild the manifest from repository tests while preserving explicit guardrail ownership', () => {
    const rebuilt = buildSuiteManifest(
      [
        'tests/runtime_state_flow.test.js',
        'tests/compat_lint_guardrails.test.js',
        'tests/new_runtime_case.test.js',
      ],
      {
        fast: ['tests/runtime_state_flow.test.js'],
        guardrails: ['tests/compat_lint_guardrails.test.js'],
      },
    );

    expect(rebuilt.fast).toEqual([
      'tests/new_runtime_case.test.js',
      'tests/runtime_state_flow.test.js',
    ]);
    expect(rebuilt.guardrails).toEqual([
      'tests/compat_lint_guardrails.test.js',
    ]);
  });

  it('describes suite drift in explicit added and removed file lists', () => {
    const diff = diffSuiteManifest(
      {
        fast: ['tests/runtime_state_flow.test.js'],
        guardrails: ['tests/compat_lint_guardrails.test.js'],
      },
      {
        fast: ['tests/new_runtime_case.test.js', 'tests/runtime_state_flow.test.js'],
        guardrails: ['tests/new_guardrail_case.test.js'],
      },
    );

    expect(diff).toEqual({
      fast: {
        added: ['tests/new_runtime_case.test.js'],
        removed: [],
      },
      guardrails: {
        added: ['tests/new_guardrail_case.test.js'],
        removed: ['tests/compat_lint_guardrails.test.js'],
      },
    });
  });
});
