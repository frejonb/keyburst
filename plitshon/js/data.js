// ============================================================
//  PLITSHON — data: palette, species, moves, map, world entities
//  Setting: the TULIPA region (inspired by the Netherlands)
// ============================================================

// ---------- Canvas palette (overworld + creatures) ----------
const PAL = {
  grass:"#7CB85B", grassDk:"#5C9B43", grassLt:"#92CC6E",
  tall:"#4E9636", tallDk:"#3C7A29", tallTip:"#A6E06A",
  brick:"#C98B5A", brickDk:"#A66E42", brickLn:"#8A572F",
  water:"#4A93D6", waterDk:"#357ABF", waterLt:"#7DB9EC",
  sand:"#E0CC93", sandDk:"#C7AE74",
  trunk:"#7A5230", trunkDk:"#5C3C20",
  leaf:"#3E8E4A", leafDk:"#2C6F38", leafLt:"#5FB36A",
  wall:"#E8D6B0", wallDk:"#C9B287",
  roof:"#B5483A", roofDk:"#8E3429", roofLt:"#D06354",
  door:"#6B4326", window:"#8FD3E8",
  millBody:"#D9C39A", millDk:"#B89C6E", millBlade:"#6B4326",
  tRed:"#E2453C", tRedDk:"#B5302A", tYel:"#F2C32E", tYelDk:"#C99C1C",
  tPink:"#E87FB0", stem:"#3C7A29",
  fence:"#B89A6E", fenceDk:"#947A52",
  outline:"#2A2433", shadow:"rgba(0,0,0,0.18)",
};

// ---------- Tile ids ----------
const T_GRASS=0,T_TALL=1,T_PATH=2,T_WATER=3,T_TREE=4,
      T_TULR=5,T_TULY=6,T_WALL=7,T_ROOF=8,T_MILL=9,
      T_FLOWER=10,T_SIGN=11,T_BRIDGE=12,T_SAND=13,T_FENCE=14,T_DOOR=15;

const WALKABLE = {[T_GRASS]:1,[T_TALL]:1,[T_PATH]:1,[T_FLOWER]:1,[T_BRIDGE]:1,[T_SAND]:1,[T_DOOR]:1};
function isWalkable(id){ return !!WALKABLE[id]; }

// ---------- Map dimensions ----------
const TILE=32;
const MW=34, MH=30;     // world size (tiles)
const VW=20, VH=15;     // viewport (640x480)

// ---------- Map builder ----------
function buildMap(){
  const m=[];
  for(let y=0;y<MH;y++) m.push(new Array(MW).fill(T_GRASS));
  const inb=(x,y)=>x>=0&&y>=0&&x<MW&&y<MH;
  const rect=(x,y,w,h,id)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)if(inb(i,j))m[j][i]=id;};
  const put=(x,y,id)=>{if(inb(x,y))m[y][x]=id;};

  // tree border
  rect(0,0,MW,2,T_TREE); rect(0,MH-2,MW,2,T_TREE);
  rect(0,0,2,MH,T_TREE); rect(MW-2,0,2,MH,T_TREE);

  // --- TOWN (north): Tulpenburg ---
  rect(2,3,MW-4,2,T_WATER);          // canal
  rect(15,3,2,2,T_BRIDGE);           // bridge
  rect(3,6,MW-6,5,T_PATH);           // plaza
  rect(15,5,2,MH-6,T_PATH);          // main street south

  function house(x,y){ rect(x,y,3,1,T_ROOF); rect(x,y+1,3,2,T_WALL); put(x+1,y+2,T_DOOR); }
  house(4,7); house(9,7); house(24,7); house(28,7);
  // lab (wider)
  rect(18,6,5,1,T_ROOF); rect(18,7,5,3,T_WALL); put(20,9,T_DOOR);
  // windmill
  put(5,5,T_MILL);
  // decoration
  put(7,10,T_FLOWER); put(13,10,T_FLOWER); put(26,10,T_FLOWER); put(12,6,T_FLOWER);
  put(16,6,T_SIGN); put(14,13,T_SIGN);

  // --- ROUTE 1 (tulip country) ---
  function field(x,y,w,h){ for(let j=0;j<h;j++)for(let i=0;i<w;i++) put(x+i,y+j, ((i+j)%2===0)?T_TULR:T_TULY); }
  field(4,13,5,3); field(24,13,6,4);
  put(11,14,T_TREE); put(21,16,T_TREE); put(9,18,T_TREE);
  rect(5,17,6,3,T_TALL); rect(23,19,7,4,T_TALL);

  // --- FOREST (south): Het Woud ---
  rect(3,23,7,2,T_TREE); rect(MW-9,23,7,2,T_TREE);
  rect(3,25,2,4,T_TREE); rect(MW-5,25,2,4,T_TREE);
  put(7,26,T_TREE); put(9,27,T_TREE); put(26,26,T_TREE); put(24,27,T_TREE);
  rect(13,25,8,4,T_GRASS);
  put(14,26,T_FLOWER); put(19,27,T_FLOWER); put(16,28,T_FLOWER);
  rect(28,25,3,2,T_WATER);
  rect(4,26,4,3,T_TALL);
  rect(15,20,2,4,T_PATH); rect(15,24,2,2,T_PATH);

  return m;
}
let MAP = buildMap();

// ---------- Directions ----------
const DX=[0,1,0,-1], DY=[-1,0,1,0]; // 0 up,1 right,2 down,3 left

// ---------- Species ----------
const SPECIES = {
  truk:    { name:"Truk",    baseHp:30, baseAtk:8,  baseDef:5,  color:"#F2D02E", moves:["Zap","Tackle","Spark","Guard"],          evolvesTo:"bruch",   evolvesAt:16 },
  bruch:   { name:"Bruch",   baseHp:55, baseAtk:14, baseDef:9,  color:"#F2922E", moves:["Thunderbolt","Crunch","Spark","Harden"],  evolvesTo:"kassler", evolvesAt:36 },
  kassler: { name:"Kassler", baseHp:90, baseAtk:22, baseDef:15, color:"#FF4F8B", moves:["Thunder","Megabite","Storm","Iron Wall"], evolvesTo:null,      evolvesAt:null },
  flamix:  { name:"Flamix",  baseHp:25, baseAtk:7,  baseDef:4,  color:"#F2622E", moves:["Ember","Scratch"],                        evolvesTo:null,      evolvesAt:null },
  aquon:   { name:"Aquon",   baseHp:28, baseAtk:6,  baseDef:7,  color:"#3FB5E2", moves:["Bubble","Splash"],                        evolvesTo:null,      evolvesAt:null },
  stonk:   { name:"Stonk",   baseHp:35, baseAtk:9,  baseDef:10, color:"#9B9B9B", moves:["Rock Throw","Harden"],                    evolvesTo:null,      evolvesAt:null },
  glitx:   { name:"Glitx",   baseHp:22, baseAtk:11, baseDef:3,  color:"#B14BE0", moves:["Glitch","Phase"],                         evolvesTo:null,      evolvesAt:null },
};

// ---------- Moves ----------
const MOVES = {
  "Zap":{power:40,pp:25},"Tackle":{power:35,pp:35},"Spark":{power:45,pp:20},
  "Guard":{power:0,pp:20,effect:"raise_def"},
  "Thunderbolt":{power:65,pp:15},"Crunch":{power:60,pp:15},
  "Harden":{power:0,pp:20,effect:"raise_def"},
  "Thunder":{power:90,pp:10},"Megabite":{power:85,pp:10},"Storm":{power:80,pp:10},
  "Iron Wall":{power:0,pp:15,effect:"raise_def"},
  "Ember":{power:35,pp:25},"Scratch":{power:30,pp:35},
  "Bubble":{power:30,pp:30},"Splash":{power:35,pp:25},
  "Rock Throw":{power:45,pp:20},"Glitch":{power:55,pp:15},"Phase":{power:50,pp:15},
};

// ---------- Plitshon factory ----------
function makePlitshon(speciesId,level){
  const sp=SPECIES[speciesId], scale=1+level*0.05, maxHp=Math.floor(sp.baseHp*scale);
  return {
    speciesId, name:sp.name, color:sp.color, level,
    maxHp, hp:maxHp,
    atk:Math.floor(sp.baseAtk*scale), def:Math.floor(sp.baseDef*scale),
    baseDef:Math.floor(sp.baseDef*scale),
    exp:0, expNeeded:Math.floor(level*level*3),
    moves: sp.moves.map(m=>({name:m,pp:MOVES[m].pp,maxPp:MOVES[m].pp})),
  };
}
function recalcStats(p){
  const sp=SPECIES[p.speciesId], scale=1+p.level*0.05;
  p.maxHp=Math.floor(sp.baseHp*scale);
  p.atk=Math.floor(sp.baseAtk*scale);
  p.def=Math.floor(sp.baseDef*scale); p.baseDef=p.def;
  p.expNeeded=Math.floor(p.level*p.level*3);
}

// ---------- Trainers (Dutch flavour) ----------
const TRAINERS = [
  { id:0, x:8,  y:16, dir:2, name:"Bram",  color:"#E8772E",
    party:[makePlitshon("flamix",5)], defeated:false,
    pre:"Bram: Welkom on Route 1! Show me your spirit!", post:"Bram: Sterk! You ride like the wind." },
  { id:1, x:27, y:21, dir:3, name:"Femke", color:"#3FB5E2",
    party:[makePlitshon("aquon",7),makePlitshon("stonk",6)], defeated:false,
    pre:"Femke: The canals taught me patience. Have you any?", post:"Femke: Goed gedaan! You earned this." },
  { id:2, x:18, y:24, dir:2, name:"Joris", color:"#B14BE0",
    party:[makePlitshon("glitx",10)], defeated:false,
    pre:"Joris: The old windmill hums with static...", post:"Joris: Ongelooflijk! The Grid chose well." },
];

// ---------- NPCs ----------
const NPCS = [
  { x:11, y:10, dir:2, color:"#C94F8B",
    lines:["Tulpenburg's tulips bloom brightest in spring!","They say a lonely Plitshon hides in HET WOUD forest, to the south."] },
  { x:26, y:10, dir:2, color:"#4F7AC9",
    lines:["My opa bikes along the dijk every morning.","Mind the canals — Plitshon can't swim across!"] },
  { x:20, y:10, dir:2, color:"#5BA34F",
    lines:["Professor van Dijk: Out in the world you'll find a partner.","Treat it kindly, and it will choose to stay with you."] },
];

// ---------- Signs ----------
const SIGNS = { "16,6":"TULPENBURG\nTown of Tulips & Mills", "14,13":"ROUTE 1 — south to HET WOUD.\nTall grass ahead!" };

// ---------- The lonely Truk location (grove) ----------
const TRUK_SPOT = { x:17, y:26 };

// ---------- Wild encounters ----------
function rollWildSpecies(px,py){
  if (py>=23) return makePlitshon("glitx", randInt(4,8));
  if (px>20)  return makePlitshon("flamix", randInt(4,7));
  const r=Math.random();
  if (r<0.45) return makePlitshon("aquon", randInt(3,6));
  if (r<0.8)  return makePlitshon("stonk", randInt(4,7));
  return makePlitshon("flamix", randInt(3,6));
}

// ---------- helpers ----------
function randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
function choice(a){ return a[Math.floor(Math.random()*a.length)]; }
function lighten(hex,amt=70){
  const r=Math.min(255,parseInt(hex.slice(1,3),16)+amt),
        g=Math.min(255,parseInt(hex.slice(3,5),16)+amt),
        b=Math.min(255,parseInt(hex.slice(5,7),16)+amt);
  return `rgb(${r},${g},${b})`;
}
function darken(hex,amt=60){
  const r=Math.max(0,parseInt(hex.slice(1,3),16)-amt),
        g=Math.max(0,parseInt(hex.slice(3,5),16)-amt),
        b=Math.max(0,parseInt(hex.slice(5,7),16)-amt);
  return `rgb(${r},${g},${b})`;
}

// ---------- Story ----------
const STORY_INTRO = [
  "Welcome to the TULIPA region — a land of canals, windmills and endless tulip fields.",
  "Professor van Dijk: Hello there! I study PLITSHON, the spirited creatures of our world.",
  "Professor van Dijk: Long ago, trainer and Plitshon roamed the polders together as friends.",
  "Professor van Dijk: You have no partner yet... but one is waiting for you out there.",
  "Professor van Dijk: Head south down ROUTE 1 to HET WOUD forest. Your adventure begins!",
];
const STORY_FIND_TRUK = [
  "In a quiet forest clearing, a small Plitshon sits all alone...",
  "It looks up at you with bright, curious eyes.",
  "This little TRUK has been waiting a long time for a friend.",
  "TRUK bounces happily — it wants to join your adventure!",
  "TRUK (Lv.1) joined your party!",
];
