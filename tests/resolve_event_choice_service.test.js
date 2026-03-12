import { describe, expect, it, vi } from 'vitest';

import { resolveEventChoiceService } from '../game/app/event/resolve_event_choice_service.js';

describe('resolve_event_choice_service', () => {
  it('passes injected services through to effectId handlers', () => {
    const handler = vi.fn(() => ({ resultText: 'ok' }));
    const services = { playItemGet: vi.fn() };
    const result = resolveEventChoiceService({
      gs: { player: {} },
      event: { id: 'event' },
      choice: { effectId: 'custom' },
      handlers: { custom: handler },
      data: { cards: {} },
      services,
    });

    expect(result).toEqual({ resultText: 'ok' });
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({
      services,
    }));
  });
});
