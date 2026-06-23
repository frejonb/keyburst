// ============================================================
//  FORGEMON — data: elements, blocks, species, moves, recipes, loot
// ============================================================

// ---------- Elements ----------
window.ELEMENTS = {
  ember:  { name:'Ember',   color:0xff6b3d, hex:'#ff6b3d' },
  aqua:   { name:'Aqua',    color:0x3fa9f5, hex:'#3fa9f5' },
  terra:  { name:'Terra',   color:0xc08a4a, hex:'#c08a4a' },
  volt:   { name:'Volt',    color:0xffd23f, hex:'#ffd23f' },
  umbra:  { name:'Umbra',   color:0x9b5de5, hex:'#9b5de5' },
  verdant:{ name:'Verdant', color:0x5fcf6e, hex:'#5fcf6e' },
};

// type effectiveness (attacker element -> defender element -> multiplier)
window.EFFECT = {
  ember:  { verdant:1.6, aqua:0.6, terra:0.6 },
  aqua:   { ember:1.6, terra:1.4, volt:0.6 },
  terra:  { volt:1.6, ember:1.4, verdant:0.6 },
  volt:   { aqua:1.6, umbra:1.2, terra:0.6 },
  umbra:  { verdant:1.4, volt:0.8, umbra:0.5 },
  verdant:{ terra:1.6, aqua:1.3, ember:0.6 },
};
function effectiveness(atkEl, defEl){
  const row = EFFECT[atkEl]; if(!row) return 1;
  return row[defEl] || 1;
}
window.effectiveness = effectiveness;

// ---------- Blocks (the loot you craft with) ----------
window.BLOCKS = {
  ember:   { name:'Ember Block',   element:'ember',   tier:1, glyph:'🔥' },
  aqua:    { name:'Aqua Block',    element:'aqua',    tier:1, glyph:'💧' },
  terra:   { name:'Terra Block',   element:'terra',   tier:1, glyph:'⛰' },
  volt:    { name:'Volt Block',    element:'volt',    tier:1, glyph:'⚡' },
  umbra:   { name:'Umbra Block',   element:'umbra',   tier:1, glyph:'🌙' },
  verdant: { name:'Verdant Block', element:'verdant', tier:1, glyph:'🌿' },
  core:    { name:'Beast Core',    element:null,      tier:2, glyph:'✦' },  // rare, binds a monster together
  prime:   { name:'Prime Shard',   element:null,      tier:3, glyph:'◆' },  // very rare, evolved forms
};
window.ELEMENT_BLOCKS = ['ember','aqua','terra','volt','umbra','verdant'];

// ---------- Consumable items ----------
window.ITEMS = {
  potion:      { name:'Potion',       glyph:'+', heal:35 },
  superpotion: { name:'Super Potion', glyph:'++', heal:90 },
  revive:      { name:'Revive',       glyph:'✚', revive:true },
};

// ---------- Moves ----------
window.MOVES = {
  // neutral
  Tackle:   { power:35, pp:35, element:null },
  Slam:     { power:55, pp:20, element:null },
  Guard:    { power:0,  pp:20, element:null, effect:'raise_def' },
  Focus:    { power:0,  pp:15, element:null, effect:'raise_atk' },
  // ember
  Ember:    { power:38, pp:25, element:'ember' },
  Flameburst:{power:62, pp:12, element:'ember' },
  // aqua
  Bubble:   { power:36, pp:25, element:'aqua' },
  Torrent:  { power:62, pp:12, element:'aqua' },
  // terra
  RockThrow:{ power:42, pp:20, element:'terra' },
  Quake:    { power:64, pp:10, element:'terra' },
  // volt
  Spark:    { power:40, pp:22, element:'volt' },
  Thunder:  { power:66, pp:10, element:'volt' },
  // umbra
  Shade:    { power:40, pp:22, element:'umbra' },
  Nightmare:{ power:64, pp:10, element:'umbra' },
  // verdant
  Vine:     { power:40, pp:22, element:'verdant' },
  Bloom:    { power:64, pp:10, element:'verdant' },
};

// ---------- Species ----------
// shape: 0 small blob, 1 round beast, 2 tall/strong (drawn procedurally)
window.SPECIES = {
  // ember line
  emberling:{ name:'Emberling', element:'ember',   shape:0, tier:1, baseHp:30, baseAtk:9,  baseDef:5,  moves:['Ember','Tackle','Focus'] },
  cindrake: { name:'Cindrake',  element:'ember',   shape:2, tier:2, baseHp:55, baseAtk:15, baseDef:9,  moves:['Flameburst','Slam','Ember','Focus'] },
  // aqua line
  puddlet:  { name:'Puddlet',   element:'aqua',    shape:0, tier:1, baseHp:32, baseAtk:7,  baseDef:7,  moves:['Bubble','Tackle','Guard'] },
  tidewyrm: { name:'Tidewyrm',  element:'aqua',    shape:2, tier:2, baseHp:58, baseAtk:13, baseDef:12, moves:['Torrent','Slam','Bubble','Guard'] },
  // terra line
  pebblit:  { name:'Pebblit',   element:'terra',   shape:1, tier:1, baseHp:36, baseAtk:8,  baseDef:11, moves:['RockThrow','Tackle','Guard'] },
  boulderon:{ name:'Boulderon', element:'terra',   shape:2, tier:2, baseHp:66, baseAtk:14, baseDef:18, moves:['Quake','Slam','RockThrow','Guard'] },
  // volt line
  voltick:  { name:'Voltick',   element:'volt',    shape:0, tier:1, baseHp:28, baseAtk:11, baseDef:4,  moves:['Spark','Tackle','Focus'] },
  stormcat: { name:'Stormcat',  element:'volt',    shape:1, tier:2, baseHp:50, baseAtk:18, baseDef:8,  moves:['Thunder','Slam','Spark','Focus'] },
  // umbra line
  wispurr:  { name:'Wispurr',   element:'umbra',   shape:0, tier:1, baseHp:30, baseAtk:10, baseDef:5,  moves:['Shade','Tackle','Focus'] },
  umbrax:   { name:'Umbrax',    element:'umbra',   shape:2, tier:2, baseHp:52, baseAtk:16, baseDef:10, moves:['Nightmare','Slam','Shade','Focus'] },
  // verdant line
  seedle:   { name:'Seedle',    element:'verdant', shape:0, tier:1, baseHp:34, baseAtk:8,  baseDef:8,  moves:['Vine','Tackle','Guard'] },
  thornak:  { name:'Thornak',   element:'verdant', shape:1, tier:2, baseHp:60, baseAtk:15, baseDef:13, moves:['Bloom','Slam','Vine','Guard'] },
};

// quick lookups: tier1 / tier2 per element
window.TIER1_BY_ELEMENT = {};
window.TIER2_BY_ELEMENT = {};
for(const id in SPECIES){
  const s = SPECIES[id];
  if(s.tier===1) TIER1_BY_ELEMENT[s.element] = id;
  if(s.tier===2) TIER2_BY_ELEMENT[s.element] = id;
}

// ---------- Recipes (CRAFT_MODE 'recipes') ----------
// blocks: map blockId -> count required. yields species at `level`.
window.RECIPES = [
  { id:'emberling', species:'emberling', level:5,  blocks:{ ember:2 } },
  { id:'puddlet',   species:'puddlet',   level:5,  blocks:{ aqua:2 } },
  { id:'pebblit',   species:'pebblit',   level:5,  blocks:{ terra:2 } },
  { id:'voltick',   species:'voltick',   level:5,  blocks:{ volt:2 } },
  { id:'wispurr',   species:'wispurr',   level:5,  blocks:{ umbra:2 } },
  { id:'seedle',    species:'seedle',    level:5,  blocks:{ verdant:2 } },
  // evolved forms need a Beast Core to bind
  { id:'cindrake',  species:'cindrake',  level:14, blocks:{ ember:4, core:1 } },
  { id:'tidewyrm',  species:'tidewyrm',  level:14, blocks:{ aqua:4, core:1 } },
  { id:'boulderon', species:'boulderon', level:14, blocks:{ terra:4, core:1 } },
  { id:'stormcat',  species:'stormcat',  level:14, blocks:{ volt:4, core:1 } },
  { id:'umbrax',    species:'umbrax',    level:14, blocks:{ umbra:4, core:1 } },
  { id:'thornak',   species:'thornak',   level:14, blocks:{ verdant:4, core:1 } },
];

// ---------- helpers ----------
function randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
function choice(a){ return a[Math.floor(Math.random()*a.length)]; }
window.randInt = randInt;
window.choice = choice;

// ---------- Wild encounter tables (by zone) ----------
// zone 0 = meadow (easy), zone 1 = deepwood (tougher)
window.WILD_TABLES = {
  0: [
    { species:'emberling', lo:3, hi:6 },
    { species:'puddlet',   lo:3, hi:6 },
    { species:'seedle',    lo:3, hi:6 },
    { species:'voltick',   lo:4, hi:7 },
  ],
  1: [
    { species:'pebblit',   lo:6, hi:9 },
    { species:'wispurr',   lo:6, hi:9 },
    { species:'cindrake',  lo:9, hi:12 },
    { species:'thornak',   lo:9, hi:12 },
  ],
};

function rollWild(zone){
  const table = WILD_TABLES[zone] || WILD_TABLES[0];
  const e = choice(table);
  return makeMonster(e.species, randInt(e.lo, e.hi));
}
window.rollWild = rollWild;

// ---------- Loot ----------
// when a wild monster faints it drops blocks (mostly its element), maybe an
// item, and rarely a Beast Core / Prime Shard.
function rollLoot(monster){
  const drops = { blocks:{}, items:{} };
  const sp = SPECIES[monster.speciesId];
  const n = randInt(CONFIG.LOOT_BLOCKS_MIN, CONFIG.LOOT_BLOCKS_MAX);
  for(let i=0;i<n;i++){
    // 70% its own element, else a random element
    const el = Math.random()<0.7 ? sp.element : choice(ELEMENT_BLOCKS);
    drops.blocks[el] = (drops.blocks[el]||0) + 1;
  }
  if(Math.random() < CONFIG.LOOT_CORE_CHANCE){
    if(monster.level>=10 && Math.random()<0.3) drops.blocks.prime = (drops.blocks.prime||0)+1;
    else drops.blocks.core = (drops.blocks.core||0)+1;
  }
  if(Math.random() < CONFIG.LOOT_ITEM_CHANCE){
    const item = Math.random()<0.75 ? 'potion' : 'superpotion';
    drops.items[item] = (drops.items[item]||0)+1;
  }
  return drops;
}
window.rollLoot = rollLoot;

// ---------- Monster factory ----------
function makeMonster(speciesId, level){
  const sp = SPECIES[speciesId];
  const scale = 1 + level*0.06;
  const maxHp = Math.floor(sp.baseHp*scale);
  return {
    uid: 'm'+(Math.random().toString(36).slice(2,8)),
    speciesId, name: sp.name, element: sp.element, level,
    maxHp, hp: maxHp,
    atk: Math.floor(sp.baseAtk*scale),
    def: Math.floor(sp.baseDef*scale),
    baseDef: Math.floor(sp.baseDef*scale),
    exp: 0, expNeeded: Math.floor(level*level*3),
    moves: sp.moves.map(m=>({ name:m, pp:MOVES[m].pp, maxPp:MOVES[m].pp })),
  };
}
function recalcStats(m){
  const sp = SPECIES[m.speciesId], scale = 1 + m.level*0.06;
  m.maxHp = Math.floor(sp.baseHp*scale);
  m.atk = Math.floor(sp.baseAtk*scale);
  m.def = Math.floor(sp.baseDef*scale); m.baseDef = m.def;
  m.expNeeded = Math.floor(m.level*m.level*3);
}
window.makeMonster = makeMonster;
window.recalcStats = recalcStats;
