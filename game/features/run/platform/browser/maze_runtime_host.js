function bindHostMethod(fn, context) {
  if (typeof fn !== 'function') return null;
  return typeof fn.bind === 'function' ? fn.bind(context) : fn;
}

export function createMazeRuntimeHost(options = {}) {
  const { mazeDom = null } = options;

  function getWin() {
    if (options.win) return options.win;
    try {
      return mazeDom?.getWin?.() || null;
    } catch {
      return null;
    }
  }

  return {
    addWindowListener(eventName, handler, config) {
      if (typeof config === 'undefined') {
        getWin()?.addEventListener?.(eventName, handler);
        return;
      }
      getWin()?.addEventListener?.(eventName, handler, config);
    },

    removeWindowListener(eventName, handler, config) {
      if (typeof config === 'undefined') {
        getWin()?.removeEventListener?.(eventName, handler);
        return;
      }
      getWin()?.removeEventListener?.(eventName, handler, config);
    },

    requestAnimationFrame(callback) {
      const win = getWin();
      const requestAnimationFrame = bindHostMethod(
        options.requestAnimationFrame || win?.requestAnimationFrame,
        win,
      );
      return requestAnimationFrame?.(callback);
    },

    setTimeoutFn(callback, delay) {
      const win = getWin();
      const setTimeoutFn = bindHostMethod(options.setTimeoutFn || win?.setTimeout, win) || setTimeout;
      return setTimeoutFn(callback, delay);
    },
  };
}
