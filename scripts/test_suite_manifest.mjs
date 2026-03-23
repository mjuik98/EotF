import fs from 'node:fs';
import path from 'node:path';

const GUARDRAIL_TOKENS = [
  'compat',
  'guardrail',
  'guardrails',
  'structure',
  'boundaries',
  'registration',
  'registrar',
  'registrars',
  'payload',
  'builder',
  'builders',
  'module',
  'modules',
  'assembly',
];

export function normalizeTestFilePath(filePath) {
  return String(filePath || '').split(path.sep).join('/');
}

export function isGuardrailTestFile(filePath) {
  const normalized = normalizeTestFilePath(filePath).toLowerCase();
  const baseName = path.posix.basename(normalized);
  return GUARDRAIL_TOKENS.some((token) => baseName.includes(token));
}

export function partitionTestFiles(filePaths) {
  const fast = [];
  const guardrails = [];

  for (const filePath of filePaths) {
    if (isGuardrailTestFile(filePath)) {
      guardrails.push(filePath);
      continue;
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
