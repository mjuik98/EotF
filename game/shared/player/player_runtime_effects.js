import { GAME } from '../../core/global_bridge.js';
import { PlayerResourceUseCaseMethods } from './player_resource_use_cases.js';
import { PlayerStateActions as Actions, setPlayerEnergyState } from '../state/player_state_commands.js';

const getWin = (deps) => deps?.win || window;

export const PlayerRuntimeEffectMethods = {
  addEcho(amount, source = null) {
    const result = PlayerResourceUseCaseMethods.addEcho.call(this, amount, source);
    GAME?.API?.updateEchoSkillBtn?.();
    return result;
  },

  drainEcho(amount) {
    const result = PlayerResourceUseCaseMethods.drainEcho.call(this, amount);
    GAME?.API?.updateEchoSkillBtn?.();
    return result;
  },

  heal(amount, source = null, deps = {}) {
    const result = PlayerResourceUseCaseMethods.heal.call(this, amount, source, deps);
    if (this.combat?.active) {
      const cm = GAME?.Modules?.ClassMechanics?.[this.player.class];
      if (cm && typeof cm.onHeal === 'function' && result?.healed > 0) {
        cm.onHeal(this, result.healed);
      }
    }
    return result;
  },

  addSilence(amount, label = '소음', deps = {}) {
    const result = this.commit(Actions.PLAYER_SILENCE, { amount });
    const silenceGauge = Number(result?.silenceGauge || 0);
    const max = 10;
    this.addLog(`✨ ${label} ${silenceGauge}/${max}`, 'echo');
    if (silenceGauge >= max) {
      this.commit(Actions.PLAYER_SILENCE, { amount: -silenceGauge });
      this.spawnEnemy(deps);
      this.addLog('⚙️ 소음 한계! 파수꾼 등장!', 'damage');
      const win = getWin(deps);
      const screenShake = deps.screenShake || win.ScreenShake;
      if (screenShake) screenShake.shake(10, 0.5);
    }
    const win = getWin(deps);
    const updateNoiseWidget = deps.updateNoiseWidget || win.updateNoiseWidget;
    if (typeof updateNoiseWidget === 'function') updateNoiseWidget();
    const updateClassSpecialUI = deps.updateClassSpecialUI || win.updateClassSpecialUI;
    if (typeof updateClassSpecialUI === 'function') updateClassSpecialUI();
  },

  addTimeRift(amount, label = '시간의 균열', deps = {}) {
    const result = this.commit(Actions.PLAYER_TIME_RIFT, { amount });
    const timeRiftGauge = Number(result?.timeRiftGauge || 0);
    const max = 10;

    let labelText = `${label} ${timeRiftGauge}/${max}`;
    if (timeRiftGauge >= max) {
      labelText += ' - 시간 강제 재조정!';
    }
    this.addLog(`✨ ${labelText}`, 'echo');

    const win = getWin(deps);
    const updateNoiseWidget = deps.updateNoiseWidget || win.updateNoiseWidget;
    if (typeof updateNoiseWidget === 'function') updateNoiseWidget();

    if (timeRiftGauge >= max) {
      this.commit(Actions.PLAYER_TIME_RIFT, { amount: -timeRiftGauge });
      setPlayerEnergyState(this, 0);
      this.addLog('⚙️ 시간의 왜곡이 임계점에 달했습니다. 에너지를 모두 잃고 턴이 강제로 종료됩니다!', 'damage');

      const screenShake = deps.screenShake || win.ScreenShake;
      if (screenShake) screenShake.shake(15, 0.6);

      setTimeout(() => {
        const endPlayerTurn = deps.endPlayerTurn || win.endPlayerTurn;
        if (typeof endPlayerTurn === 'function') {
          endPlayerTurn();
        }
      }, 300);
    }
  },
};
