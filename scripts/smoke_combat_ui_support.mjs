import fs from 'node:fs';
import path from 'node:path';

export const visualSnapshots = [
  'combat-ui-real-entry',
  'combat-ui-stacked-toasts',
  'combat-ui-hover-card',
  'combat-ui-resonance-after-attack',
  'combat-ui-log-right-rail',
  'combat-ui-echo-finish',
  'combat-ui-return-map',
];

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export async function writeSnapshot(page, outDir, name) {
  const text = await page.evaluate(() => {
    if (typeof window.render_game_to_text === 'function') {
      return window.render_game_to_text();
    }
    return null;
  });

  await page.screenshot({
    path: path.join(outDir, `${name}.png`),
    fullPage: true,
  });

  if (text) {
    fs.writeFileSync(path.join(outDir, `${name}.json`), text);
  }

  return text;
}

export function assertCondition(condition, message) {
  if (!condition) throw new Error(message);
}
