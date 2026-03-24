import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const FEATURES_ROOT = path.join(ROOT, 'game', 'features');
const CONFIG_PATH = path.join(ROOT, 'config', 'quality', 'feature_structure_targets.json');

function toPosix(value) {
  return value.split(path.sep).join('/');
}

async function readConfig() {
  const raw = await fs.readFile(CONFIG_PATH, 'utf8');
  return JSON.parse(raw);
}

async function collectFeatureDirs() {
  const entries = await fs.readdir(FEATURES_ROOT, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

async function inspectFeatureDir(featureName) {
  const featureDir = path.join(FEATURES_ROOT, featureName);
  const entries = await fs.readdir(featureDir, { withFileTypes: true });

  return {
    featureName,
    dirNames: entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort(),
    fileNames: entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .sort(),
  };
}

function isThinWrapperSource(source) {
  return /^\s*(?:export\s+(?:\*|\{[\s\S]*?\})\s+from\s+['"][^'"]+['"];?\s*)+$/.test(source);
}

async function collectThinWrapperJsFiles(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const jsFiles = [];

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      jsFiles.push(...(await collectThinWrapperJsFiles(entryPath)));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.js')) {
      jsFiles.push(entryPath);
    }
  }

  return jsFiles.sort();
}

async function main() {
  const config = await readConfig();
  const featureNames = await collectFeatureDirs();
  const canonicalDirs = new Set(config.canonicalTopLevelDirs || []);
  const requiredRootFiles = new Set(config.requiredRootFiles || ['public.js']);
  const allowedExtraDirsByFeature = config.allowedExtraDirsByFeature || {};
  const allowedExtraRootFilesByFeature = config.allowedExtraRootFilesByFeature || {};
  const thinWrapperDirsByFeature = config.thinWrapperDirsByFeature || {};
  const violations = [];

  for (const featureName of featureNames) {
    const { dirNames, fileNames } = await inspectFeatureDir(featureName);
    const allowedDirs = new Set([
      ...canonicalDirs,
      ...(allowedExtraDirsByFeature[featureName] || []),
    ]);
    const allowedRootFiles = new Set([
      ...requiredRootFiles,
      ...(allowedExtraRootFilesByFeature[featureName] || []),
    ]);

    for (const requiredFile of requiredRootFiles) {
      if (!fileNames.includes(requiredFile)) {
        violations.push(`game/features/${featureName}: missing required root file ${requiredFile}`);
      }
    }

    const unexpectedDirs = dirNames.filter((dirName) => !allowedDirs.has(dirName));
    if (unexpectedDirs.length > 0) {
      violations.push(
        `game/features/${featureName}: unexpected top-level dirs ${unexpectedDirs.join(', ')}`,
      );
    }

    const unexpectedFiles = fileNames.filter((fileName) => !allowedRootFiles.has(fileName));
    if (unexpectedFiles.length > 0) {
      violations.push(
        `game/features/${featureName}: unexpected root files ${unexpectedFiles.join(', ')}`,
      );
    }

    for (const dirName of thinWrapperDirsByFeature[featureName] || []) {
      const wrapperDir = path.join(FEATURES_ROOT, featureName, dirName);
      let jsFiles = [];
      try {
        jsFiles = await collectThinWrapperJsFiles(wrapperDir);
      } catch {
        violations.push(`game/features/${featureName}/${dirName}: missing configured thin-wrapper dir`);
        continue;
      }

      if (jsFiles.length === 0) {
        violations.push(`game/features/${featureName}/${dirName}: expected at least one thin-wrapper file`);
      }

      for (const filePath of jsFiles) {
        const source = await fs.readFile(filePath, 'utf8');
        if (!isThinWrapperSource(source)) {
          violations.push(
            `${toPosix(path.relative(ROOT, filePath))}: expected thin re-export wrapper`,
          );
        }
      }
    }
  }

  if (violations.length > 0) {
    console.error('Feature structure check failed:');
    for (const violation of violations) {
      console.error(`- ${violation}`);
    }
    process.exit(1);
  }

  console.log(
    `Feature structure check passed (${featureNames.length} features, config ${toPosix(path.relative(ROOT, CONFIG_PATH))}).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
