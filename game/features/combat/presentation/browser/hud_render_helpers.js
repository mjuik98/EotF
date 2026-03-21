import {
    COMBAT_TEXT,
    getCombatDrawCopy,
} from './combat_copy.js';

export function clampPct(value) {
    return Math.max(0, Math.min(100, Number(value) || 0));
}

function getEchoSkillStage(echoValue) {
    const echo = Math.max(0, Math.floor(Number(echoValue) || 0));
    if (echo < 30) return { echo, stage: 1, tier: 0, start: 0, goal: 30 };
    if (echo < 60) return { echo, stage: 2, tier: 1, start: 30, goal: 60 };
    if (echo < 100) return { echo, stage: 3, tier: 2, start: 60, goal: 100 };
    return { echo, stage: 3, tier: 3, start: 60, goal: 100 };
}

export function getEchoTierWindow(echoValue) {
    const stageInfo = getEchoSkillStage(echoValue);
    const stageEcho = Math.min(stageInfo.echo, stageInfo.goal);
    const pct = clampPct(((stageEcho - stageInfo.start) / (stageInfo.goal - stageInfo.start)) * 100);
    const bg = stageInfo.stage === 1
        ? 'linear-gradient(90deg, var(--echo), #a855f7)'
        : stageInfo.stage === 2
            ? 'linear-gradient(90deg, var(--cyan), #00ffcc)'
            : 'linear-gradient(90deg, var(--gold), #ffd700)';
    return { echo: stageInfo.echo, pct, bg };
}

export function formatEchoSkillButtonText(echoValue) {
    const stageInfo = getEchoSkillStage(echoValue);
    return `${COMBAT_TEXT.echoSkillLabel}(${stageInfo.echo}/${stageInfo.goal})`;
}

export function getCombatDrawButtonCopy(drawState = {}) {
    return getCombatDrawCopy(drawState);
}

export function applyCombatDrawButtonCopy(button, drawState, hint = 'Q') {
    if (!button) return;
    const { label, title } = getCombatDrawButtonCopy(drawState);
    setActionButtonLabel(button, label, hint);
    button.title = title;
}

export function setActionButtonLabel(button, label, hint) {
    if (!button) return;

    const doc = button.ownerDocument || (typeof document !== 'undefined' ? document : null);
    const resolvedHint = hint
        || button.dataset.kbdHint
        || button.querySelector('.kbd-hint')?.textContent?.trim();

    button.textContent = label;

    if (resolvedHint && doc) {
        const hintEl = doc.createElement('span');
        hintEl.className = 'kbd-hint';
        hintEl.textContent = resolvedHint;
        button.appendChild(hintEl);
        button.dataset.kbdHint = resolvedHint;
    } else {
        delete button.dataset.kbdHint;
    }
}

export function getEchoSkillButtonState(echoValue) {
    const stageInfo = getEchoSkillStage(echoValue);
    const stageEcho = Math.min(stageInfo.echo, stageInfo.goal);
    const gaugePct = clampPct(((stageEcho - stageInfo.start) / (stageInfo.goal - stageInfo.start)) * 100);

    if (stageInfo.stage === 1) {
        return {
            ...stageInfo,
            gaugePct,
            fill: 'rgba(168,85,247,0.58)',
            track: 'rgba(123,47,255,0.1)',
            textColor: 'var(--white)',
            borderColor: 'rgba(123,47,255,0.5)',
            glowColor: 'rgba(123,47,255,0.32)',
        };
    }

    if (stageInfo.stage === 2) {
        return {
            ...stageInfo,
            gaugePct,
            fill: 'rgba(0,255,204,0.58)',
            track: 'rgba(0,255,204,0.1)',
            textColor: 'var(--white)',
            borderColor: 'rgba(0,255,204,0.5)',
            glowColor: 'rgba(0,255,204,0.3)',
        };
    }

    return {
        ...stageInfo,
        gaugePct,
        fill: 'rgba(255,215,0,0.62)',
        track: 'rgba(255,215,0,0.1)',
        textColor: 'var(--white)',
        borderColor: 'rgba(255,215,0,0.55)',
        glowColor: 'rgba(255,215,0,0.34)',
    };
}

export function applyEchoSkillButtonState(button, echoValue) {
    if (!button) return;
    const state = getEchoSkillButtonState(echoValue);

    setActionButtonLabel(button, formatEchoSkillButtonText(state.echo), 'E');
    button.disabled = state.tier === 0;
    button.style.opacity = state.tier === 0 ? '0.45' : '1';
    button.style.color = state.textColor;
    button.style.borderColor = state.borderColor;
    button.style.background = `linear-gradient(90deg, ${state.fill} ${state.gaugePct}%, ${state.track} ${state.gaugePct}%)`;
    button.style.boxShadow = state.tier === 0 ? 'none' : `0 0 12px ${state.glowColor}`;
    button.style.textShadow = '0 0 8px rgba(10,10,35,0.8), 0 1px 1px rgba(0,0,0,0.5)';
    button.style.transition = 'opacity 0.2s, background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s';
}

export function getHpBarGradient(hpPct) {
    if (hpPct <= 25) return 'linear-gradient(90deg,#8b0000,#cc0000)';
    if (hpPct <= 50) return 'linear-gradient(90deg,#aa1122,#dd2244)';
    return 'linear-gradient(90deg,#cc2244,#ff4466)';
}
