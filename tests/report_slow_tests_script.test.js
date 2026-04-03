import { describe, expect, it } from 'vitest';
import {
  collectSlowTestFiles,
  filterReportToSuite,
  formatSlowTestSummary,
  sortSlowTestFiles,
} from '../scripts/report-slow-tests.mjs';

describe('report slow tests script', () => {
  it('sorts test files by duration descending', () => {
    const sorted = sortSlowTestFiles([
      { name: 'tests/b.test.js', durationMs: 500 },
      { name: 'tests/a.test.js', durationMs: 900 },
      { name: 'tests/c.test.js', durationMs: 200 },
    ]);

    expect(sorted.map((entry) => entry.name)).toEqual([
      'tests/a.test.js',
      'tests/b.test.js',
      'tests/c.test.js',
    ]);
  });

  it('extracts only files that exceed the threshold', () => {
    const report = {
      testResults: [
        { name: 'tests/fast.test.js', startTime: 1_000, endTime: 1_050 },
        { name: 'tests/slow.test.js', startTime: 2_000, endTime: 2_900 },
        { name: 'tests/mid.test.js', startTime: 3_000, endTime: 3_250 },
      ],
    };

    const slowFiles = collectSlowTestFiles(report, { thresholdMs: 300 });

    expect(slowFiles).toEqual([
      { name: 'tests/slow.test.js', durationMs: 900 },
    ]);
  });

  it('formats a markdown summary for CI step output', () => {
    const summary = formatSlowTestSummary({
      suite: 'fast',
      thresholdMs: 500,
      top: 2,
      slowFiles: [
        { name: `${process.cwd()}/tests/a.test.js`, durationMs: 900 },
        { name: `${process.cwd()}/tests/b.test.js`, durationMs: 700 },
      ],
    });

    expect(summary).toContain('### Slow Test Report');
    expect(summary).toContain('- Suite: `fast`');
    expect(summary).toContain('| 900ms | `tests/a.test.js` |');
    expect(summary).toContain('| 700ms | `tests/b.test.js` |');
  });

  it('filters a Vitest report down to the selected suite files', () => {
    const report = {
      testResults: [
        { name: `${process.cwd()}/tests/audio_engine.test.js`, startTime: 1_000, endTime: 1_900 },
        { name: `${process.cwd()}/tests/quality_workflow_scripts.test.js`, startTime: 2_000, endTime: 3_100 },
      ],
    };

    const filtered = filterReportToSuite(report, {
      suite: 'fast',
      manifest: {
        fast: ['tests/audio_engine.test.js'],
        guardrails: ['tests/quality_workflow_scripts.test.js'],
      },
    });

    expect(filtered.testResults).toEqual([
      { name: `${process.cwd()}/tests/audio_engine.test.js`, startTime: 1_000, endTime: 1_900 },
    ]);
  });
});
