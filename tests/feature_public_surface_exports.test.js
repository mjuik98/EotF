import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('feature public surface exports', () => {
  it('exposes stable public surface objects for each feature facade', () => {
    const expectations = {
      'game/features/codex/public.js': 'export const CodexPublicSurface = Object.freeze({',
      'game/features/combat/public.js': 'export const CombatPublicSurface = Object.freeze({',
      'game/features/event/public.js': 'export const EventPublicSurface = Object.freeze({',
      'game/features/reward/public.js': 'export const RewardPublicSurface = Object.freeze({',
      'game/features/run/public.js': 'export const RunPublicSurface = Object.freeze({',
      'game/features/title/public.js': 'export const TitlePublicSurface = Object.freeze({',
      'game/features/ui/public.js': 'export const UiPublicSurface = Object.freeze({',
    };

    for (const [file, marker] of Object.entries(expectations)) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).toContain(marker);
    }
  });

  it('keeps moved compat facades discoverable through feature public surfaces', () => {
    const combatSource = fs.readFileSync(
      path.join(process.cwd(), 'game/features/combat/public.js'),
      'utf8',
    );
    const eventSource = fs.readFileSync(
      path.join(process.cwd(), 'game/features/event/public.js'),
      'utf8',
    );

    expect(combatSource).toContain('CombatLifecycle,');
    expect(combatSource).toContain('CombatMethods,');
    expect(combatSource).toContain('CardMethods,');
    expect(combatSource).toContain('DamageSystem,');
    expect(combatSource).toContain('DeathHandler,');
    expect(combatSource).toContain('TurnManager,');
    expect(eventSource).toContain('EventManager,');
  });
});
