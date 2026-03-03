import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const IMAGE_DIR = path.join(ROOT, 'assets', 'images');
const OUT_FILE = path.join(IMAGE_DIR, 'manifest.json');

async function main() {
  const entries = await fs.readdir(IMAGE_DIR, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name !== 'manifest.json')
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const payload = {
    generatedAt: new Date().toISOString(),
    count: files.length,
    files,
  };

  await fs.writeFile(OUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Asset manifest written (${files.length} files).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
