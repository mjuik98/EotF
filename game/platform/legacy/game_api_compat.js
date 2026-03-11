import { buildLegacyGameAPIFacade } from './game_api_facade.js';

export const GameAPI = {};

Object.assign(GameAPI, buildLegacyGameAPIFacade(GameAPI));
