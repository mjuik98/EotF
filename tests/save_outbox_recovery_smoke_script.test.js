import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('save outbox recovery smoke script', () => {
  it('covers queued-only save recovery from the persisted outbox on boot', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'save_outbox_recovery_smoke_check.mjs'),
      'utf8',
    );

    expect(source).toContain("from './browser_smoke_support.mjs'");
    expect(source).toContain('resolveSmokeAppUrl');
    expect(source).toContain('closeStaticAssetServer');
    expect(source).toContain('runSmokeBrowserSession');
    expect(source).toContain("localStorage.setItem('echo_fallen_outbox'");
    expect(source).toContain("localStorage.getItem('echo_fallen_save')");
    expect(source).toContain("page.waitForSelector('#mainContinueBtn'");
    expect(source).toContain("page.click('#mainContinueBtn')");
    expect(source).toContain("path.join(outDir, 'outbox-title.png')");
    expect(source).toContain("path.join(outDir, 'outbox-loaded.png')");
    expect(source).toContain("path.join(outDir, 'outbox-result.json')");
  });
});
