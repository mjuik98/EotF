import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const COMPAT_ROOTS = ['game/ui', 'game/app', 'game/combat'];
const DOC_ROOTS = ['README.md', 'AGENTS.md'];
const SCRIPT_REF_PATTERN = /scripts\/[A-Za-z0-9_./-]+\.(?:mjs|js)/g;
const THIN_REEXPORT_PATTERN = /^(?:export\s+(?:\*|\{[\s\S]*?\})\s+from\s+['"][^'"]+['"];\s*)+$/;
const DEFAULT_STRUCTURAL_AUDIT_THRESHOLDS_FILE_PATH = path.join(process.cwd(), 'config', 'quality', 'structural_audit_thresholds.json');
export const STRUCTURAL_AUDIT_THRESHOLDS_PATH = DEFAULT_STRUCTURAL_AUDIT_THRESHOLDS_FILE_PATH.replaceAll('\\', '/');

function walkFiles(rootPath) {
  if (!fs.existsSync(rootPath)) return [];
  const stat = fs.statSync(rootPath);
  if (stat.isFile()) return [rootPath];

  const entries = fs.readdirSync(rootPath, { withFileTypes: true });
  return entries.flatMap((entry) => walkFiles(path.join(rootPath, entry.name)));
}

export function isThinReexportSource(source) {
  return THIN_REEXPORT_PATTERN.test(source.trim());
}

export function readStructuralAuditThresholds(configPath = DEFAULT_STRUCTURAL_AUDIT_THRESHOLDS_FILE_PATH) {
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function collectThinReexportFiles(rootDir, compatRoots = COMPAT_ROOTS) {
  return compatRoots.flatMap((relativeRoot) => {
    const absoluteRoot = path.join(rootDir, relativeRoot);
    const files = walkFiles(absoluteRoot)
      .filter((file) => file.endsWith('.js'))
      .map((file) => {
        const source = fs.readFileSync(file, 'utf8');
        if (!isThinReexportSource(source)) return null;

        const targets = [...source.matchAll(/from\s+['"]([^'"]+)['"]/g)]
          .map(([, specifier]) => specifier)
          .map((specifier) => path.resolve(path.dirname(file), specifier));

        return {
          file,
          relativeFile: path.relative(rootDir, file).replaceAll('\\', '/'),
          targets,
        };
      })
      .filter(Boolean);

    return files;
  });
}

function collectThinReexportIndex(thinReexports) {
  return new Map(
    thinReexports.map((entry) => [path.resolve(entry.file), entry]),
  );
}

function collectMultiHopCompatChains(rootDir, thinReexports) {
  const thinIndex = collectThinReexportIndex(thinReexports);
  const chains = [];

  for (const entry of thinReexports) {
    if (entry.targets.length !== 1) continue;

    const chain = [entry.relativeFile];
    let current = entry.targets[0];
    let next = thinIndex.get(current);

    while (next) {
      chain.push(path.relative(rootDir, next.file).replaceAll('\\', '/'));
      if (next.targets.length !== 1) break;
      current = next.targets[0];
      next = thinIndex.get(current);
    }

    if (chain.length > 1) {
      chains.push({
        source: entry.relativeFile,
        hops: chain,
      });
    }
  }

  return chains;
}

function collectStaleScriptReferences(rootDir) {
  const sources = DOC_ROOTS
    .map((relativePath) => path.join(rootDir, relativePath))
    .flatMap((absolutePath) => walkFiles(absolutePath))
    .filter((file) => file.endsWith('.md'));

  return sources.flatMap((file) => {
    const source = fs.readFileSync(file, 'utf8');
    const references = [...source.matchAll(SCRIPT_REF_PATTERN)].map(([match]) => match);

    return references
      .filter((reference, index) => references.indexOf(reference) === index)
      .filter((reference) => !fs.existsSync(path.join(rootDir, reference)))
      .map((reference) => ({
        source: path.relative(rootDir, file).replaceAll('\\', '/'),
        reference,
      }));
  });
}

export function buildStructuralAuditReport(rootDir = process.cwd()) {
  const thinReexports = collectThinReexportFiles(rootDir);
  const multiHopCompatChains = collectMultiHopCompatChains(rootDir, thinReexports);
  const staleScriptReferences = collectStaleScriptReferences(rootDir);
  const thresholds = readStructuralAuditThresholds(path.join(rootDir, 'config', 'quality', 'structural_audit_thresholds.json'));

  const compatRootCounts = Object.fromEntries(
    COMPAT_ROOTS.map((compatRoot) => [
      compatRoot,
      thinReexports.filter((entry) => entry.relativeFile.startsWith(`${compatRoot}/`)).length,
    ]),
  );

  const thresholdFailures = [];
  if (thinReexports.length > thresholds.maxThinReexports) {
    thresholdFailures.push(`thin re-exports: ${thinReexports.length} (max ${thresholds.maxThinReexports})`);
  }
  for (const [compatRoot, count] of Object.entries(compatRootCounts)) {
    const maxCount = thresholds.maxCompatRootCounts?.[compatRoot];
    if (typeof maxCount === 'number' && count > maxCount) {
      thresholdFailures.push(`${compatRoot}: ${count} thin re-exports (max ${maxCount})`);
    }
  }
  if (multiHopCompatChains.length > thresholds.maxMultiHopCompatChains) {
    thresholdFailures.push(`multi-hop compat chains: ${multiHopCompatChains.length} (max ${thresholds.maxMultiHopCompatChains})`);
  }
  if (staleScriptReferences.length > thresholds.maxStaleScriptReferences) {
    thresholdFailures.push(`stale script references: ${staleScriptReferences.length} (max ${thresholds.maxStaleScriptReferences})`);
  }

  return {
    thinReexportCount: thinReexports.length,
    compatRootCounts,
    multiHopCompatChainCount: multiHopCompatChains.length,
    multiHopCompatChains,
    staleScriptReferences,
    thresholds,
    thresholdFailures,
  };
}

function printHumanReport(report) {
  console.log(`Thin re-exports: ${report.thinReexportCount}`);
  for (const [compatRoot, count] of Object.entries(report.compatRootCounts)) {
    console.log(`- ${compatRoot}: ${count}`);
  }
  console.log(`Multi-hop compat chains: ${report.multiHopCompatChainCount}`);
  if (report.multiHopCompatChains.length > 0) {
    report.multiHopCompatChains.slice(0, 10).forEach((chain) => {
      console.log(`- ${chain.hops.join(' -> ')}`);
    });
  }
  console.log(`Stale script references: ${report.staleScriptReferences.length}`);
  report.staleScriptReferences.forEach((entry) => {
    console.log(`- ${entry.source}: ${entry.reference}`);
  });
  console.log(`Threshold failures: ${report.thresholdFailures.length}`);
  report.thresholdFailures.forEach((failure) => {
    console.log(`- ${failure}`);
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const report = buildStructuralAuditReport(process.cwd());
  const asJson = process.argv.includes('--json');
  const strict = process.argv.includes('--strict');

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printHumanReport(report);
  }

  if (strict && report.thresholdFailures.length > 0) {
    process.exitCode = 1;
  }
}
