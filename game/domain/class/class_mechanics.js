import { DATA } from '../../../data/game_data.js';
import { ClassMechanics as ClassMechanicRules } from './class_mechanic_rules.js';
import { buildClassTraitViewModel } from './class_trait_view_model.js';

function buildMechanicFacade(classKey, mechanic) {
  return {
    ...mechanic,
    getSpecialViewModel(gs, deps = {}) {
      return buildClassTraitViewModel(classKey, gs, { data: deps.data || DATA });
    },
    getSpecialUI(gs, deps = {}) {
      const model = this.getSpecialViewModel(gs, deps);
      const renderClassTraitPanel = deps.renderClassTraitPanel || deps.renderSpecialUI;
      if (typeof renderClassTraitPanel === 'function') {
        return renderClassTraitPanel(model, deps);
      }
      return model?.value || '';
    },
  };
}

export const ClassMechanics = Object.fromEntries(
  Object.entries(ClassMechanicRules).map(([classKey, mechanic]) => [
    classKey,
    buildMechanicFacade(classKey, mechanic),
  ]),
);
