import { CLASS_ID_ORDER } from '../../../data/class_metadata.js';
import { RARITY_LABELS } from '../../../data/rarity_meta.js';
import {
  clearClassSelection,
  selectClassButton,
  selectClassById,
} from './class_select_selection_ui.js';
import {
  hideClassSelectTooltip,
  showClassSelectTooltip,
} from './class_select_tooltip_ui.js';
import { renderClassSelectButtons } from './class_select_buttons_ui.js';

let _selectedClass = null;

export const ClassSelectUI = {
  getSelectedClass() {
    return _selectedClass;
  },

  selectClass(btn, deps = {}) {
    selectClassButton(btn, {
      ...deps,
      classIdOrder: CLASS_ID_ORDER,
      setSelectedClass: (classId) => {
        _selectedClass = classId;
      },
    });
  },

  selectClassById(classId, deps = {}) {
    selectClassById(classId, {
      ...deps,
      classIdOrder: CLASS_ID_ORDER,
      setSelectedClass: (normalized) => {
        _selectedClass = normalized;
      },
    });
  },

  clearSelection(deps = {}) {
    clearClassSelection({
      ...deps,
      setSelectedClass: (classId) => {
        _selectedClass = classId;
      },
    });
  },

  _showTooltip(e, title, desc) {
    showClassSelectTooltip(e, title, desc, {});
  },

  _hideTooltip() {
    hideClassSelectTooltip({});
  },

  renderButtons(container, deps = {}) {
    renderClassSelectButtons(container, {
      ...deps,
      rarityLabels: RARITY_LABELS,
      showTooltip: (event, title, desc) => this._showTooltip(event, title, desc),
      hideTooltip: () => this._hideTooltip(),
    });
  },
};
