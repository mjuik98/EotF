import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('map relic panel smoke script', () => {
  it('self-hosts the built dist before launching Playwright', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'map_relic_panel_smoke_check.mjs'),
      'utf8',
    );

    expect(source).toContain("from 'node:http'");
    expect(source).toContain('createServer(');
    expect(source).toContain('server.listen(0,');
    expect(source).toContain('server.close((error) => {');
  });

  it('drives the real run flow into the map relic panel and checks common-slot hover continuity', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'map_relic_panel_smoke_check.mjs'),
      'utf8',
    );

    expect(source).toContain("page.click('#mainStartBtn')");
    expect(source).toContain("page.waitForSelector('#btnRealStart'");
    expect(source).toContain("page.waitForSelector('#storyContinueBtn'");
    expect(source).toContain("page.waitForSelector('#ncRelicPanel'");
    expect(source).toContain(".querySelector('.nc-relic-slot.rarity-common')");
    expect(source).toContain("page.hover('.nc-relic-slot.rarity-common')");
    expect(source).toContain("document.getElementById('mapRelicDetailPanel')");
    expect(source).toContain('detailStaysOpenOnPanelHover');
    expect(source).toContain('detailClosesAfterLeavingPanel');
    expect(source).toContain("page.screenshot({ path: path.join(outDir, 'shot.png') })");
  });
});
