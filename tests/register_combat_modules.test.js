import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { registerCombatModules } from '../game/platform/browser/composition/register_combat_modules.js';

describe('registerCombatModules', () => {
  it('reads combat module slices directly from the combat feature module-capability port', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/platform/browser/composition/register_combat_modules.js'),
      'utf8',
    );

    expect(source).toContain("../../../features/combat/ports/public_module_capabilities.js");
    expect(source).not.toContain('./build_combat_core_modules.js');
    expect(source).not.toContain('./build_combat_card_modules.js');
    expect(source).not.toContain('./build_combat_hud_modules.js');
  });

  it('merges combat core, card, and hud module groups into one registry surface', () => {
    const modules = registerCombatModules();

    expect(modules).toEqual(expect.objectContaining({
      CombatStartUI: expect.any(Object),
      CombatUI: expect.any(Object),
      CombatHudUI: expect.any(Object),
      EchoSkillUI: expect.any(Object),
      CombatTurnUI: expect.any(Object),
      StatusEffectsUI: expect.any(Object),
      CombatInfoUI: expect.any(Object),
      CombatActionsUI: expect.any(Object),
      CardUI: expect.any(Object),
      CardTargetUI: expect.any(Object),
      TooltipUI: expect.any(Object),
      DeckModalUI: expect.any(Object),
      HudUpdateUI: expect.any(Object),
      FeedbackUI: expect.any(Object),
      DomValueUI: expect.any(Object),
    }));
  });
});
