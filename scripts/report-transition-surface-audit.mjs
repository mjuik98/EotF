import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const CANONICAL_ROOTS = ['game/features', 'game/shared', 'game/platform'];
export const TRANSITIONAL_ROOTS = [
  'game/app',
  'game/combat',
  'game/domain',
  'game/presentation',
  'game/state',
  'game/systems',
  'game/ui',
];

function walkJsFiles(rootPath) {
  if (!fs.existsSync(rootPath)) return [];

  const stat = fs.statSync(rootPath);
  if (stat.isFile()) {
    return rootPath.endsWith('.js') ? [rootPath] : [];
  }

  return fs.readdirSync(rootPath, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(rootPath, entry.name);
    if (entry.isDirectory()) return walkJsFiles(fullPath);
    return entry.isFile() && entry.name.endsWith('.js') ? [fullPath] : [];
  });
}

function countRootFiles(rootDir, relativeRoot) {
  return walkJsFiles(path.join(rootDir, relativeRoot)).length;
}

export function buildTransitionSurfaceAuditReport(rootDir = process.cwd()) {
  const allRoots = [...CANONICAL_ROOTS, ...TRANSITIONAL_ROOTS];
  const rootCounts = Object.fromEntries(
    allRoots.map((relativeRoot) => [relativeRoot, countRootFiles(rootDir, relativeRoot)]),
  );

  const totals = {
    canonical: CANONICAL_ROOTS.reduce((sum, root) => sum + rootCounts[root], 0),
    transitional: TRANSITIONAL_ROOTS.reduce((sum, root) => sum + rootCounts[root], 0),
  };

  const largestTransitionalRoots = TRANSITIONAL_ROOTS
    .map((root) => ({ root, count: rootCounts[root] }))
    .sort((a, b) => b.count - a.count || a.root.localeCompare(b.root));

  return {
    canonicalRoots: CANONICAL_ROOTS,
    transitionalRoots: TRANSITIONAL_ROOTS,
    rootCounts,
    totals,
    largestTransitionalRoots,
  };
}

function printHumanReport(report) {
  console.log('Canonical roots');
  for (const root of report.canonicalRoots) {
    console.log(`- ${root}: ${report.rootCounts[root]}`);
  }

  console.log('Transitional roots');
  for (const root of report.transitionalRoots) {
    console.log(`- ${root}: ${report.rootCounts[root]}`);
  }

  console.log(`Canonical total: ${report.totals.canonical}`);
  console.log(`Transitional total: ${report.totals.transitional}`);
  console.log('Largest transitional roots');
  report.largestTransitionalRoots.forEach(({ root, count }) => {
    console.log(`- ${root}: ${count}`);
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const report = buildTransitionSurfaceAuditReport(process.cwd());
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printHumanReport(report);
  }
}
