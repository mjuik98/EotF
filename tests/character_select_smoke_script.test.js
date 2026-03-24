import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('character select smoke script', () => {
  it('self-hosts the built dist before launching Playwright', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'character_select_smoke_check.mjs'),
      'utf8',
    );

    expect(source).toContain("from 'node:http'");
    expect(source).toContain('createServer(');
    expect(source).toContain('server.listen(0,');
    expect(source).toContain('await new Promise((resolve, reject) => {');
    expect(source).toContain('await fs.cp(distDir, snapshotDir, { recursive: true })');
    expect(source).toContain("createDistServer(snapshotDir)");
    expect(source).toContain("await fs.rm(snapshotDir, { recursive: true, force: true })");
    expect(source).toContain('server.close((error) => {');
  });

  it('waits for the mounted character-select UI before capturing the screenshot', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'character_select_smoke_check.mjs'),
      'utf8',
    );

    expect(source).toContain("page.waitForSelector('#charStage'");
    expect(source).toContain('page.waitForFunction(() => {');
    expect(source).toContain("document.fonts?.ready");
    expect(source).toContain("page.screenshot({ path: path.join(outDir, 'shot.png') })");
  });
});
