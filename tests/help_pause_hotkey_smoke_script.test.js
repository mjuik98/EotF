import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('help pause hotkey smoke script', () => {
  it('self-hosts the built dist before launching Playwright', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'help_pause_hotkey_smoke_check.mjs'),
      'utf8',
    );

    expect(source).toContain("from './browser_smoke_support.mjs'");
    expect(source).toContain('resolveSmokeAppUrl');
    expect(source).toContain('closeStaticAssetServer');
  });

  it('drives run and combat flows to confirm subpanels block run and combat shortcuts with ESC priority intact', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'help_pause_hotkey_smoke_check.mjs'),
      'utf8',
    );

    expect(source).toContain("page.click('#mainStartBtn')");
    expect(source).toContain("page.waitForSelector('#btnRealStart'");
    expect(source).toContain("page.waitForSelector('#storyContinueBtn'");
    expect(source).toContain("page.waitForSelector('#nodeCardOverlay'");
    expect(source).toContain("from './help_pause_smoke_helpers.mjs'");
    expect(source).toContain('ensurePauseMenuVisible(page)');
    expect(source).toContain("closeSurfaceWithEscapeFallback(page, surfaceSelector, 10000, { preferEscape: true })");
    expect(source).toContain("page.getByRole('button', { name: buttonName })");
    expect(source).toContain("openPauseSubpanel(page, '도감', '#codexModal')");
    expect(source).toContain("openPauseSubpanel(page, '환경 설정', '#settingsModal')");
    expect(source).toContain("openPauseSubpanel(page, '컨트롤 안내 (?)', '#helpMenu')");
    expect(source).toContain('captureOverlayFrameState');
    expect(source).toContain("overlay.classList.contains('hp-overlay')");
    expect(source).toContain("panel.classList.contains('gm-modal-panel')");
    expect(source).toContain("pauseFrame.overlayClassName.includes('hp-overlay-pause')");
    expect(source).toContain("helpFrame.overlayClassName.includes('hp-overlay-help')");
    expect(source).toContain("path.join(outDir, 'pause-menu.png')");
    expect(source).toContain("path.join(outDir, 'help-menu.png')");
    expect(source).toContain("path.join(outDir, 'result.json')");
    expect(source).toContain("page.keyboard.press('Tab')");
    expect(source).toContain("page.keyboard.press('KeyM')");
    expect(source).toContain("page.keyboard.press('KeyQ')");
    expect(source).toContain("page.keyboard.press('KeyE')");
    expect(source).toContain("page.keyboard.press('Enter')");
    expect(source).toContain("page.keyboard.press('1')");
    expect(source).toContain("document.getElementById('deckViewModal')");
    expect(source).toContain("document.getElementById('fullMapOverlay')");
    expect(source).toContain("document.querySelector('#combatOverlay.active')");
    expect(source).toContain('combatCodexBlocksHotkeys');
    expect(source).toContain('escapeClosesSurfaceBeforePause');
    expect(source).toContain('codexBlocksShortcuts');
    expect(source).toContain('settingsBlocksShortcuts');
    expect(source).toContain('helpBlocksShortcuts');
    expect(source).toContain('pauseUsesSharedFrame');
    expect(source).toContain('helpUsesSharedFrame');
    expect(source).toContain('pauseActionCount');
    expect(source).toContain('helpEntryCount');
    expect(source).toContain("page.screenshot({ path: path.join(outDir, 'shot.png') })");
  });
});
