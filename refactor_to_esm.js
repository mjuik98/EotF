const fs = require('fs');
const path = require('path');

const PROJECT_DIR = __dirname;
const JS_DIRS = ['game', 'engine', 'data', 'game/constants'];

// Mapping of ExportName -> Relative Path from root.
const EXPORTS = {
    'AudioEngine': 'engine/audio.js',
    'ParticleSystem': 'engine/particles.js',
    'ScreenShake': 'engine/screenshake.js',
    'HitStop': 'engine/hitstop.js',
    'FovEngine': 'engine/fov.js',
    'CONSTANTS': 'game/constants/constants.js',
    'Trigger': 'game/constants/triggers.js',
    'DescriptionUtils': 'game/description_utils.js',
    'DATA': 'data/game_data.js',
    'NODE_META': 'game/constants/node_meta.js',
    'DifficultyScaler': 'game/difficulty_scaler.js',
    'SetBonusSystem': 'game/set_bonus_system.js',
    'SaveAdapter': 'game/save_adapter.js',
    'SaveSystem': 'game/save_system.js',
    'CardCostUtils': 'game/card_cost_utils.js',
    'RunRules': 'game/run_rules.js',
    'TitleCanvasUI': 'game/title_canvas_ui.js',
    'ClassMechanics': 'game/class_mechanics.js',
    'ScreenUI': 'game/screen_ui.js',
    'RunModeUI': 'game/run_mode_ui.js',
    'ClassSelectUI': 'game/class_select_ui.js',
    'MetaProgressionUI': 'game/meta_progression_ui.js',
    'HelpPauseUI': 'game/help_pause_ui.js',
    'RegionTransitionUI': 'game/region_transition_ui.js',
    'RunStartUI': 'game/run_start_ui.js',
    'RunSetupUI': 'game/run_setup_ui.js',
    'GameCanvasSetupUI': 'game/game_canvas_setup_ui.js',
    'MazeSystem': 'game/maze_system_ui.js',
    'StoryUI': 'game/story_ui.js',
    'CombatStartUI': 'game/combat_start_ui.js',
    'CombatUI': 'game/combat_ui.js',
    'CombatHudUI': 'game/combat_hud_ui.js',
    'EchoSkillUI': 'game/echo_skill_ui.js',
    'CombatTurnUI': 'game/combat_turn_ui.js',
    'HudUpdateUI': 'game/hud_update_ui.js',
    'StatusEffectsUI': 'game/status_effects_ui.js',
    'CombatInfoUI': 'game/combat_info_ui.js',
    'CombatActionsUI': 'game/combat_actions_ui.js',
    'FeedbackUI': 'game/feedback_ui.js',
    'TooltipUI': 'game/tooltip_ui.js',
    'EventUI': 'game/event_ui.js',
    'RewardUI': 'game/reward_ui.js',
    'RunReturnUI': 'game/run_return_ui.js',
    'DeckModalUI': 'game/deck_modal_ui.js',
    'CodexUI': 'game/codex_ui.js',
    'CardUI': 'game/card_ui.js',
    'CardTargetUI': 'game/card_target_ui.js',
    'DomValueUI': 'game/dom_value_ui.js',
    'RandomUtils': 'game/random_utils.js',
    'WorldCanvasUI': 'game/world_canvas_ui.js',
    'WorldRenderLoopUI': 'game/world_render_loop_ui.js',
    'MapGenerationUI': 'game/map_generation_ui.js',
    'MapNavigationUI': 'game/map_navigation_ui.js',
    'MapUI': 'game/map_ui.js',
    'GameBootUI': 'game/game_boot_ui.js',
    'GameStateCoreMethods': 'game/game_state_core_methods.js',
    'GS': 'game/game_state.js',
};

// Inverse mapping for module resolution
const FILE_TO_EXPORT = {};
for (const [name, file] of Object.entries(EXPORTS)) {
    FILE_TO_EXPORT[file.replace(/\\/g, '/')] = name;
}

function getAllJsFiles() {
    let files = [];
    for (const dir of JS_DIRS) {
        const fullDir = path.join(PROJECT_DIR, dir);
        if (fs.existsSync(fullDir)) {
            const dirFiles = fs.readdirSync(fullDir)
                .filter(f => f.endsWith('.js') && f !== 'game_state.js')
                .map(f => path.join(dir, f));
            files = files.concat(dirFiles);
        }
    }
    return files;
}

function processFile(filePath) {
    const normalizedPath = filePath.replace(/\\/g, '/');
    const fullPath = path.join(PROJECT_DIR, filePath);
    let content = fs.readFileSync(fullPath, 'utf8');

    // Strip BOM
    content = content.replace(/^\uFEFF/, '');

    // Strip IIFE start: (function initXXX(globalObj) {
    content = content.replace(/\(function\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*\{/g, '');

    // Determine what this file exports based on our map
    const moduleName = FILE_TO_EXPORT[normalizedPath];

    if (moduleName) {
        // Look for registration patterns and strip them
        // globalObj.Name = Name;
        const regRegex1 = new RegExp(`globalObj\\.${moduleName}\\s*=\\s*${moduleName};`, 'g');
        content = content.replace(regRegex1, '');

        // globalObj.Name = { ... };
        const regRegex2 = new RegExp(`globalObj\\.${moduleName}\\s*=\\s*`, 'g');
        if (regRegex2.test(content)) {
            content = content.replace(regRegex2, `export const ${moduleName} = `);
        } else {
            // Look for const ModuleName = ... or function ModuleName(...) {
            const declRegex = new RegExp(`(?:const|let|var|function)\\s+${moduleName}\\b`);
            if (declRegex.test(content)) {
                content = content.replace(new RegExp(`(const|let|var|function)(\\s+)${moduleName}\\b`), `export $1$2${moduleName}`);
            } else {
                // fallback if it was a factory: const Name = (() => { ... })();
                const factoryRegex = new RegExp(`const\\s+${moduleName}\\s*=\\s*\\(`, 'g');
                if (factoryRegex.test(content)) {
                    content = content.replace(factoryRegex, `export const ${moduleName} = (`);
                }
            }
        }
    }

    // Strip IIFE end: })(window); or })(this);
    content = content.replace(/\}\)\s*\((?:window|this|globalObj|)\s*\)\s*;/g, '');

    // Handle globalObj.XXX and window.XXX
    // Replace window.XXX where XXX is in EXPORTS
    for (const exp of Object.keys(EXPORTS)) {
        const winRegex = new RegExp(`window\\.${exp}\\b`, 'g');
        content = content.replace(winRegex, exp);
    }

    content = content.replace(/globalObj\.([A-Za-z0-9_]+)/g, (match, p1) => {
        if (EXPORTS[p1] || p1 === 'DescriptionUtils' || p1 === 'CardCostUtils') {
            return p1;
        }
        return `window.${p1}`;
    });

    // Determine required imports
    const neededImports = new Set();
    for (const [exp, srcPath] of Object.entries(EXPORTS)) {
        if (exp === moduleName) continue; // Don't import self

        // Basic word boundary check
        const regex = new RegExp(`\\b${exp}\\b`);
        if (regex.test(content)) {
            neededImports.add(exp);
        }
    }

    // Build import strings
    let importBlock = '';
    for (const exp of neededImports) {
        const srcPath = EXPORTS[exp];
        let relToSrc = path.relative(path.dirname(filePath), srcPath).replace(/\\/g, '/');
        if (!relToSrc.startsWith('.')) relToSrc = './' + relToSrc;
        importBlock += `import { ${exp} } from '${relToSrc}';\n`;
    }

    if (importBlock) {
        // Insert after 'use strict'; or at top
        if (content.includes("'use strict';")) {
            content = content.replace("'use strict';", `'use strict';\n\n${importBlock}`);
        } else {
            content = importBlock + '\n' + content;
        }
    }

    fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
    console.log(`Refactored: ${filePath} (Exported: ${moduleName || 'None'})`);
}

function main() {
    const files = getAllJsFiles();
    files.forEach(processFile);
    console.log('--- Finished converting all files (Fixed Version) ---');
}

main();
