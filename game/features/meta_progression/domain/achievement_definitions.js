export const ACHIEVEMENTS = Object.freeze({
  first_victory: {
    id: 'first_victory',
    trigger: 'run_completed',
    category: 'run',
    scope: 'account',
    condition: { type: 'victories', count: 1 },
    rewards: [{ type: 'unlock', contentType: 'curse', contentId: 'blood_moon' }],
  },
  cursed_conqueror_1: {
    id: 'cursed_conqueror_1',
    trigger: 'run_completed',
    category: 'challenge',
    scope: 'account',
    condition: { type: 'cursed_victories', count: 1 },
    rewards: [{ type: 'unlock', contentType: 'curse', contentId: 'void_oath' }],
  },
});
