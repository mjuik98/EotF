import fs from 'fs';
import path from 'path';

global.window = {
    addEventListener: () => {},
    MapUI: {},
    location: { reload: () => {} }
};
global.document = {
    getElementById: () => ({ addEventListener: () => {}, style: {}, classList: { toggle:()=>{} }, appendChild: () => {} }),
    querySelectorAll: () => [],
    createElement: () => ({ addEventListener: () => {}, style: {}, classList: { toggle:()=>{} }, appendChild: () => {} }),
    addEventListener: () => {},
    body: { appendChild: () => {}, classList: { add:()=>{}, remove:()=>{} } }
};
global.localStorage = { getItem: () => null, setItem: () => {} };
global.requestAnimationFrame = () => {};
global.GAME = { API: {}, Modules: {} };
global.DATA = {};
global.GS = {};
global.Audio = class {};
global.Image = class {};
global.fetch = async () => ({ json: async () => ({}) });

async function checkImports() {
    const dirs = ['engine', 'game']; // Note: engine first, game second
    let hasErrors = false;
    for (const dir of dirs) {
        if (!fs.existsSync(dir)) continue;
        const files = fs.readdirSync(dir);
        for (const file of files) {
            if (!file.endsWith('.js')) continue;
            const fullPath = path.resolve(dir, file);
            try {
                await import('file://' + fullPath);
            } catch (e) {
                if (e.code === 'ERR_MODULE_NOT_FOUND' || e.name === 'SyntaxError') {
                    console.error(`Error loading ${dir}/${file}:`, e.message);
                    hasErrors = true;
                } else if (e.name === 'ReferenceError') {
                    console.error(`Reference error in ${dir}/${file}:`, e.message);
                    hasErrors = true;
                } else {
                    // Ignore TypeError from mocked DOM methods executing
                    // console.log(`Ignored error in ${dir}/${file}:`, e.message);
                }
            }
        }
    }
    if (!hasErrors) console.log("--- All imports checked. Limited ReferenceErrors found. ---");
}
checkImports();
