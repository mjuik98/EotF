import fs from 'node:fs';
import path from 'node:path';

export const ROOT = process.cwd();

const readCache = new Map();
const jsonCache = new Map();
const existsCache = new Map();
const walkCache = new Map();

export function toPosix(value) {
  return String(value || '').split(path.sep).join('/');
}

export function readText(relPath) {
  if (!readCache.has(relPath)) {
    readCache.set(relPath, fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
  }
  return readCache.get(relPath);
}

export function readJson(relPath) {
  if (!jsonCache.has(relPath)) {
    jsonCache.set(relPath, JSON.parse(readText(relPath)));
  }
  return jsonCache.get(relPath);
}

export function pathExists(relPath) {
  if (!existsCache.has(relPath)) {
    existsCache.set(relPath, fs.existsSync(path.join(ROOT, relPath)));
  }
  return existsCache.get(relPath);
}

export function walkJsFiles(dirPath) {
  const resolvedDir = path.isAbsolute(dirPath) ? dirPath : path.join(ROOT, dirPath);
  if (walkCache.has(resolvedDir)) {
    return walkCache.get(resolvedDir);
  }

  const files = [];
  for (const entry of fs.readdirSync(resolvedDir, { withFileTypes: true })) {
    const fullPath = path.join(resolvedDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkJsFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  walkCache.set(resolvedDir, files);
  return files;
}
