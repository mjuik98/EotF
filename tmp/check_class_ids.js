import { CLASS_METADATA } from '../data/class_metadata.js';
import { CONSTANTS } from '../game/data/constants.js';
import { DATA } from '../data/game_data.js';

const metadataKeys = Object.keys(CLASS_METADATA).sort();
const echoSkillKeys = Object.keys(CONSTANTS.ECHO_SKILLS).sort();
const startDeckKeys = Object.keys(DATA.startDecks).sort();

console.log("--- Class ID Consistency Check ---");
console.log("Metadata keys:  ", metadataKeys.join(', '));
console.log("Echo Skill keys:", echoSkillKeys.join(', '));
console.log("Start Deck keys:", startDeckKeys.join(', '));

const allSame =
    JSON.stringify(metadataKeys) === JSON.stringify(echoSkillKeys) &&
    JSON.stringify(metadataKeys) === JSON.stringify(startDeckKeys);

if (allSame) {
    console.log("\n✅ SUCCESS: All class IDs are consistent across metadata, skills, and decks.");
} else {
    console.error("\n❌ FAILURE: Class ID mismatch detected!");
    process.exit(1);
}
