export function clampPct(value) {
    return Math.max(0, Math.min(100, Number(value) || 0));
}

export function getEchoTierWindow(echoValue) {
    const echo = Math.floor(echoValue || 0);
    const tierMax = echo >= 100 ? 100 : echo >= 60 ? 100 : echo >= 30 ? 60 : 30;
    const tierMin = echo >= 60 ? 60 : echo >= 30 ? 30 : 0;
    const pct = clampPct(((echo - tierMin) / (tierMax - tierMin)) * 100);
    const bg = echo >= 100
        ? 'linear-gradient(90deg, var(--gold), #ffd700)'
        : echo >= 60
            ? 'linear-gradient(90deg, var(--cyan), #00ffcc)'
            : 'linear-gradient(90deg, var(--echo), #a855f7)';
    return { echo, pct, bg };
}

export function getHpBarGradient(hpPct) {
    if (hpPct <= 25) return 'linear-gradient(90deg,#8b0000,#cc0000)';
    if (hpPct <= 50) return 'linear-gradient(90deg,#aa1122,#dd2244)';
    return 'linear-gradient(90deg,#cc2244,#ff4466)';
}

