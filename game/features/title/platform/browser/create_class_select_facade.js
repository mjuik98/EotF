import { CLASS_ID_ORDER } from '../../../../../data/class_metadata.js';
import { RARITY_LABELS } from '../../../../../data/rarity_meta.js';
import {
  clearClassSelection,
  selectClassButton,
  selectClassById,
} from '../../../../ui/title/class_select_selection_ui.js';
import {
  hideClassSelectTooltip,
  showClassSelectTooltip,
} from '../../../../ui/title/class_select_tooltip_ui.js';
import { renderClassSelectButtons } from '../../../../ui/title/class_select_buttons_ui.js';

export function createClassSelectFacade(options = {}) {
  const {
    classIdOrder = CLASS_ID_ORDER,
    rarityLabels = RARITY_LABELS,
  } = options;
  let selectedClass = null;

  return {
    getSelectedClass() {
      return selectedClass;
    },

    selectClass(btn, deps = {}) {
      selectClassButton(btn, {
        ...deps,
        classIdOrder,
        setSelectedClass: (classId) => {
          selectedClass = classId;
        },
      });
    },

    selectClassById(classId, deps = {}) {
      selectClassById(classId, {
        ...deps,
        classIdOrder,
        setSelectedClass: (normalized) => {
          selectedClass = normalized;
        },
      });
    },

    clearSelection(deps = {}) {
      clearClassSelection({
        ...deps,
        setSelectedClass: (classId) => {
          selectedClass = classId;
        },
      });
    },

    _showTooltip(event, title, desc) {
      showClassSelectTooltip(event, title, desc, {});
    },

    _hideTooltip() {
      hideClassSelectTooltip({});
    },

    renderButtons(container, deps = {}) {
      renderClassSelectButtons(container, {
        ...deps,
        rarityLabels,
        showTooltip: (event, title, desc) => this._showTooltip(event, title, desc),
        hideTooltip: () => this._hideTooltip(),
      });
    },
  };
}
