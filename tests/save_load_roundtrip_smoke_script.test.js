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

    expect(source).toContain("from './browser_smoke_flow_helpers.mjs'");
    expect(source).toContain('enterRunFlow(page)');
    expect(source).toContain("from './help_pause_smoke_helpers.mjs'");
    expect(source).toContain('ensurePauseMenuVisible(page)');
    expect(source).toContain("page.getByRole('button', { name: '타이틀로 돌아가기' })");
    expect(source).toContain("page.locator('#returnTitleConfirm button', { hasText: '타이틀로 이동' })");
    expect(source).toContain("path.join(outDir, 'return-title-confirm.png')");
    expect(source).toContain('captureOverlayFrameState');
    expect(source).toContain('returnTitleFrame');
    expect(source).toContain('returnTitleUsesSharedFrame');
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
    expect(source).toContain("page.waitForSelector('#titleArchiveSummary'");
    expect(source).toContain("page.click('#titleArchiveToggleBtn')");
    expect(source).toContain("page.click('#mainRunRulesBtn')");
    expect(source).toContain('runAccessLabel');
    expect(source).toContain('sessionExitLabel');
    expect(source).toContain('sessionExitMeta');
    expect(source).toContain("path.join(outDir, 'title-meta.png')");
    expect(source).toContain("path.join(outDir, 'title-meta-expanded.png')");
    expect(source).toContain("path.join(outDir, 'run-settings.png')");
    expect(source).toContain("path.join(outDir, 'result.json')");
  });
});
