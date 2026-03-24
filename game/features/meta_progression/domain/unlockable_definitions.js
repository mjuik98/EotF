export const UNLOCKABLES = Object.freeze({
  curses: {
    blood_moon: {
      id: 'blood_moon',
      scope: 'account',
      requires: ['first_victory'],
      unlockHint: '첫 승리 필요',
      visibleBeforeUnlock: true,
    },
    void_oath: {
      id: 'void_oath',
      scope: 'account',
      requires: ['cursed_conqueror_1'],
      unlockHint: '저주 활성화 상태로 승리 1회 필요',
      visibleBeforeUnlock: true,
    },
  },
  relics: {},
  cards: {},
});
