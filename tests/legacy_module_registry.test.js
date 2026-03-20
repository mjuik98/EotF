import { describe, expect, it, vi } from 'vitest';

import {
  publishLegacyModuleBag,
  registerLegacyGameModules,
  registerLegacyModule,
} from '../game/platform/legacy/game_module_registry.js';

describe('legacy module registry compat bag', () => {
  it('publishes module bags through legacyModules and the legacy game registry', () => {
    const register = vi.fn();
    const modules = {
      GAME: { register: vi.fn() },
      legacyModules: {
        GAME: { register },
      },
    };
    const moduleBag = {
      SettingsUI: { id: 'settings' },
      CodexUI: { id: 'codex' },
    };

    publishLegacyModuleBag(modules, moduleBag);

    expect(modules.legacyModules.SettingsUI).toBe(moduleBag.SettingsUI);
    expect(modules.SettingsUI).toBe(moduleBag.SettingsUI);
    expect(Object.keys(modules)).not.toContain('SettingsUI');
    expect(Object.keys(modules)).not.toContain('CodexUI');
    expect(register).toHaveBeenCalledWith('SettingsUI', moduleBag.SettingsUI);
    expect(register).toHaveBeenCalledWith('CodexUI', moduleBag.CodexUI);
    expect(modules.GAME.register).not.toHaveBeenCalled();
  });

  it('registers single modules and bulk module names against the legacy bag', () => {
    const register = vi.fn();
    const modules = {
      GAME: { register: vi.fn() },
      legacyModules: {
        GAME: { register },
        EventUI: { id: 'event-ui' },
        CombatUI: { id: 'combat-ui' },
      },
    };

    registerLegacyModule(modules, 'StorySystem', { id: 'story-system' }, { assignKey: 'StorySystem' });
    registerLegacyGameModules(modules);

    expect(modules.legacyModules.StorySystem).toEqual({ id: 'story-system' });
    expect(modules.StorySystem).toEqual({ id: 'story-system' });
    expect(Object.keys(modules)).not.toContain('StorySystem');
    expect(register).toHaveBeenCalledWith('StorySystem', { id: 'story-system' });
    expect(register).toHaveBeenCalledWith('EventUI', modules.legacyModules.EventUI);
    expect(register).toHaveBeenCalledWith('CombatUI', modules.legacyModules.CombatUI);
    expect(modules.GAME.register).not.toHaveBeenCalled();
  });

  it('prefers scoped canonical modules when bulk-registering legacy game names', () => {
    const register = vi.fn();
    const scopedEventUI = { id: 'scoped-event-ui' };
    const modules = {
      legacyModules: {
        GAME: { register },
        EventUI: { id: 'stale-event-ui' },
      },
      featureScopes: {
        core: { GAME: { register } },
        event: { EventUI: scopedEventUI },
      },
    };

    registerLegacyGameModules(modules);

    expect(register).toHaveBeenCalledWith('EventUI', scopedEventUI);
    expect(register).not.toHaveBeenCalledWith('EventUI', modules.legacyModules.EventUI);
  });
});
