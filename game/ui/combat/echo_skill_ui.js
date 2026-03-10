import { useEchoSkillRuntime } from './echo_skill_runtime_ui.js';

export const EchoSkillUI = {
  useEchoSkill(deps = {}) {
    useEchoSkillRuntime(deps);
  },
};
