import { describe, expect, it } from 'vitest';
import {
  CoreEvents,
  normalizeEventPayload,
  validateEventPayload,
} from '../game/core/event_contracts.js';
import { Actions } from '../game/core/state_actions.js';

describe('event contracts', () => {
  it('normalizes action payloads into standard envelopes', () => {
    const normalized = normalizeEventPayload(Actions.PLAYER_DAMAGE, { amount: 5 });

    expect(normalized.type).toBe(Actions.PLAYER_DAMAGE);
    expect(typeof normalized.ts).toBe('number');
    expect(normalized.payload).toEqual({ amount: 5 });
  });

  it('validates action envelopes and reports missing fields', () => {
    const issues = validateEventPayload(Actions.PLAYER_DAMAGE, { type: Actions.PLAYER_DAMAGE });
    expect(issues).toContain('missing:ts');
    expect(issues).toContain('missing:payload');
  });

  it('validates core event contracts', () => {
    const invalid = validateEventPayload(CoreEvents.LOG_ADD, { msg: 123 });
    expect(invalid).toContain('missing:type');

    const valid = validateEventPayload(CoreEvents.LOG_ADD, { msg: 'hello', type: 'system' });
    expect(valid.length).toBe(0);
  });
});
