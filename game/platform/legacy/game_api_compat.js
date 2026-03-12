import { assignLegacyCompatSurface } from '../../shared/runtime/public.js';
import { buildLegacyGameAPIFacade } from './game_api_facade.js';

export const GameAPI = {};

assignLegacyCompatSurface(GameAPI, buildLegacyGameAPIFacade(GameAPI));
