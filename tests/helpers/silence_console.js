import { vi } from 'vitest';

export function silenceConsole(methodNames = ['log', 'info', 'warn', 'error', 'group', 'groupCollapsed', 'groupEnd']) {
  for (const methodName of methodNames) {
    if (typeof console[methodName] === 'function') {
      vi.spyOn(console, methodName).mockImplementation(() => {});
    }
  }
}
