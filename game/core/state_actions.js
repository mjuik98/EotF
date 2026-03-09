import { Actions } from './state_action_types.js';
import { PlayerReducers } from './state_reducers/player_reducers.js';
import { CardReducers } from './state_reducers/card_reducers.js';
import { EnemyReducers } from './state_reducers/enemy_reducers.js';
import { CombatReducers } from './state_reducers/combat_reducers.js';
import { SystemReducers } from './state_reducers/system_reducers.js';

export { Actions } from './state_action_types.js';

export const Reducers = {
  ...PlayerReducers,
  ...CardReducers,
  ...EnemyReducers,
  ...CombatReducers,
  ...SystemReducers,
};
