import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('help pause hotkey smoke script', () => {
  it('self-hosts the built dist before launching Playwright', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'help_pause_hotkey_smoke_check.mjs'),
      'utf8',
    );

    expect(source).toContain("from 'node:http'");
    expect(source).toContain('createServer(');
    expect(source).toContain('server.listen(0,');
    expect(source).toContain('server.close((error) => {');
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
    expect(source).toContain("page.keyboard.press('Escape')");
    expect(source).toContain("page.getByRole('button', { name: buttonName })");
    expect(source).toContain("openPauseSubpanel(page, '도감', '#codexModal')");
    expect(source).toContain("openPauseSubpanel(page, '환경 설정', '#settingsModal')");
    expect(source).toContain("openPauseSubpanel(page, '컨트롤 안내 (?)', '#helpMenu')");
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
    expect(source).toContain("page.screenshot({ path: path.join(outDir, 'shot.png') })");
  });
});
