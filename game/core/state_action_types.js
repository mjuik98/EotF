export const Actions = {
  // Player
  PLAYER_DAMAGE: 'player:damage',
  PLAYER_HEAL: 'player:heal',
  PLAYER_SHIELD: 'player:shield',
  PLAYER_GOLD: 'player:gold',
  PLAYER_ENERGY: 'player:energy',
  PLAYER_ECHO: 'player:echo',
  PLAYER_SILENCE: 'player:silence',
  PLAYER_TIME_RIFT: 'player:time-rift',
  PLAYER_BUFF: 'player:buff',
  PLAYER_MAX_HP_GROWTH: 'player:max-hp-growth',
  PLAYER_MAX_ENERGY_GROWTH: 'player:max-energy-growth',
  PLAYER_DEATH: 'player:death',

  // Card
  CARD_DRAW: 'card:draw',
  CARD_PLAY: 'card:play',
  CARD_DISCARD: 'card:discard',

  // Enemy
  ENEMY_DAMAGE: 'enemy:damage',
  ENEMY_STATUS: 'enemy:status',
  ENEMY_DEATH: 'enemy:death',
  ENEMY_SPAWN: 'enemy:spawn',

  // Combat
  COMBAT_START: 'combat:start',
  COMBAT_END: 'combat:end',
  TURN_START: 'turn:start',
  TURN_END: 'turn:end',

  // System
  SCREEN_CHANGE: 'screen:change',
  GOLD_CHANGE: 'gold:change',
  MAP_MOVE: 'map:move',
};
