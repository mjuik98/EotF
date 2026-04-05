import { createMazeRuntime } from '../../application/create_maze_runtime.js';
import { createMazeDomAdapter } from '../../platform/browser/maze_dom_adapter.js';
import { createMazeRuntimeHost } from '../../platform/browser/maze_runtime_host.js';
import { createMazePresenter } from '../maze_presenter.js';
import {
  handleMazeExit,
  prepareMazeOpenState,
  resolveMazeMove,
} from './maze_system_runtime_ui.js';

export function createMazeBrowserRuntime(deps = {}) {
  const mazeDom = createMazeDomAdapter(deps);
  return createMazeRuntime({
    ...deps,
    mazeDom,
    mazeHost: createMazeRuntimeHost({ ...deps, mazeDom }),
    createMazePresenter,
    handleMazeExit,
    prepareMazeOpenState,
    resolveMazeMove,
  });
}
