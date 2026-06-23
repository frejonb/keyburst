// ============================================================
//  FORGEMON — global config & tunable settings
//  Everything here is meant to be tweaked live to "feel it out".
// ============================================================
window.CONFIG = {
  // ---- Crafting feel (the big one) -------------------------
  // 'recipes' : fixed block recipes -> a specific monster
  // 'element' : dominant element picks species, total blocks -> level
  // 'slots'   : assemble from BODY / ELEMENT / TRAIT slots
  CRAFT_MODE: 'recipes',

  // ---- World / encounters ---------------------------------
  ENCOUNTER_RATE: 0.12,   // chance per step in tall grass
  START_PARTY_LEVEL: 5,

  // ---- Loot generosity ------------------------------------
  LOOT_BLOCKS_MIN: 1,
  LOOT_BLOCKS_MAX: 3,
  LOOT_ITEM_CHANCE: 0.45,
  LOOT_CORE_CHANCE: 0.18,   // chance a rare Beast Core drops

  // ---- Tuning ---------------------------------------------
  PARTY_MAX: 6,
  TILE: 32,

  // colors used across UI
  UI: {
    panel:   0x1d1b2e,
    panelHi: 0x2a2740,
    ink:     '#f4f0ff',
    inkDim:  '#a9a3c4',
    accent:  '#ffcf4d',
    danger:  '#ff5d73',
    good:    '#6ee0a0',
    line:    0x3a3660,
  },
};

// list used by the settings screen to cycle modes
window.CRAFT_MODES = ['recipes', 'element', 'slots'];
window.CRAFT_MODE_LABELS = {
  recipes: 'Fixed Recipes',
  element: 'Element + Quantity',
  slots:   'Slot Assembly',
};
