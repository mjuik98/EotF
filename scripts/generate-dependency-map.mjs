import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const POLICY_PATH = path.join(ROOT, 'config', 'architecture_policy.json');
const OUT_JSON = path.join(ROOT, 'artifacts', 'dependency_map.json');
const OUT_MD = path.join(ROOT, 'artifacts', 'dependency_map.md');

function toPosix(p) {
  return p.split(path.sep).join('/');
}

async function readPolicy() {
  const raw = await fs.readFile(POLICY_PATH, 'utf8');
  return JSON.parse(raw);
}

async function collectFiles(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await collectFiles(full)));
      continue;
    }
    if (entry.isFile() && full.endsWith('.js')) out.push(full);
  }
  return out;
}

function getLayer(fileRel, layerMatchers) {
  for (const matcher of layerMatchers) {
    if (fileRel.startsWith(matcher.prefix)) return matcher.layer;
  }
  return 'other';
}

function resolveImport(fileAbs, spec) {
  if (!spec.startsWith('.')) return null;
  const resolved = path.resolve(path.dirname(fileAbs), spec);
  const withExt = path.extname(resolved) ? resolved : `${resolved}.js`;
  return toPosix(path.relative(ROOT, withExt));
}

function sortObj(input) {
  return Object.fromEntries(Object.entries(input).sort(([a], [b]) => a.localeCompare(b)));
}

async function computeGraph() {
  const policy = await readPolicy();
  const scanDirs = policy.scanDirs || ['game'];
  const layerMatchers = policy.layerMatchers || [];
  const files = [];

  for (const relDir of scanDirs) {
    files.push(...(await collectFiles(path.join(ROOT, relDir))));
  }

  const graph = {};
  const inDegree = {};
  const layerEdges = {};

  for (const fileAbs of files) {
    const fileRel = toPosix(path.relative(ROOT, fileAbs));
    const sourceLayer = getLayer(fileRel, layerMatchers);
    const source = await fs.readFile(fileAbs, 'utf8');
    const importRegex = /^\s*import\s+[^'"]*['"]([^'"]+)['"]/gm;

    const deps = new Set();
    let match;
    while ((match = importRegex.exec(source)) !== null) {
      const targetRel = resolveImport(fileAbs, match[1]);
      if (!targetRel) continue;
      deps.add(targetRel);

      inDegree[targetRel] = (inDegree[targetRel] || 0) + 1;

      const targetLayer = getLayer(targetRel, layerMatchers);
      const pair = `${sourceLayer}->${targetLayer}`;
      layerEdges[pair] = (layerEdges[pair] || 0) + 1;
    }

    graph[fileRel] = [...deps].sort();
    if (!(fileRel in inDegree)) inDegree[fileRel] = 0;
  }

  const sortedGraph = sortObj(graph);
  const nodes = Object.keys(sortedGraph).map((file) => ({
    file,
    layer: getLayer(file, layerMatchers),
    outDegree: sortedGraph[file].length,
    inDegree: inDegree[file] || 0,
  }));

  const hottestByOut = [...nodes].sort((a, b) => b.outDegree - a.outDegree).slice(0, 15);
  const hottestByIn = [...nodes].sort((a, b) => b.inDegree - a.inDegree).slice(0, 15);

  return {
    nodeCount: nodes.length,
    edgeCount: Object.values(sortedGraph).reduce((sum, deps) => sum + deps.length, 0),
    layerEdges: sortObj(layerEdges),
    hottestByOut,
    hottestByIn,
    graph: sortedGraph,
  };
}

function withGeneratedAt(report, generatedAt = new Date().toISOString()) {
  return {
    ...report,
    generatedAt,
  };
}

function toMarkdown(report) {
  const lines = [];
  lines.push('# Dependency Map');
  lines.push('');
  lines.push(`- Generated: ${report.generatedAt}`);
  lines.push(`- Nodes: ${report.nodeCount}`);
  lines.push(`- Edges: ${report.edgeCount}`);
  lines.push('');
  lines.push('## Layer Edges');
  lines.push('');
  lines.push('| Edge | Count |');
  lines.push('|---|---:|');
  for (const [edge, count] of Object.entries(report.layerEdges)) {
    lines.push(`| ${edge} | ${count} |`);
  }
  lines.push('');
  lines.push('## Top Outgoing Dependencies');
  lines.push('');
  lines.push('| File | Out Degree |');
  lines.push('|---|---:|');
  for (const node of report.hottestByOut) {
    lines.push(`| ${node.file} | ${node.outDegree} |`);
  }
  lines.push('');
  lines.push('## Top Incoming Dependencies');
  lines.push('');
  lines.push('| File | In Degree |');
  lines.push('|---|---:|');
  for (const node of report.hottestByIn) {
    lines.push(`| ${node.file} | ${node.inDegree} |`);
  }
  lines.push('');
  lines.push('> Full graph is available in `artifacts/dependency_map.json`.');
  lines.push('');
  return lines.join('\n');
}

async function main() {
  const shouldCheck = process.argv.includes('--check');
  const computed = await computeGraph();

  if (shouldCheck) {
    let currentJson;
    let currentMd;
    try {
      currentJson = await fs.readFile(OUT_JSON, 'utf8');
      currentMd = await fs.readFile(OUT_MD, 'utf8');
    } catch {
      console.error('Dependency map artifacts are missing. Run: npm run deps:map');
      process.exit(1);
    }

    const currentReport = JSON.parse(currentJson);
    const expected = withGeneratedAt(computed, currentReport.generatedAt);
    const expectedJson = `${JSON.stringify(expected, null, 2)}\n`;
    const expectedMd = `${toMarkdown(expected)}\n`;
    const staleFiles = [];
    if (currentJson !== expectedJson) staleFiles.push('artifacts/dependency_map.json');
    if (currentMd !== expectedMd) staleFiles.push('artifacts/dependency_map.md');

    if (staleFiles.length > 0) {
      console.error('Dependency map artifacts are out of date:');
      staleFiles.forEach((file) => console.error(`- ${file}`));
      console.error('Run: npm run deps:map');
      process.exit(1);
    }

    console.log(`Dependency map check passed (${expected.nodeCount} nodes, ${expected.edgeCount} edges).`);
    return;
  }

  const report = withGeneratedAt(computed);
  await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
  await fs.writeFile(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await fs.writeFile(OUT_MD, `${toMarkdown(report)}\n`, 'utf8');
  console.log(`Dependency map generated (${report.nodeCount} nodes, ${report.edgeCount} edges).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
