import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const ROOT = process.cwd();
const DEFAULT_HEAD_FILE = path.join(ROOT, 'artifacts', 'dependency_map.json');

function parseArgs(argv) {
  const out = {
    baseSha: '',
    headFile: DEFAULT_HEAD_FILE,
    output: path.join(ROOT, '.github', 'depmap-summary.md'),
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--base-sha' && next) {
      out.baseSha = next;
      i += 1;
      continue;
    }
    if (arg === '--head-file' && next) {
      out.headFile = path.isAbsolute(next) ? next : path.join(ROOT, next);
      i += 1;
      continue;
    }
    if (arg === '--output' && next) {
      out.output = path.isAbsolute(next) ? next : path.join(ROOT, next);
      i += 1;
    }
  }

  if (!out.baseSha) {
    throw new Error('Missing required argument: --base-sha');
  }
  return out;
}

function asObject(value) {
  return value && typeof value === 'object' ? value : {};
}

function asGraph(value) {
  const graph = asObject(value);
  return Object.fromEntries(
    Object.entries(graph).map(([key, deps]) => [
      key,
      Array.isArray(deps) ? deps.filter((x) => typeof x === 'string') : [],
    ]),
  );
}

function toEdgeSet(graph) {
  const out = new Set();
  for (const [source, deps] of Object.entries(graph)) {
    for (const target of deps) {
      out.add(`${source} -> ${target}`);
    }
  }
  return out;
}

function diffSorted(baseSet, headSet) {
  const added = [];
  const removed = [];

  for (const entry of headSet) {
    if (!baseSet.has(entry)) added.push(entry);
  }
  for (const entry of baseSet) {
    if (!headSet.has(entry)) removed.push(entry);
  }

  added.sort((a, b) => a.localeCompare(b));
  removed.sort((a, b) => a.localeCompare(b));
  return { added, removed };
}

function fmtDelta(value) {
  if (value > 0) return `+${value}`;
  return String(value);
}

function topLayerDelta(baseLayerEdges, headLayerEdges, limit = 10) {
  const allKeys = new Set([
    ...Object.keys(baseLayerEdges || {}),
    ...Object.keys(headLayerEdges || {}),
  ]);

  return [...allKeys]
    .map((key) => {
      const base = Number(baseLayerEdges?.[key] || 0);
      const head = Number(headLayerEdges?.[key] || 0);
      return { edge: key, delta: head - base, base, head };
    })
    .filter((row) => row.delta !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta) || a.edge.localeCompare(b.edge))
    .slice(0, limit);
}

function clipList(values, limit = 8) {
  return values.slice(0, limit);
}

function listLines(values, noneLabel = '- (none)') {
  if (!values.length) return [noneLabel];
  return values.map((value) => `- \`${value}\``);
}

function buildSummary(baseMap, headMap, baseSha) {
  const baseGraph = asGraph(baseMap.graph);
  const headGraph = asGraph(headMap.graph);

  const baseNodes = new Set(Object.keys(baseGraph));
  const headNodes = new Set(Object.keys(headGraph));
  const nodeDiff = diffSorted(baseNodes, headNodes);

  const edgeDiff = diffSorted(toEdgeSet(baseGraph), toEdgeSet(headGraph));
  const layerDiff = topLayerDelta(baseMap.layerEdges, headMap.layerEdges);

  const baseNodeCount = Number(baseMap.nodeCount || 0);
  const headNodeCount = Number(headMap.nodeCount || 0);
  const baseEdgeCount = Number(baseMap.edgeCount || 0);
  const headEdgeCount = Number(headMap.edgeCount || 0);

  const lines = [];
  lines.push('<!-- dependency-map-summary -->');
  lines.push('## Dependency Map Diff');
  lines.push('');
  lines.push(`- Base: \`${baseSha.slice(0, 12)}\``);
  lines.push(`- Nodes: \`${headNodeCount}\` (${fmtDelta(headNodeCount - baseNodeCount)} from \`${baseNodeCount}\`)`);
  lines.push(`- Edges: \`${headEdgeCount}\` (${fmtDelta(headEdgeCount - baseEdgeCount)} from \`${baseEdgeCount}\`)`);
  lines.push(`- Added imports: \`${edgeDiff.added.length}\``);
  lines.push(`- Removed imports: \`${edgeDiff.removed.length}\``);
  lines.push('');

  lines.push('### Layer Edge Deltas');
  lines.push('');
  if (!layerDiff.length) {
    lines.push('- (no layer edge changes)');
  } else {
    lines.push('| Edge | Base | Head | Delta |');
    lines.push('|---|---:|---:|---:|');
    for (const row of layerDiff) {
      lines.push(`| ${row.edge} | ${row.base} | ${row.head} | ${fmtDelta(row.delta)} |`);
    }
  }
  lines.push('');

  lines.push('### Added Nodes');
  lines.push(...listLines(clipList(nodeDiff.added)));
  lines.push('');

  lines.push('### Removed Nodes');
  lines.push(...listLines(clipList(nodeDiff.removed)));
  lines.push('');

  lines.push('### Added Imports (sample)');
  lines.push(...listLines(clipList(edgeDiff.added)));
  lines.push('');

  lines.push('### Removed Imports (sample)');
  lines.push(...listLines(clipList(edgeDiff.removed)));
  lines.push('');

  lines.push('> Source: `artifacts/dependency_map.json`');
  lines.push('');
  return lines.join('\n');
}

async function readJsonFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function readBaseMap(baseSha) {
  try {
    const { stdout } = await execFileAsync('git', [
      'show',
      `${baseSha}:artifacts/dependency_map.json`,
    ]);
    return JSON.parse(stdout);
  } catch {
    return { nodeCount: 0, edgeCount: 0, layerEdges: {}, graph: {} };
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const headMap = await readJsonFile(args.headFile);
  const baseMap = await readBaseMap(args.baseSha);
  const summary = buildSummary(baseMap, headMap, args.baseSha);

  await fs.mkdir(path.dirname(args.output), { recursive: true });
  await fs.writeFile(args.output, `${summary}\n`, 'utf8');
  console.log(`Dependency map summary written: ${path.relative(ROOT, args.output)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
