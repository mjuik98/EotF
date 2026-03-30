import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('character select smoke script', () => {
  it('supports self-hosting a prebuilt smoke dist before launching Playwright', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'character_select_smoke_check.mjs'),
      'utf8',
    );

    expect(source).toContain("from './browser_smoke_support.mjs'");
    expect(source).toContain('process.env.SMOKE_DIST_DIR');
    expect(source).toContain('process.env.SMOKE_OUT_DIR');
    expect(source).toContain('resolveSmokeAppUrl');
    expect(source).toContain('closeStaticAssetServer');
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

  it('drives the title flow into a playable character-select state without console errors', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'character_select_smoke_check.mjs'),
      'utf8',
    );

    expect(source).toContain("page.click('#mainStartBtn')");
    expect(source).toContain("page.waitForSelector('#btnCfm'");
    expect(source).toContain("page.click('#btnCfm')");
    expect(source).toContain("page.click('#btnRealStart')");
    expect(source).toContain("page.locator('#storyContinueBtn')");
    expect(source).toContain("page.waitForSelector('#gameScreen.active'");
    expect(source).toContain("page.waitForSelector('#gameCanvas'");
    expect(source).toContain("page.waitForSelector('.node-card'");
    expect(source).toContain("page.click('.node-card')");
    expect(source).toContain("page.waitForSelector('#combatOverlay.active'");
    expect(source).toContain("globalThis.advanceTime");
    expect(source).toContain("document.querySelectorAll('#combatHandCards .card').length");
    expect(source).toContain('async function findCombatHoverCardPreview(page)');
    expect(source).toContain("page.locator('#combatHandCards .card')");
    expect(source).toContain("await handCards.count()");
    expect(source).toContain("page.waitForSelector('#handCardCloneLayer .card-clone-visible'");
    expect(source).toContain('hasMechanicTrigger: true');
    expect(source).toContain('hasMechanicTrigger: false');
    expect(source).toContain('combatHoverMechanicTriggerAvailable');
    expect(source).toContain('if (hoverCardSelection.hasMechanicTrigger)');
    expect(source).toContain("page.hover('#handCardCloneLayer .card-hover-mechanic-trigger')");
    expect(source).toContain("page.focus('#handCardCloneLayer .card-hover-mechanic-trigger')");
    expect(source).toContain("page.click('.action-btn-end')");
    expect(source).toContain("runtimeSnapshot?.combat?.playerTurn === false");
    expect(source).toContain("document.getElementById('turnIndicator')?.textContent?.trim() || null");
    expect(source).toContain("document.querySelector('#handCardCloneLayer .card-clone-visible')");
    expect(source).toContain("hoverClone?.querySelector('.card-clone-keyword-panel')");
    expect(source).toContain("hoverClone?.querySelector('.card-hover-mechanic-trigger')");
    expect(source).not.toContain('No combat hand card exposed a hover mechanic trigger');
    expect(source).toContain('page.evaluate(({ hoverCardIndex: selectedHoverCardIndex, hoverMechanicTriggerAvailable, preEndTurnHoverPayload: capturedPreEndTurnHoverPayload }) => {');
    expect(source).toContain('hoverCardIndex: hoverCardSelection.hoverCardIndex');
    expect(source).toContain('hoverMechanicTriggerAvailable: hoverCardSelection.hasMechanicTrigger');
    expect(source).toContain('preEndTurnHoverPayload,');
    expect(source).toContain("document.getElementById('combatEnergyText')");
    expect(source).toContain("document.getElementById('turnIndicator')");
    expect(source).toContain("document.querySelector('.action-btn-end')");
    expect(source).toContain("page.locator('#introCinematicOverlay')");
    expect(source).toContain("document.querySelectorAll('#dotsRow .dot').length");
    expect(source).toContain("document.querySelectorAll('#infoPanel .char-info-tab').length");
    expect(source).toContain("document.querySelector('#infoPanel .char-info-pane.is-active')");
    expect(source).toContain("document.getElementById('charInspector')");
    expect(source).toContain("document.getElementById('gameScreen')?.classList.contains('active')");
    expect(source).toContain("document.getElementById('hudOverlay')");
    expect(source).toContain('combatHoverKeywordPanelOpen');
    expect(source).toContain('runtimeCombatHoverKeywordPanelOpen');
    expect(source).toContain('combatHoverKeywordPanelOpenBeforeEndTurn');
    expect(source).toContain('runtimeCombatHoverKeywordPanelOpenBeforeEndTurn');
    expect(source).toContain('combatHoverMechanicTriggerAvailable');
    expect(source).toContain('combatTurnIndicatorAfterEndTurn');
    expect(source).toContain('runtimeCombatPlayerTurnAfterEndTurn');
    expect(source).toContain('errors.length === 0');
  });
});
