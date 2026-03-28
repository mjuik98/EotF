import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('save load roundtrip smoke script', () => {
  it('self-hosts the built dist before launching Playwright', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'save_load_roundtrip_smoke_check.mjs'),
      'utf8',
    );

    expect(source).toContain("from './browser_smoke_support.mjs'");
    expect(source).toContain('resolveSmokeAppUrl');
    expect(source).toContain('closeStaticAssetServer');
    expect(source).toContain('runSmokeBrowserSession');
    expect(source).not.toContain('.dist-snapshot-');
    expect(source).not.toContain('fs.cp(distDir');
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
    expect(source).toContain("from './help_pause_smoke_helpers.mjs'");
    expect(source).toContain('ensurePauseMenuVisible(page)');
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

  it('includes a title meta smoke that captures archive and run settings screenshots', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'title_meta_smoke_check.mjs'),
      'utf8',
    );

    expect(source).toContain("from './browser_smoke_support.mjs'");
    expect(source).toContain('resolveSmokeAppUrl');
    expect(source).toContain('runSmokeBrowserSession');
    expect(source).toContain("localStorage.setItem('echo_fallen_meta'");
    expect(source).toContain("page.waitForSelector('#titleRunArchive'");
    expect(source).toContain("page.click('#mainRunRulesBtn')");
    expect(source).toContain("path.join(outDir, 'title-meta.png')");
    expect(source).toContain("path.join(outDir, 'run-settings.png')");
    expect(source).toContain("path.join(outDir, 'result.json')");
  });
});
