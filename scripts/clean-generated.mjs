import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const includeSmoke = args.has('--smoke');

const fixedTargets = ['dist', 'coverage', 'tmp'];
if (includeSmoke) {
  fixedTargets.push(path.join('output', 'web-game'));
}

function exists(targetPath) {
  return fs.existsSync(path.join(root, targetPath));
}

function listRootTargets() {
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('outputweb-'))
    .map((entry) => entry.name);
}

function removeTarget(targetPath) {
  const absolutePath = path.join(root, targetPath);
  if (!fs.existsSync(absolutePath)) return false;
  if (!dryRun) {
    fs.rmSync(absolutePath, { recursive: true, force: true });
  }
  return true;
}

const dynamicTargets = listRootTargets();
const targets = [...fixedTargets.filter(exists), ...dynamicTargets];

if (targets.length === 0) {
  console.log('No generated targets found.');
  process.exit(0);
}

console.log(`${dryRun ? 'Would remove' : 'Removing'} generated targets:`);
for (const target of targets) {
  removeTarget(target);
  console.log(`- ${target}`);
}
