import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const COMPAT_ROOTS = ['game/ui', 'game/app', 'game/combat'];
const DOC_ROOTS = ['docs', 'README.md', 'progress.md'];
const SCRIPT_REF_PATTERN = /scripts\/[A-Za-z0-9_./-]+\.(?:mjs|js)/g;
const THIN_REEXPORT_PATTERN = /^(?:export\s+(?:\*|\{[\s\S]*?\})\s+from\s+['"][^'"]+['"];\s*)+$/;

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

  const compatRootCounts = Object.fromEntries(
    COMPAT_ROOTS.map((compatRoot) => [
      compatRoot,
      thinReexports.filter((entry) => entry.relativeFile.startsWith(`${compatRoot}/`)).length,
    ]),
  );

  return {
    thinReexportCount: thinReexports.length,
    compatRootCounts,
    multiHopCompatChainCount: multiHopCompatChains.length,
    multiHopCompatChains,
    staleScriptReferences,
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

  if (strict && report.staleScriptReferences.length > 0) {
    process.exitCode = 1;
  }
}
