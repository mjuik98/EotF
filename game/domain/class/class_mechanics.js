import { DATA } from '../../../data/game_data.js';
import { ClassMechanics as ClassMechanicRules } from '../../combat/class_mechanics.js';
import { renderClassTraitPanel } from '../../ui/shared/class_trait_panel_ui.js';
import { buildClassTraitViewModel } from './class_trait_view_model.js';

function buildMechanicFacade(classKey, mechanic) {
  return {
    ...mechanic,
    getSpecialUI(gs, deps = {}) {
      return renderClassTraitPanel(
        buildClassTraitViewModel(classKey, gs, { data: deps.data || DATA }),
        deps,
      );
    },
  };
}

export const ClassMechanics = Object.fromEntries(
  Object.entries(ClassMechanicRules).map(([classKey, mechanic]) => [
    classKey,
    buildMechanicFacade(classKey, mechanic),
  ]),
);
