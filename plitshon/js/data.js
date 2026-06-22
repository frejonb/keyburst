// ============================================================
//  PLITSHON — data: palette, tiles, species, moves, trainers
// ============================================================

// ---------- Palette ----------
const COLOR = {
  bg: "#0A0015", path: "#1A0035", grass: "#051205", tallgrass: "#0A2000",
  wall: "#2D0050", glow: "#7B2FBE", pink: "#FF2D78", cyan: "#00F5FF",
  yellow: "#FFE600", neon: "#00FF41", trunk: "#3D1A00", treetop: "#0D3D00",
};

// ---------- Tiles ----------
const TILE = 32, COLS = 20, ROWS = 15;
const GRASS = 0, TALL_GRASS = 1, PATH = 2, WALL = 3, TREE = 4;
const WALKABLE = { [GRASS]: true, [TALL_GRASS]: true, [PATH]: true, [WALL]: false, [TREE]: false };

const MAP = [
  [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
  [3,2,2,2,2,2,3,1,1,1,1,1,1,3,0,0,0,0,0,3],
  [3,2,4,4,2,2,3,1,1,1,1,1,1,3,0,0,0,0,0,3],
  [3,2,4,4,2,2,3,1,1,1,1,1,1,3,0,1,1,1,0,3],
  [3,2,2,2,2,2,0,1,1,0,0,1,1,0,0,1,1,1,0,3],
  [3,2,2,2,2,2,0,1,1,0,0,1,1,0,0,1,1,1,0,3],
  [3,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,3,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,3,2,2,0,0,1,1,1,0,0,1,1,1,0,0,0,0,0,3],
  [3,3,2,2,0,0,1,1,1,0,0,1,1,1,0,0,4,4,0,3],
  [3,3,2,2,0,0,1,1,1,0,0,1,1,1,0,0,4,4,0,3],
  [3,3,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3],
  [3,3,3,2,2,2,0,0,0,0,0,0,0,0,0,0,0,3,3,3],
  [3,3,3,3,2,2,2,2,2,2,2,2,0,0,0,0,3,3,3,3],
  [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
];

// directions: 0=up, 1=right, 2=down, 3=left
const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];

// ---------- Species ----------
const SPECIES = {
  truk:    { name: "Truk",    baseHp: 30, baseAtk: 8,  baseDef: 5,  color: "#FFE600", moves: ["Zap","Tackle","Spark","Guard"],            evolvesTo: "bruch",   evolvesAt: 16 },
  bruch:   { name: "Bruch",   baseHp: 55, baseAtk: 14, baseDef: 9,  color: "#FF9900", moves: ["Thunderbolt","Crunch","Spark","Harden"],    evolvesTo: "kassler", evolvesAt: 36 },
  kassler: { name: "Kassler", baseHp: 90, baseAtk: 22, baseDef: 15, color: "#FF2D78", moves: ["Thunder","Megabite","Storm","Iron Wall"],   evolvesTo: null,      evolvesAt: null },
  flamix:  { name: "Flamix",  baseHp: 25, baseAtk: 7,  baseDef: 4,  color: "#FF4500", moves: ["Ember","Scratch"],                          evolvesTo: null,      evolvesAt: null },
  aquon:   { name: "Aquon",   baseHp: 28, baseAtk: 6,  baseDef: 7,  color: "#00F5FF", moves: ["Bubble","Splash"],                          evolvesTo: null,      evolvesAt: null },
  stonk:   { name: "Stonk",   baseHp: 35, baseAtk: 9,  baseDef: 10, color: "#9B9B9B", moves: ["Rock Throw","Harden"],                      evolvesTo: null,      evolvesAt: null },
  glitx:   { name: "Glitx",   baseHp: 22, baseAtk: 11, baseDef: 3,  color: "#CC00FF", moves: ["Glitch","Phase"],                           evolvesTo: null,      evolvesAt: null },
};

// ---------- Moves ----------
const MOVES = {
  "Zap":         { power: 40, pp: 25 },
  "Tackle":      { power: 35, pp: 35 },
  "Spark":       { power: 45, pp: 20 },
  "Guard":       { power: 0,  pp: 20, effect: "raise_def" },
  "Thunderbolt": { power: 65, pp: 15 },
  "Crunch":      { power: 60, pp: 15 },
  "Harden":      { power: 0,  pp: 20, effect: "raise_def" },
  "Thunder":     { power: 90, pp: 10 },
  "Megabite":    { power: 85, pp: 10 },
  "Storm":       { power: 80, pp: 10 },
  "Iron Wall":   { power: 0,  pp: 15, effect: "raise_def" },
  "Ember":       { power: 35, pp: 25 },
  "Scratch":     { power: 30, pp: 35 },
  "Bubble":      { power: 30, pp: 30 },
  "Splash":      { power: 35, pp: 25 },
  "Rock Throw":  { power: 45, pp: 20 },
  "Glitch":      { power: 55, pp: 15 },
  "Phase":       { power: 50, pp: 15 },
};

// ---------- Helpers ----------
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function lightenColor(hex) {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + 80);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + 80);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + 80);
  return `rgb(${r},${g},${b})`;
}

// ---------- Plitshon factory ----------
function makePlitshon(speciesId, level) {
  const sp = SPECIES[speciesId];
  const scale = 1 + level * 0.05;
  const maxHp = Math.floor(sp.baseHp * scale);
  return {
    speciesId,
    name: sp.name,
    color: sp.color,
    level,
    maxHp,
    hp: maxHp,
    atk: Math.floor(sp.baseAtk * scale),
    def: Math.floor(sp.baseDef * scale),
    baseDef: Math.floor(sp.baseDef * scale), // pre-buff def for current battle
    exp: 0,
    expNeeded: Math.floor(level * level * 3),
    moves: sp.moves.map(m => ({ name: m, pp: MOVES[m].pp, maxPp: MOVES[m].pp })),
  };
}

function recalcStats(p) {
  const sp = SPECIES[p.speciesId];
  const scale = 1 + p.level * 0.05;
  p.maxHp = Math.floor(sp.baseHp * scale);
  p.atk = Math.floor(sp.baseAtk * scale);
  p.def = Math.floor(sp.baseDef * scale);
  p.baseDef = p.def;
  p.expNeeded = Math.floor(p.level * p.level * 3);
}

// ---------- Trainers ----------
const TRAINERS = [
  { id: 0, x: 9,  y: 3, dir: 2, name: "Ryo",  color: "#FF2D78", party: [makePlitshon("flamix", 8)],                          defeated: false },
  { id: 1, x: 11, y: 9, dir: 3, name: "Mira", color: "#00F5FF", party: [makePlitshon("aquon", 10), makePlitshon("stonk", 8)], defeated: false },
  { id: 2, x: 5,  y: 9, dir: 1, name: "Zane", color: "#CC00FF", party: [makePlitshon("glitx", 14)],                          defeated: false },
];

// ---------- Shared game state ----------
const STATE = { OVERWORLD: "overworld", DIALOG: "dialog", BATTLE: "battle", EVOLVE: "evolve" };

const game = {
  state: STATE.OVERWORLD,
  player: { x: 2, y: 6, dir: 2 },
  party: [makePlitshon("truk", 9)],
  lastStep: 0,
  alertTrainer: null,
  seenTallGrass: false,
};
