export const MAX_CLASS_MASTERY_LEVEL = 10;

// Cumulative XP required to reach each level index (1..10).
// Level 1 starts at 0 XP.
export const CLASS_MASTERY_LEVEL_XP = Object.freeze([
  0,    // unused (level 0)
  0,    // level 1
  100,  // level 2
  220,  // level 3
  360,  // level 4
  520,  // level 5
  700,  // level 6
  900,  // level 7
  1120, // level 8
  1360, // level 9
  1620, // level 10
]);

export const CLASS_MASTERY_ROADMAP = Object.freeze([
  { lv: 2, icon: 'ATK', desc: 'Upgrade 1 starter attack card' },
  { lv: 3, icon: 'HP', desc: 'Max HP +6' },
  { lv: 4, icon: 'GOLD', desc: 'Start with +20 gold' },
  { lv: 5, icon: 'ARM', desc: 'Start combat with 5 block' },
  { lv: 6, icon: 'ENG', desc: 'Max energy +1' },
  { lv: 7, icon: 'UP', desc: 'Upgrade 1 random starter card' },
  { lv: 8, icon: 'REL', desc: 'Gain 1 extra relic choice on rewards' },
  { lv: 9, icon: 'SPD', desc: 'Start combat with +10 initiative' },
  { lv: 10, icon: 'AWK', desc: 'Unlock class awakening bonus' },
]);

export const CLASS_MASTERY_ULTIMATE_TEXT = Object.freeze({
  swordsman: 'Resonance awakening: start combat with +3 Resonance.',
  mage: 'Echo awakening: first random card each combat costs 1 less.',
  hunter: 'Tracking awakening: first attack each combat applies 2 Mark.',
  paladin: 'Sanctuary awakening: heal 6 HP at combat start.',
  berserker: 'Fury awakening: start combat with +2 attack.',
  guardian: 'Bulwark awakening: start combat with +10 block.',
});

export function getClassMasteryRoadmap(classId) {
  return CLASS_MASTERY_ROADMAP.map((entry) => {
    if (entry.lv !== MAX_CLASS_MASTERY_LEVEL) return { ...entry };
    return {
      ...entry,
      desc: CLASS_MASTERY_ULTIMATE_TEXT[classId] || entry.desc,
    };
  });
}
