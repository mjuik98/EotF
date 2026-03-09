/**
 * main.js entry point.
 *
 * Responsibility: compose boot sequence only. Bootstrap details live in
 * bootstrap_game.js so this file stays declarative.
 */
import { bootstrapGameApp } from './bootstrap_game.js';

const { fns } = bootstrapGameApp();

export { fns };
export function updateNextNodes() {
  fns.updateNextNodes();
}
