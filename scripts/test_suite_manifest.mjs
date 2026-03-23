import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_SUITE_MANIFEST_FILE_PATH = path.join(process.cwd(), 'config', 'quality', 'test_suite_manifest.json');
export const SUITE_MANIFEST_PATH = DEFAULT_SUITE_MANIFEST_FILE_PATH.replaceAll('\\', '/');

export function normalizeTestFilePath(filePath) {
  return String(filePath || '').split(path.sep).join('/');
}

export function readSuiteManifest(manifestPath = DEFAULT_SUITE_MANIFEST_FILE_PATH) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  return {
    fast: (manifest.fast || []).map(normalizeTestFilePath),
    guardrails: (manifest.guardrails || []).map(normalizeTestFilePath),
  };
}

export function buildSuiteManifest(filePaths = listRepositoryTestFiles(), manifest = readSuiteManifest()) {
  const normalizedFiles = filePaths.map(normalizeTestFilePath).sort();
  const guardrailSet = new Set(
    (manifest.guardrails || [])
      .map(normalizeTestFilePath)
      .filter((filePath) => normalizedFiles.includes(filePath)),
  );

  return {
    fast: normalizedFiles.filter((filePath) => !guardrailSet.has(filePath)),
    guardrails: [...guardrailSet].sort(),
  };
}

export function validateSuiteManifestCoverage(filePaths = listRepositoryTestFiles(), manifest = readSuiteManifest()) {
  const normalizedFiles = filePaths.map(normalizeTestFilePath).sort();
  const suiteEntries = [
    ...manifest.fast.map((filePath) => ({ filePath, suite: 'fast' })),
    ...manifest.guardrails.map((filePath) => ({ filePath, suite: 'guardrails' })),
  ];
  const seenSuites = new Map();
  const duplicates = [];

  for (const { filePath, suite } of suiteEntries) {
    if (seenSuites.has(filePath)) {
      duplicates.push(`${filePath} (${seenSuites.get(filePath)}, ${suite})`);
      continue;
    }
    seenSuites.set(filePath, suite);
  }

  const manifestFiles = new Set(suiteEntries.map(({ filePath }) => filePath));
  const repositoryFiles = new Set(normalizedFiles);
  const missing = normalizedFiles.filter((filePath) => !manifestFiles.has(filePath));
  const extras = [...manifestFiles].filter((filePath) => !repositoryFiles.has(filePath)).sort();

  return {
    duplicates: [...new Set(duplicates)].sort(),
    missing,
    extras,
  };
}

function diffFileLists(previous = [], next = []) {
  const previousSet = new Set(previous.map(normalizeTestFilePath));
  const nextSet = new Set(next.map(normalizeTestFilePath));
  return {
    added: [...nextSet].filter((filePath) => !previousSet.has(filePath)).sort(),
    removed: [...previousSet].filter((filePath) => !nextSet.has(filePath)).sort(),
  };
}

export function diffSuiteManifest(previous = { fast: [], guardrails: [] }, next = { fast: [], guardrails: [] }) {
  return {
    fast: diffFileLists(previous.fast, next.fast),
    guardrails: diffFileLists(previous.guardrails, next.guardrails),
  };
}

export function getSuiteForTestFile(filePath, manifest = readSuiteManifest()) {
  const normalized = normalizeTestFilePath(filePath);
  if (manifest.fast.includes(normalized)) return 'fast';
  if (manifest.guardrails.includes(normalized)) return 'guardrails';
  return null;
}

export function writeSuiteManifest({
  manifestPath = DEFAULT_SUITE_MANIFEST_FILE_PATH,
  filePaths = listRepositoryTestFiles(),
  manifest = readSuiteManifest(manifestPath),
} = {}) {
  const nextManifest = buildSuiteManifest(filePaths, manifest);
  const payload = {
    generatedAt: new Date().toISOString(),
    ...nextManifest,
  };
  fs.writeFileSync(manifestPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return payload;
}

export function partitionTestFiles(filePaths, manifest = readSuiteManifest()) {
  const fast = [];
  const guardrails = [];

  for (const filePath of filePaths) {
    const suite = getSuiteForTestFile(filePath, manifest);
    if (suite === 'guardrails') {
      guardrails.push(filePath);
      continue;
    }
    if (suite !== 'fast') {
      throw new Error(`Missing test suite assignment for ${normalizeTestFilePath(filePath)}`);
    }
    fast.push(filePath);
  }

  return { fast, guardrails };
}

export function listRepositoryTestFiles(rootDir = process.cwd()) {
  const testsDir = path.join(rootDir, 'tests');
  return fs.readdirSync(testsDir)
    .filter((fileName) => fileName.endsWith('.test.js'))
    .map((fileName) => normalizeTestFilePath(path.join('tests', fileName)))
    .sort();
}

function compareManifestSync(expected, actual) {
  return JSON.stringify(expected) === JSON.stringify(actual);
}

function printCoverageFailures(coverage) {
  if (coverage.duplicates.length > 0) {
    console.error('Duplicate suite assignments:');
    coverage.duplicates.forEach((entry) => console.error(`- ${entry}`));
  }
  if (coverage.missing.length > 0) {
    console.error('Missing suite assignments:');
    coverage.missing.forEach((entry) => console.error(`- ${entry}`));
  }
  if (coverage.extras.length > 0) {
    console.error('Stale manifest entries:');
    coverage.extras.forEach((entry) => console.error(`- ${entry}`));
  }
}

function printSuiteDiff(diff) {
  if (diff.fast.added.length > 0 || diff.fast.removed.length > 0) {
    console.error('Fast suite changes:');
    diff.fast.added.forEach((entry) => console.error(`+ ${entry}`));
    diff.fast.removed.forEach((entry) => console.error(`- ${entry}`));
  }
  if (diff.guardrails.added.length > 0 || diff.guardrails.removed.length > 0) {
    console.error('Guardrail suite changes:');
    diff.guardrails.added.forEach((entry) => console.error(`+ ${entry}`));
    diff.guardrails.removed.forEach((entry) => console.error(`- ${entry}`));
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const shouldWrite = process.argv.includes('--write');
  const shouldCheck = process.argv.includes('--check');

  if (shouldWrite) {
    const nextManifest = writeSuiteManifest();
    console.log(`Test suite manifest written (${nextManifest.fast.length} fast, ${nextManifest.guardrails.length} guardrails).`);
  }

  if (shouldCheck) {
    const manifest = readSuiteManifest();
    const coverage = validateSuiteManifestCoverage(undefined, manifest);
    const rebuilt = buildSuiteManifest(undefined, manifest);
    const inSync = compareManifestSync(rebuilt, manifest);
    const suiteDiff = diffSuiteManifest(manifest, rebuilt);

    if (coverage.duplicates.length > 0 || coverage.missing.length > 0 || coverage.extras.length > 0 || !inSync) {
      printCoverageFailures(coverage);
      printSuiteDiff(suiteDiff);
      if (!inSync) {
        console.error('Test suite manifest is out of date. Run: node scripts/test_suite_manifest.mjs --write');
      }
      process.exitCode = 1;
    } else {
      console.log(`Test suite manifest check passed (${manifest.fast.length} fast, ${manifest.guardrails.length} guardrails).`);
    }
  }
}
