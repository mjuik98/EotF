import { createMazeRuntime } from '../../application/create_maze_runtime.js';
import { createMazeDomAdapter } from '../../platform/browser/maze_dom_adapter.js';
import { createMazePresenter } from '../maze_presenter.js';
import {
  handleMazeExit,
  prepareMazeOpenState,
  resolveMazeMove,
} from './maze_system_runtime_ui.js';

export function createMazeBrowserRuntime(deps = {}) {
  return createMazeRuntime({
    ...deps,
    mazeDom: createMazeDomAdapter(deps),
    createMazePresenter,
    handleMazeExit,
    prepareMazeOpenState,
    resolveMazeMove,
  });
}
