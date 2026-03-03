import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const ROOT = process.cwd();
const DEFAULT_HEAD_FILE = path.join(ROOT, 'docs', 'metrics', 'dependency_map.json');
const DEFAULT_THRESHOLDS_FILE = path.join(ROOT, 'docs', 'metrics', 'dependency_delta_thresholds.json');

function parseArgs(argv) {
  const out = {
    baseSha: process.env.DEP_MAP_BASE_SHA || '',
    headFile: DEFAULT_HEAD_FILE,
    thresholdsFile: DEFAULT_THRESHOLDS_FILE,
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
    if (arg === '--thresholds' && next) {
      out.thresholdsFile = path.isAbsolute(next) ? next : path.join(ROOT, next);
      i += 1;
    }
  }

  return out;
}

function asObject(value) {
  return value && typeof value === 'object' ? value : {};
}

function asGraph(value) {
  const graph = asObject(value);
  return Object.fromEntries(
    Object.entries(graph).map(([source, deps]) => [
      source,
      Array.isArray(deps) ? deps.filter((v) => typeof v === 'string') : [],
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

function countAdded(baseSet, headSet) {
  let added = 0;
  for (const value of headSet) {
    if (!baseSet.has(value)) added += 1;
  }
  return added;
}

function layerDelta(baseLayerEdges, headLayerEdges, key) {
  const base = Number(baseLayerEdges?.[key] || 0);
  const head = Number(headLayerEdges?.[key] || 0);
  return head - base;
}

function buildDefaultThresholds() {
  return {
    maxNodeDelta: 30,
    maxEdgeDelta: 100,
    maxAddedImports: 120,
    defaultMaxLayerDelta: 20,
    maxLayerDeltaByEdge: {
      'core->ui': 12,
      'ui->core': 12,
      'combat->core': 12,
    },
  };
}

async function readThresholds(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return { ...buildDefaultThresholds(), ...parsed };
  } catch {
    return buildDefaultThresholds();
  }
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function readBaseMap(baseSha) {
  if (!baseSha) {
    return null;
  }

  try {
    const { stdout } = await execFileAsync('git', ['show', `${baseSha}:docs/metrics/dependency_map.json`]);
    return JSON.parse(stdout);
  } catch {
    return null;
  }
}

function evaluateThresholds(baseMap, headMap, thresholds) {
  const failures = [];

  const nodeDelta = Number(headMap.nodeCount || 0) - Number(baseMap.nodeCount || 0);
  const edgeDelta = Number(headMap.edgeCount || 0) - Number(baseMap.edgeCount || 0);

  const baseGraph = asGraph(baseMap.graph);
  const headGraph = asGraph(headMap.graph);
  const addedImports = countAdded(toEdgeSet(baseGraph), toEdgeSet(headGraph));

  if (nodeDelta > Number(thresholds.maxNodeDelta)) {
    failures.push(`node delta ${nodeDelta} exceeds max ${thresholds.maxNodeDelta}`);
  }
  if (edgeDelta > Number(thresholds.maxEdgeDelta)) {
    failures.push(`edge delta ${edgeDelta} exceeds max ${thresholds.maxEdgeDelta}`);
  }
  if (addedImports > Number(thresholds.maxAddedImports)) {
    failures.push(`added imports ${addedImports} exceeds max ${thresholds.maxAddedImports}`);
  }

  const explicitLayerCaps = asObject(thresholds.maxLayerDeltaByEdge);
  const allLayerKeys = new Set([
    ...Object.keys(asObject(baseMap.layerEdges)),
    ...Object.keys(asObject(headMap.layerEdges)),
    ...Object.keys(explicitLayerCaps),
  ]);

  for (const key of allLayerKeys) {
    const delta = layerDelta(baseMap.layerEdges, headMap.layerEdges, key);
    const explicitCap = Number(explicitLayerCaps[key]);
    const defaultCap = Number(thresholds.defaultMaxLayerDelta);
    const cap = Number.isFinite(explicitCap)
      ? explicitCap
      : (Number.isFinite(defaultCap) ? defaultCap : null);

    if (cap !== null && delta > cap) {
      failures.push(`layer ${key} delta ${delta} exceeds max ${cap}`);
    }
  }

  return {
    nodeDelta,
    edgeDelta,
    addedImports,
    failures,
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const thresholds = await readThresholds(args.thresholdsFile);
  const headMap = await readJson(args.headFile);

  const fallbackBaseSha = (await execFileAsync('git', ['rev-parse', 'HEAD~1']).catch(() => ({ stdout: '' }))).stdout.trim();
  const baseSha = args.baseSha || fallbackBaseSha;
  const baseMap = await readBaseMap(baseSha);

  if (!baseMap) {
    console.log('Dependency threshold check skipped (base dependency map not found).');
    return;
  }

  const result = evaluateThresholds(baseMap, headMap, thresholds);
  if (result.failures.length > 0) {
    console.error('Dependency delta threshold check failed:');
    for (const line of result.failures) console.error(`- ${line}`);
    process.exit(1);
  }

  console.log(
    `Dependency delta threshold check passed (node delta ${result.nodeDelta}, edge delta ${result.edgeDelta}, added imports ${result.addedImports}).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
