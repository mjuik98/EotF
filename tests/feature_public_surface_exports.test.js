import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';
import { CombatPublicSurface } from '../game/features/combat/ports/public_surface.js';
import { RewardPublicSurface } from '../game/features/reward/ports/public_surface.js';
import { RunPublicSurface } from '../game/features/run/ports/public_surface.js';
import { TitlePublicSurface } from '../game/features/title/ports/public_surface.js';
import { UiPublicSurface } from '../game/features/ui/ports/public_surface.js';

describe('feature public surface exports', () => {
  it('exposes stable public surface objects for each feature facade', () => {
    const expectations = {
      'game/features/codex/ports/public_surface.js': 'export const CodexPublicSurface = Object.freeze({',
      'game/features/combat/ports/public_surface.js': 'export const CombatPublicSurface = Object.freeze({',
      'game/features/event/ports/public_surface.js': 'export const EventPublicSurface = Object.freeze({',
      'game/features/reward/ports/public_surface.js': 'export const RewardPublicSurface = Object.freeze({',
      'game/features/run/ports/public_surface.js': 'export const RunPublicSurface = Object.freeze({',
      'game/features/title/ports/public_surface.js': 'export const TitlePublicSurface = Object.freeze({',
      'game/features/ui/ports/public_surface.js': 'export const UiPublicSurface = Object.freeze({',
    };

    for (const [file, marker] of Object.entries(expectations)) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).toContain(marker);
    }
  });

  it('keeps feature root public files anchored on ports/public_surface without local imports', () => {
    const files = [
      'game/features/codex/public.js',
      'game/features/combat/public.js',
      'game/features/event/public.js',
      'game/features/reward/public.js',
      'game/features/run/public.js',
      'game/features/title/public.js',
      'game/features/ui/public.js',
    ];

    for (const file of files) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).toContain("./ports/public_surface.js");
      expect(source).not.toContain('import ');
    }
  });

  it('keeps moved compat facades discoverable through grouped combat capabilities', () => {
    const eventSource = fs.readFileSync(
      path.join(process.cwd(), 'game/features/event/ports/public_surface.js'),
      'utf8',
    );

    expect(Object.keys(CombatPublicSurface.compat).sort()).toEqual([
      'CardMethods',
      'CombatLifecycle',
      'CombatMethods',
      'DamageSystem',
      'DeathHandler',
      'TurnManager',
    ]);
    expect(eventSource).toContain('EventManager,');
  });

  it('keeps CombatPublicSurface narrowed to grouped capability members', () => {
    expect(Object.keys(CombatPublicSurface).sort()).toEqual([
      'application',
      'bindings',
      'compat',
      'contracts',
      'moduleCapabilities',
      'runtime',
      'state',
    ]);
  });

  it('keeps RunPublicSurface narrowed to grouped capability members', () => {
    expect(Object.keys(RunPublicSurface).sort()).toEqual([
      'bindings',
      'browserModules',
      'contracts',
      'moduleCapabilities',
      'rules',
      'runtime',
      'state',
    ]);
  });

  it('keeps reward, title and ui public surfaces narrowed to grouped capability members', () => {
    expect(Object.keys(RewardPublicSurface).sort()).toEqual([
      'application',
      'contracts',
      'moduleCapabilities',
      'runtime',
    ]);
    expect(Object.keys(TitlePublicSurface).sort()).toEqual([
      'bindings',
      'contracts',
      'moduleCapabilities',
      'runtime',
    ]);
    expect(Object.keys(UiPublicSurface).sort()).toEqual([
      'bindings',
      'browserModules',
      'contracts',
      'moduleCapabilities',
      'runtime',
    ]);
  });
});
