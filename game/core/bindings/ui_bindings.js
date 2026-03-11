import { createUiActions } from '../../features/ui/app/ui_actions.js';
import { createUiPorts } from '../../features/ui/ports/create_ui_ports.js';

export function createUIBindings(modules, fns) {
    Object.assign(fns, createUiActions(modules, fns, createUiPorts()));
}
