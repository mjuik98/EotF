import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('save load roundtrip smoke script', () => {
  it('self-hosts the built dist before launching Playwright', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'save_load_roundtrip_smoke_check.mjs'),
      'utf8',
    );

    expect(source).toContain("from 'node:http'");
    expect(source).toContain('createServer(');
    expect(source).toContain('server.listen(0,');
    expect(source).toContain('server.close((error) => {');
  });

  it('covers the save to title to continue roundtrip and asserts the restored state', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'save_load_roundtrip_smoke_check.mjs'),
      'utf8',
    );

    expect(source).toContain("page.click('#mainStartBtn')");
    expect(source).toContain("page.waitForSelector('#btnRealStart'");
    expect(source).toContain("page.waitForSelector('#storyContinueBtn'");
    expect(source).toContain("page.waitForSelector('#nodeCardOverlay'");
    expect(source).toContain("page.keyboard.press('Escape')");
    expect(source).toContain("page.getByRole('button', { name: '처음으로' })");
    expect(source).toContain("page.locator('#returnTitleConfirm button', { hasText: '처음으로' })");
    expect(source).toContain("localStorage.getItem('echo_fallen_save')");
    expect(source).toContain("document.getElementById('titleContinueWrap')?.style?.display === 'block'");
    expect(source).toContain("page.click('#mainContinueBtn')");
    expect(source).toContain("path.join(outDir, 'title.png')");
    expect(source).toContain("path.join(outDir, 'loaded.png')");
    expect(source).toContain("path.join(outDir, 'result.json')");
    expect(source).toContain("afterLoad.currentRegion !== beforeReturn.currentRegion");
    expect(source).toContain("afterLoad.playerClass !== beforeReturn.playerClass");
  });
});
