import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('player hp panel compat re-exports', () => {
  it('keeps ui/shared player hp panel modules as thin shared/ui facades', () => {
    const renderSource = fs.readFileSync(
      path.join(process.cwd(), 'game/ui/shared/player_hp_panel_render_ui.js'),
      'utf8',
    );
    const runtimeSource = fs.readFileSync(
      path.join(process.cwd(), 'game/ui/shared/player_hp_panel_runtime_ui.js'),
      'utf8',
    );
    const uiSource = fs.readFileSync(
      path.join(process.cwd(), 'game/ui/shared/player_hp_panel_ui.js'),
      'utf8',
    );

    expect(renderSource).toBe(
      [
        'export {',
        '  buildFloatingPlayerHpPanel,',
        '  getPlayerHpPanelLevel,',
        "} from '../../shared/ui/player_hp_panel/public.js';",
        '',
      ].join('\n'),
    );
    expect(runtimeSource).toBe(
      [
        'export {',
        '  captureFloatingTooltipState,',
        '  findBadgeByBuffKey,',
        '  resolveStatusEffectsUI,',
        '  resolveStatusTooltipUI,',
        '  restoreFloatingTooltipState,',
        '  shouldShowFloatingPlayerHpPanel,',
        "} from '../../shared/ui/player_hp_panel/public.js';",
        '',
      ].join('\n'),
    );
    expect(uiSource).toBe(
      [
        'export {',
        '  getPlayerHpPanelLevel,',
        '  removeFloatingPlayerHpPanel,',
        '  renderFloatingPlayerHpPanel,',
        "} from '../../shared/ui/player_hp_panel/public.js';",
        '',
      ].join('\n'),
    );
  });
});
