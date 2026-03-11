import { createTitleActions } from '../../features/title/app/create_title_actions.js';
import { createTitlePorts } from '../../features/title/ports/create_title_ports.js';

export function createTitleSettingsBindings(modules, fns) {
    Object.assign(fns, createTitleActions(createTitlePorts(modules, fns)));
}
