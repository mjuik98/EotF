import { createMazeBrowserRuntime } from './create_maze_browser_runtime.js';

let _deps = {};
let _runtime = createMazeBrowserRuntime(_deps);

export const MazeSystem = {
  configure(nextDeps = {}) {
    _deps = { ..._deps, ...nextDeps };
    _runtime = createMazeBrowserRuntime(_deps);
  },

  init() {
    _runtime.init();
  },

  open(isBoss) {
    return _runtime.open(isBoss);
  },

  close() {
    return _runtime.close();
  },

  move(dx, dy) {
    return _runtime.move(dx, dy);
  },
};
