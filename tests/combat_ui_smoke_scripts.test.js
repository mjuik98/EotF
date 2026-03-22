import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('combat ui smoke scripts', () => {
  it('registers the combat UI smoke wrapper in package scripts', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'),
    );

    expect(packageJson.scripts['smoke:combat-ui']).toBe('node scripts/run_combat_ui_smoke.mjs');
  });

  it('points the combat UI smoke wrapper at the browser smoke runner', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'run_combat_ui_smoke.mjs'),
      'utf8',
    );

    expect(source).toContain("path.join(process.cwd(), 'scripts', 'smoke_combat_ui.mjs')");
    expect(source).toContain("path.join('output', 'web-game', 'refactor-smoke-combat-ui')");
  });

  it('checks the localized card rarity tag in the browser smoke runner', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'smoke_combat_ui.mjs'),
      'utf8',
    );

    expect(source).toContain("querySelector('.card-rarity-tag')");
    expect(source).toContain("result.firstCardRarityText === '일반'");
  });

  it('wires the combat UI smoke run into the quality gate workflow', () => {
    const workflow = fs.readFileSync(
      path.join(process.cwd(), '.github', 'workflows', 'quality-gate.yml'),
      'utf8',
    );

    expect(workflow).toContain('npx playwright install --with-deps chromium');
    expect(workflow).toContain('npm run smoke:combat-ui');
  });

  it('covers combat relic rail behavior in the browser smoke runner', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'smoke_combat_ui.mjs'),
      'utf8',
    );

    expect(source).toContain("gs.player.items = ['serpent_fang_dagger']");
    expect(source).toContain('combatRelicRail');
    expect(source).toContain('combatRelicRailCountText');
    expect(source).toContain('combatRelicPanel');
    expect(source).toContain('combatRelicPanelOpen === false');
    expect(source).toContain("page.hover('#combatRelicRailSlots button')");
    expect(source).toContain('relicTooltipResult');
    expect(source).toContain('slotTitle');
    expect(source).toContain('panelOpen');
    expect(source).toContain('panelText');
    expect(source).toContain('typeof window.updateUI === \'function\'');
    expect(source).toContain('mobileRelicRailVisible');
    expect(source).toContain('mobileRelicRailWithinViewport');
    expect(source).toContain('page.waitForFunction');
  });
});
