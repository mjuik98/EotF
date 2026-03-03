import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const IMAGE_DIR = path.join(ROOT, 'assets', 'images');
const MANIFEST_PATH = path.join(IMAGE_DIR, 'manifest.json');
const FALLBACKS_PATH = path.join(ROOT, 'data', 'image_fallbacks.js');

function asSortedSet(values) {
  return new Set([...values].sort((a, b) => a.localeCompare(b)));
}

function diffSets(left, right) {
  const out = [];
  for (const value of left) {
    if (!right.has(value)) out.push(value);
  }
  return out.sort((a, b) => a.localeCompare(b));
}

async function readDiskImages() {
  const entries = await fs.readdir(IMAGE_DIR, { withFileTypes: true });
  return asSortedSet(
    entries
      .filter((entry) => entry.isFile() && entry.name !== 'manifest.json')
      .map((entry) => entry.name),
  );
}

async function readManifestImages() {
  const raw = await fs.readFile(MANIFEST_PATH, 'utf8');
  const parsed = JSON.parse(raw);
  const files = Array.isArray(parsed.files) ? parsed.files.filter((v) => typeof v === 'string') : [];
  return asSortedSet(files);
}

async function readFallbacks() {
  const mod = await import(pathToFileURL(FALLBACKS_PATH).href);
  const fallbacks = mod.ImageFallbacks || {};
  return Object.fromEntries(
    Object.entries(fallbacks).filter(([, value]) => typeof value === 'string' && value.length > 0),
  );
}

async function main() {
  const disk = await readDiskImages();
  const manifest = await readManifestImages();
  const fallbacks = await readFallbacks();

  const missingInManifest = diffSets(disk, manifest);
  const missingOnDisk = diffSets(manifest, disk);

  const fallbackMissing = [];
  for (const [domain, fileName] of Object.entries(fallbacks)) {
    if (!disk.has(fileName)) {
      fallbackMissing.push(`${domain}: ${fileName}`);
    }
  }

  if (missingInManifest.length || missingOnDisk.length || fallbackMissing.length) {
    console.error('Asset manifest check failed:');
    if (missingInManifest.length) {
      console.error(`- Missing in manifest (${missingInManifest.length}): ${missingInManifest.join(', ')}`);
    }
    if (missingOnDisk.length) {
      console.error(`- Missing on disk (${missingOnDisk.length}): ${missingOnDisk.join(', ')}`);
    }
    if (fallbackMissing.length) {
      console.error(`- Missing fallback files (${fallbackMissing.length}): ${fallbackMissing.join(', ')}`);
    }
    console.error('Run: node scripts/generate-asset-manifest.mjs');
    process.exit(1);
  }

  console.log(`Asset manifest check passed (${disk.size} images).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
