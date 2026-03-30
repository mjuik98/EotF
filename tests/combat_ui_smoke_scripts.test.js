import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('combat ui smoke scripts', () => {
  it('registers the combat UI smoke wrapper in package scripts', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'),
    );

    expect(packageJson.scripts['smoke:combat-ui']).toBe('node scripts/run_combat_ui_smoke.mjs');
    expect(packageJson.scripts['smoke:help-pause-hotkeys']).toBe('node scripts/run_help_pause_hotkey_smoke.mjs');
    expect(packageJson.scripts['smoke:character-select']).toBe('node scripts/run_character_select_smoke.mjs');
    expect(packageJson.scripts['smoke:title-meta']).toBe('node scripts/title_meta_smoke_check.mjs');
    expect(packageJson.scripts['smoke:browser']).toBe('node scripts/run_browser_smoke_suite.mjs');
  });

  it('aggregates browser smoke checks through a single suite script', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'run_browser_smoke_suite.mjs'),
      'utf8',
    );

    expect(source).toContain("const smokeCommands = [");
    expect(source).toContain("'smoke:character-select'");
    expect(source).toContain("'smoke:reward'");
    expect(source).toContain("'smoke:combat-ui'");
    expect(source).toContain("'smoke:help-pause-hotkeys'");
    expect(source).toContain("'smoke:title-meta'");
    expect(source).toContain("'smoke:save-load'");
    expect(source).toContain("'smoke:save-outbox-recovery'");
    expect(source).toContain('formatSmokeSuiteSummary');
    expect(source).toContain('GITHUB_STEP_SUMMARY');
    expect(source).toContain('spawnSync');
    expect(source).toContain('SMOKE_DIST_DIR');
    expect(source).toContain('--reuse-dist');
    expect(source).toContain('vite.js');
  });

  it('points the combat UI smoke wrapper at the browser smoke runner', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'run_combat_ui_smoke.mjs'),
      'utf8',
    );

    expect(source).toContain("from './smoke_wrapper_support.mjs'");
    expect(source).toContain('runHostedSmokeWrapper');
    expect(source).toContain("scriptFile: 'smoke_combat_ui.mjs'");
    expect(source).toContain("outDirSegments: ['refactor-smoke-combat-ui']");
  });

  it('self-hosts the reward smoke wrapper before launching Playwright', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'run_reward_smoke.mjs'),
      'utf8',
    );

    expect(source).toContain("from './smoke_wrapper_support.mjs'");
    expect(source).toContain('runHostedSmokeWrapper');
    expect(source).toContain("scriptFile: 'smoke_deep_combat_reward.mjs'");
    expect(source).toContain("outDirSegments: ['refactor-smoke-reward-flow']");
  });

  it('self-hosts the help/pause hotkey smoke wrapper before launching Playwright', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'run_help_pause_hotkey_smoke.mjs'),
      'utf8',
    );

    expect(source).toContain("from './smoke_wrapper_support.mjs'");
    expect(source).toContain('runHostedSmokeWrapper');
    expect(source).toContain("scriptFile: 'help_pause_hotkey_smoke_check.mjs'");
    expect(source).toContain("outDirSegments: ['help-pause-hotkey-smoke']");
  });

  it('drives the reward smoke through the real combat-to-reward handoff', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'smoke_deep_combat_reward.mjs'),
      'utf8',
    );

    expect(source).toContain("from './browser_smoke_flow_helpers.mjs'");
    expect(source).toContain('enterRunFlow');
    expect(source).toContain('enterCombatFromRun');
    expect(source).toContain('advanceRuntimeTime');
    expect(source).toContain("page.click('#useEchoSkillBtn')");
    expect(source).toContain("document.getElementById('rewardScreen')");
    expect(source).toContain("document.querySelector('#combatOverlay.active')");
    expect(source).toContain('state-endcombat-timeout.json');
    expect(source).toContain("page.click('#rewardSkipInitBtn')");
    expect(source).toContain("page.click('#rewardSkipConfirmBtn')");
    expect(source).toContain('consoleErrors.length === 0');
    expect(source).toContain('Reward smoke captured console/page errors');
  });

  it('points the character-select smoke wrapper at the character-select smoke runner', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'run_character_select_smoke.mjs'),
      'utf8',
    );

    expect(source).toContain("from './smoke_wrapper_support.mjs'");
    expect(source).toContain('runForwardedSmokeWrapper');
    expect(source).toContain("scriptFile: 'character_select_smoke_check.mjs'");
    expect(source).toContain("outDirSegments: ['character-select-level-xp-smoke']");
  });

  it('checks the localized card rarity tag in the browser smoke runner', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'smoke_combat_ui.mjs'),
      'utf8',
    );

    expect(source).toContain("from './browser_smoke_flow_helpers.mjs'");
    expect(source).toContain('enterRunFlow');
    expect(source).toContain('enterCombatFromRun');
    expect(source).toContain("querySelector('.card-rarity-tag')");
    expect(source).toContain("result.firstCardRarityText === '일반'");
  });

  it('wires the combat UI smoke run into the quality gate workflow', () => {
    const workflow = fs.readFileSync(
      path.join(process.cwd(), '.github', 'workflows', 'quality-gate.yml'),
      'utf8',
    );

    expect(workflow).toContain('npx playwright install --with-deps chromium');
    expect(workflow).toContain('npm run smoke:browser');
  });

  it('wires the character-select smoke run into the local quality workflow', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'),
    );

    expect(packageJson.scripts.quality).toBe('npm run quality:full');
    expect(packageJson.scripts['quality:full']).toContain('npm run smoke:browser -- --reuse-dist');
  });

  it('lets browser smoke scripts override their output directories through the shared environment contract', () => {
    const characterSelectSource = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'character_select_smoke_check.mjs'),
      'utf8',
    );
    const titleMetaSource = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'title_meta_smoke_check.mjs'),
      'utf8',
    );
    const saveLoadSource = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'save_load_roundtrip_smoke_check.mjs'),
      'utf8',
    );
    const saveOutboxSource = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'save_outbox_recovery_smoke_check.mjs'),
      'utf8',
    );

    expect(characterSelectSource).toContain('process.env.SMOKE_OUT_DIR');
    expect(titleMetaSource).toContain('process.env.SMOKE_OUT_DIR');
    expect(saveLoadSource).toContain('process.env.SMOKE_OUT_DIR');
    expect(saveOutboxSource).toContain('process.env.SMOKE_OUT_DIR');
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
    expect(source).toContain("['compact', 'tight', 'stacked']");
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

    expect(source).toContain("enterRunFlow(page, { nodeReadySelector: '.node-card' })");
    expect(source).toContain('enterCombatFromRun(page)');
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
