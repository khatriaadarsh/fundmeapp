// src/utils/categoryIcons.js
//
// Maps a category name/id (as returned by the categories API) to a
// MaterialCommunityIcons icon name. Any category not explicitly listed
// falls back to a generic icon, so new/unknown categories from the API
// never break the UI.

const ICON_MAP = {
  all: 'view-grid-outline',
  water: 'water-outline',
  education: 'school-outline',
  medical: 'medical-bag',
  health: 'medical-bag',
  disaster: 'home-outline',
  food: 'food-apple-outline',
  animal: 'paw-outline',
  environment: 'leaf',
};

export const getCategoryIcon = (name = '') => {
  const key = String(name).trim().toLowerCase();
  return ICON_MAP[key] || 'shape-outline';
};