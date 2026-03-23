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
    expect(source).toContain('slotAriaLabel');
    expect(source).toContain('panelOpen');
    expect(source).toContain('panelText');
    expect(source).toContain('typeof window.updateUI === \'function\'');
    expect(source).toContain('mobileRelicRailVisible');
    expect(source).toContain('mobileRelicRailWithinViewport');
    expect(source).toContain('page.waitForFunction');
  });

  it('covers the unified hand hover preview with a docked keyword panel', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'smoke_combat_ui.mjs'),
      'utf8',
    );

    expect(source).toContain("gs.player.hand = ['strike', 'resonance', 'heavy_blow', 'defend']");
    expect(source).toContain("page.hover('#combatHandCards .card:nth-child(2)')");
    expect(source).toContain("page.hover('#handCardCloneLayer .card-hover-mechanic-trigger')");
    expect(source).toContain("page.focus('#handCardCloneLayer .card-hover-mechanic-trigger')");
    expect(source).toContain('card-clone-keyword-panel');
    expect(source).toContain('card-hover-mechanic-trigger');
    expect(source).toContain('card-clone-keyword-body-title');
    expect(source).toContain('card-clone-keyword-body-content');
    expect(source).toContain('hoverKeywordPanelOpen');
    expect(source).toContain('hoverKeywordPlacement');
    expect(source).toContain('hoverKeywordTitle');
    expect(source).toContain('hoverKeywordText');
    expect(source).toContain("hoverResult.hoverKeywordTitle === '잔향'");
    expect(source).toContain('hoverResult.hoverKeywordPanelOpen');
    expect(source).toContain('!hoverResult.tooltipVisible');
  });

  it('keeps the resonance badge visible after playing an attack card in the browser smoke runner', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'smoke_combat_ui.mjs'),
      'utf8',
    );

    expect(source).toContain('prepareResonanceScenario');
    expect(source).toContain("gs.player.class = 'swordsman'");
    expect(source).toContain("resonance: { stacks: 99, dmgBonus: 2 }");
    expect(source).toContain("page.click('#combatHandCards .card[data-card-id=\"strike\"]')");
    expect(source).toContain('resonanceAfterAttackResult');
    expect(source).toContain('resonanceBadgeVisible');
    expect(source).toContain('resonanceBadgeText');
    expect(source).toContain("resonanceBadgeText?.includes('공명')");
    expect(source).toContain('resonanceSnapshotText');
    expect(source).toContain("resonanceSnapshotText?.includes('\"buffKeys\":[\"resonance\"]')");
  });

  it('covers echo kill combat-end handoff in the browser smoke runner', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'smoke_combat_ui.mjs'),
      'utf8',
    );

    expect(source).toContain('echoKillResult');
    expect(source).toContain("document.getElementById('rewardScreen')");
    expect(source).toContain("document.querySelector('#combatOverlay.active')");
    expect(source).toContain("page.click('#useEchoSkillBtn')");
    expect(source).toContain('rewardScreenActive');
    expect(source).toContain('enemyCountAfterEcho');
    expect(source).toContain('combatOverlayClosed');
  });

  it('drives the combat smoke through the real run entry and return flow', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'smoke_combat_ui.mjs'),
      'utf8',
    );

    expect(source).toContain("page.click('#mainStartBtn')");
    expect(source).toContain("page.waitForSelector('#btnCfm'");
    expect(source).toContain("page.waitForSelector('#btnRealStart'");
    expect(source).toContain("page.waitForSelector('#storyContinueBtn'");
    expect(source).toContain("page.waitForSelector('.node-card'");
    expect(source).toContain("page.click('#rewardSkipInitBtn')");
    expect(source).toContain("page.click('#rewardSkipConfirmBtn')");
    expect(source).toContain('returnFlowResult');
    expect(source).toContain('rewardScreenClosed');
    expect(source).toContain('nodeCardsVisible');
  });

  it('captures named visual snapshots for combat layout regression states', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'smoke_combat_ui.mjs'),
      'utf8',
    );

    expect(source).toContain("'combat-ui-real-entry'");
    expect(source).toContain("'combat-ui-stacked-toasts'");
    expect(source).toContain("'combat-ui-hover-card'");
    expect(source).toContain("'combat-ui-resonance-after-attack'");
    expect(source).toContain("'combat-ui-log-right-rail'");
    expect(source).toContain("'combat-ui-echo-finish'");
    expect(source).toContain("'combat-ui-return-map'");
    expect(source).toContain('visualSnapshots');
    expect(source).toContain('actionFeedResult');
  });

  it('covers stacked toast rendering and duplicate merge behavior in the smoke runner', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'smoke_combat_ui.mjs'),
      'utf8',
    );

    expect(source).toContain("window.showCombatSummary");
    expect(source).toContain("typeof window.showItemToast !== 'function'");
    expect(source).toContain("window.showItemToast(smokeItem");
    expect(source).toContain('stackedToastResult');
    expect(source).toContain("document.querySelectorAll('.stack-toast')");
    expect(source).toContain("itemToast?.querySelector('.stack-toast-count')");
    expect(source).toContain("stackedToastResult.toastCount >= 2");
    expect(source).toContain("stackedToastResult.itemCountBadge === 'x2'");
  });
});
