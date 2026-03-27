import { afterEach, describe, expect, it, vi } from 'vitest';
import { Logger } from '../game/utils/logger.js';

describe('Logger test-runtime silence', () => {
  afterEach(() => {
    Logger.setDev(true);
    Logger.setLevel('warn');
    Logger.setTestMuted(false);
    vi.restoreAllMocks();
  });

  it('suppresses warn and error logs when test muting is enabled', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    Logger.setDev(true);
    Logger.setLevel('debug');
    Logger.setTestMuted(true);
    Logger.warn('warn payload');
    Logger.error('error payload');

    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('allows logs when test muting is disabled', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    Logger.setDev(true);
    Logger.setLevel('debug');
    Logger.setTestMuted(false);
    Logger.warn('warn payload');

    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});
