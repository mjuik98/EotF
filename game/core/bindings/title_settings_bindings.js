import { createTitleBindings } from '../../features/title/public.js';

export function createTitleSettingsBindings(modules, fns) {
    Object.assign(fns, createTitleBindings(modules, fns));
}
