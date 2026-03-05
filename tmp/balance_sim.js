
const CURRENT = {
    RUN_SCALE: 0.05,
    REGION_SCALE: 0.10,
    FLOOR_SCALE: 0.03,
};

const PROPOSED = {
    RUN_SCALE: 0.10,
    REGION_SCALE: 0.18,
    FLOOR_SCALE: 0.06,
};

function getMultiplier(scales, run, reg, flr) {
    return 1 + reg * scales.REGION_SCALE + flr * scales.FLOOR_SCALE;
}

const stages = [
    { run: 1, reg: 0, flr: 1, name: 'Region 0 Start' },
    { run: 1, reg: 0, flr: 7, name: 'Region 0 Boss' },
    { run: 1, reg: 2, flr: 1, name: 'Region 2 Start' },
    { run: 1, reg: 2, flr: 7, name: 'Region 2 Boss' },
    { run: 1, reg: 4, flr: 1, name: 'Region 4 Start' },
    { run: 1, reg: 4, flr: 7, name: 'Region 4 Final Boss' },
    { run: 2, reg: 0, flr: 1, name: 'Run 2 R0 Start' },
    { run: 2, reg: 4, flr: 7, name: 'Run 2 Final Boss' },
];

console.log('Stage | Current Multi | Proposed Multi | Change');
console.log('--- | --- | --- | ---');
stages.forEach(s => {
    const cur = getMultiplier(CURRENT, s.run, s.reg, s.flr).toFixed(2);
    const prop = getMultiplier(PROPOSED, s.run, s.reg, s.flr).toFixed(2);
    const diff = ((prop / cur - 1) * 100).toFixed(1);
    console.log(`${s.name} | ${cur} | ${prop} | +${diff}%`);
});
