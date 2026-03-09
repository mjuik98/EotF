/**
 * main.js entry point.
 *
 * Responsibility: compose boot sequence only. Module aggregation lives in
 * bindings/module_registry.js to keep this file small as the project grows.
 */
import { setupBindings } from './event_bindings.js';
import * as Deps from './deps_factory.js';
import { bootGame } from './init_sequence.js';
import { createModuleRegistry } from './bindings/module_registry.js';
import { CustomCursor } from '../ui/common/custom_cursor.js';

const modules = createModuleRegistry();

// Global Custom Cursor
try {
  CustomCursor.init({ doc: document, win: window });
} catch (e) {
  console.error('[Main] CustomCursor init failed:', e);
}

// Step 1: helper function wiring + window/GAME binding setup
const fns = setupBindings(modules);

// Step 2: boot sequence
bootGame(modules, fns, Deps);

// Kept as a stable import target for dependent modules.
export { fns };
export function updateNextNodes() {
  fns.updateNextNodes();
}