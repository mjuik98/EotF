import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';
import { filterLazyChunkModulePreloads } from '../vite.config.js';

describe('vite chunking guardrails', () => {
  it('splits gameplay-heavy browser code into focused feature chunks instead of one ui-gameplay bucket', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'vite.config.js'), 'utf8');

    expect(source).toContain("return 'ui-combat';");
    expect(source).toContain("return 'ui-combat-deck';");
    expect(source).toContain("return 'ui-combat-chronicle';");
    expect(source).toContain("return 'ui-combat-tooltips';");
    expect(source).toContain("return 'ui-reward';");
    expect(source).toContain("return 'ui-event';");
    expect(source).toContain("return 'ui-shell-overlays';");
  });

  it('targets canonical feature-owned browser paths instead of transitional ui/presentation screen paths', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'vite.config.js'), 'utf8');

    expect(source).toContain("/game/features/event/presentation/browser/");
    expect(source).toContain("/game/features/reward/presentation/browser/");
    expect(source).toContain("/game/features/ui/presentation/browser/ending_");
    expect(source).toContain("/game/features/ui/presentation/browser/story_");
    expect(source).toContain("/game/features/ui/presentation/browser/settings_ui.js");
    expect(source).toContain("/game/features/run/presentation/browser/run_mode_ui.js");
    expect(source).not.toContain("/game/presentation/screens/event_");
    expect(source).not.toContain("/game/ui/screens/event_");
    expect(source).not.toContain("/game/presentation/screens/reward_");
    expect(source).not.toContain("/game/ui/screens/reward_");
    expect(source).not.toContain("/game/ui/screens/settings_ui.js");
    expect(source).not.toContain("/game/ui/run/run_mode_ui.js");
  });

  it('filters lazy feature chunks out of html modulepreload dependencies', () => {
    const deps = [
      'assets/ui-combat-abc.js',
      'assets/ui-combat-deck-abc.js',
      'assets/ui-combat-chronicle-abc.js',
      'assets/ui-combat-tooltips-abc.js',
      'assets/ui-event-abc.js',
      'assets/ui-reward-abc.js',
      'assets/ui-shell-overlays-abc.js',
      'assets/ui-settings-abc.js',
      'assets/ui-run-mode-abc.js',
      'assets/data-cards-abc.js',
      'assets/vendor-abc.js',
    ];

    expect(filterLazyChunkModulePreloads(deps, { hostType: 'html', hostId: 'index.html' })).toEqual([
      'assets/vendor-abc.js',
    ]);
    expect(filterLazyChunkModulePreloads(deps, { hostType: 'js', hostId: 'game/core/main.js' })).toEqual(deps);
  });
});
