import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const GROUP_FILES = [
  'game/features/combat/ports/presentation/public_combat_card_presentation_capabilities.js',
  'game/features/combat/ports/presentation/public_combat_feedback_presentation_capabilities.js',
  'game/features/combat/ports/presentation/public_combat_screen_presentation_capabilities.js',
  'game/features/combat/ports/presentation/public_combat_status_presentation_capabilities.js',
];
const SUPPORT_GROUP_FILES = [
  'game/features/combat/ports/presentation/public_combat_browser_support_capabilities.js',
  'game/features/combat/ports/presentation/public_combat_card_support_capabilities.js',
  'game/features/combat/ports/presentation/public_combat_runtime_support_capabilities.js',
  'game/features/combat/ports/presentation/public_combat_status_support_capabilities.js',
];
const BROWSER_GROUP_FILES = [
  'game/features/combat/platform/browser/public_combat_card_browser_modules.js',
  'game/features/combat/platform/browser/public_combat_core_browser_modules.js',
  'game/features/combat/platform/browser/public_combat_hud_browser_modules.js',
];
const APPLICATION_GROUP_FILES = [
  'game/features/combat/ports/public_combat_command_application_capabilities.js',
  'game/features/combat/ports/public_combat_flow_application_capabilities.js',
];

describe('combat presentation capability structure', () => {
  it('keeps the combat presentation capability surface as a thin grouped index', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/combat/ports/public_presentation_capabilities.js'),
      'utf8',
    );

    for (const file of GROUP_FILES) {
      const rel = `./presentation/${path.basename(file)}`;
      expect(source).toContain(rel);
      expect(fs.existsSync(path.join(ROOT, file))).toBe(true);
    }

    expect(source).not.toContain('../presentation/browser/');
  });

  it('keeps combat browser module catalogs split into focused grouped surfaces', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/combat/platform/browser/combat_browser_modules.js'),
      'utf8',
    );

    for (const file of BROWSER_GROUP_FILES) {
      const rel = `./${path.basename(file)}`;
      expect(source).toContain(rel);
      expect(fs.existsSync(path.join(ROOT, file))).toBe(true);
    }

    expect(source).not.toContain('../../presentation/browser/');
  });

  it('keeps combat presentation support capabilities split into focused grouped surfaces', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/combat/ports/public_presentation_support_capabilities.js'),
      'utf8',
    );

    for (const file of SUPPORT_GROUP_FILES) {
      const rel = `./presentation/${path.basename(file)}`;
      expect(source).toContain(rel);
      expect(fs.existsSync(path.join(ROOT, file))).toBe(true);
    }

    expect(source).not.toContain("../../../utils/");
    expect(source).not.toContain("../../../../data/");
  });

  it('keeps combat module and application capability indexes routed through focused grouped files', () => {
    const moduleSource = fs.readFileSync(
      path.join(process.cwd(), 'game/features/combat/ports/public_module_capabilities.js'),
      'utf8',
    );
    const applicationSource = fs.readFileSync(
      path.join(process.cwd(), 'game/features/combat/ports/public_application_capabilities.js'),
      'utf8',
    );

    expect(moduleSource).toContain("../platform/browser/combat_module_capabilities.js");
    expect(moduleSource).not.toContain("../platform/browser/combat_browser_modules.js");

    for (const file of APPLICATION_GROUP_FILES) {
      const rel = `./${path.basename(file)}`;
      expect(applicationSource).toContain(rel);
      expect(fs.existsSync(path.join(ROOT, file))).toBe(true);
    }
  });
});
