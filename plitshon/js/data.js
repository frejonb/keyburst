// ============================================================
//  PLITSHON — data: palette, species, moves, map, world entities
//  Setting: the TULIPA region (inspired by the Netherlands)
// ============================================================

// ---------- Canvas palette ----------
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
  cRoof:"#E2453C", cRoofDk:"#B5302A",
  door:"#6B4326", window:"#8FD3E8",
  millBody:"#D9C39A", millDk:"#B89C6E", millBlade:"#6B4326",
  tRed:"#E2453C", tRedDk:"#B5302A", tYel:"#F2C32E", tYelDk:"#C99C1C",
  tPink:"#E87FB0", stem:"#3C7A29",
  fence:"#B89A6E", fenceDk:"#947A52",
  cheese:"#F2C84B", cheeseDk:"#D6A82E",
  outline:"#2A2433", shadow:"rgba(0,0,0,0.18)",
};

// ---------- Tile ids ----------
const T_GRASS=0,T_TALL=1,T_PATH=2,T_WATER=3,T_TREE=4,
      T_TULR=5,T_TULY=6,T_WALL=7,T_ROOF=8,T_MILL=9,
      T_FLOWER=10,T_SIGN=11,T_BRIDGE=12,T_SAND=13,T_FENCE=14,T_DOOR=15,
      T_CROOF=16, T_CDOOR=17;   // Doctor-center roof (with cross) & its door

const WALKABLE = {[T_GRASS]:1,[T_TALL]:1,[T_PATH]:1,[T_FLOWER]:1,[T_BRIDGE]:1,[T_SAND]:1,[T_DOOR]:1,[T_CDOOR]:1};
function isWalkable(id){ return !!WALKABLE[id]; }

// ---------- Map dimensions ----------
const TILE=32;
const MW=40, MH=46;
const VW=20, VH=15;

// recorded special doors
const DOCTOR_DOORS = new Set();

// ---------- Map builder ----------
function buildMap(){
  const m=[];
  for(let y=0;y<MH;y++) m.push(new Array(MW).fill(T_GRASS));
  const inb=(x,y)=>x>=0&&y>=0&&x<MW&&y<MH;
  const rect=(x,y,w,h,id)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)if(inb(i,j))m[j][i]=id;};
  const put=(x,y,id)=>{if(inb(x,y))m[y][x]=id;};

  // border
  rect(0,0,MW,2,T_TREE); rect(0,MH-2,MW,2,T_TREE);
  rect(0,0,2,MH,T_TREE); rect(MW-2,0,2,MH,T_TREE);

  // main vertical street connecting everything
  rect(18,4,2,MH-6,T_PATH);

  // === TULPENBURG (start town) y2..15 ===
  rect(2,3,MW-4,2,T_WATER);          // canal
  rect(18,3,2,2,T_BRIDGE);           // bridge
  rect(3,6,MW-6,4,T_PATH);           // plaza
  function house(x,y,roof){ rect(x,y,3,1,roof); rect(x,y+1,3,2,T_WALL); put(x+1,y+2, roof===T_CROOF?T_CDOOR:T_DOOR); if(roof===T_CROOF) DOCTOR_DOORS.add((x+1)+","+(y+2)); }
  house(4,7,T_ROOF);                 // player house
  // lab (wide)
  rect(9,6,5,1,T_ROOF); rect(9,7,5,3,T_WALL); put(11,9,T_DOOR);
  // DOCTOR CENTER (red cross)
  house(24,7,T_CROOF);
  house(30,7,T_ROOF);
  put(33,5,T_MILL);                  // windmill
  put(7,10,T_FLOWER); put(15,10,T_FLOWER); put(28,10,T_FLOWER); put(22,6,T_FLOWER);
  put(16,6,T_SIGN);                  // town sign
  put(20,13,T_SIGN);                 // route sign

  // === ROUTE 1 (tulip country) y16..25 ===
  function field(x,y,w,h){ for(let j=0;j<h;j++)for(let i=0;i<w;i++) put(x+i,y+j, ((i+j)%2===0)?T_TULR:T_TULY); }
  field(4,17,5,3); field(28,17,6,4);
  put(11,18,T_TREE); put(25,16,T_TREE); put(9,22,T_TREE); put(31,23,T_TREE);
  rect(6,21,6,3,T_TALL); rect(24,22,6,3,T_TALL);
  rect(14,18,5,1,T_PATH);            // little branch
  put(13,20,T_FLOWER); put(27,19,T_FLOWER);

  // === HET WOUD (forest) y26..35 ===
  rect(3,26,6,2,T_TREE); rect(MW-8,26,6,2,T_TREE);
  rect(3,28,2,6,T_TREE); rect(MW-4,28,2,6,T_TREE);
  put(8,29,T_TREE); put(10,31,T_TREE); put(30,29,T_TREE); put(28,32,T_TREE);
  rect(21,29,6,4,T_GRASS);            // grove
  put(22,30,T_FLOWER); put(25,31,T_FLOWER); put(23,32,T_FLOWER);
  rect(28,33,3,2,T_WATER);            // pond
  rect(5,30,4,3,T_TALL); rect(11,33,5,2,T_TALL);

  // === KAASDORP (second village) y36..44 ===
  rect(2,35,MW-4,1,T_FENCE);          // dike fence line
  rect(3,40,MW-6,3,T_PATH);
  house(6,38,T_ROOF);
  // 2nd DOCTOR CENTER
  house(12,38,T_CROOF);
  // cheese-themed houses
  rect(26,37,3,1,T_ROOF); rect(26,38,3,2,T_WALL); put(27,39,T_DOOR);
  rect(31,37,3,1,T_ROOF); rect(31,38,3,2,T_WALL); put(32,39,T_DOOR);
  rect(22,42,4,2,T_WATER);            // small harbour
  put(9,42,T_FLOWER); put(20,41,T_FLOWER); put(35,41,T_FLOWER);
  put(16,40,T_SIGN);
  rect(6,43,5,2,T_TALL);

  // === GUARANTEE CONNECTIVITY ===
  // Re-stamp the main vertical road last so nothing (fences, fields,
  // canal edges) can ever seal off a region. This keeps every area reachable.
  rect(18,4,2,MH-6,T_PATH);
  // open a clear gate through the Kaasdorp dike fence either side of the road
  put(17,35,T_PATH); put(20,35,T_GRASS);

  return m;
}
let MAP = buildMap();

// ---------- Directions ----------
const DX=[0,1,0,-1], DY=[-1,0,1,0];

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

// ---------- Trainers (gentle, ramping difficulty) ----------
const TRAINERS = [
  { id:0, x:15, y:20, dir:1, name:"Bram",  color:"#E8772E",
    party:[makePlitshon("flamix",3)], defeated:false,
    pre:"Bram: Welkom on Route 1! A quick match, ja?", post:"Bram: Sterk! You ride like the wind." },
  { id:1, x:15, y:31, dir:1, name:"Joris", color:"#B14BE0",
    party:[makePlitshon("glitx",6)], defeated:false,
    pre:"Joris: The old windmill hums with static...", post:"Joris: Ongelooflijk! The Grid chose well." },
  { id:2, x:15, y:40, dir:1, name:"Femke", color:"#3FB5E2",
    party:[makePlitshon("aquon",7),makePlitshon("stonk",8)], defeated:false,
    pre:"Femke: In Kaasdorp we battle for the cheese!", post:"Femke: Goed gedaan, Champion!" },
];

// ---------- NPCs ----------
const NPCS = [
  { x:15, y:9, dir:2, color:"#C94F8B",
    lines:["Tulpenburg's tulips bloom brightest in spring!","A lonely Plitshon is said to wait in HET WOUD, far to the south."] },
  { x:28, y:9, dir:2, color:"#4F7AC9",
    lines:["See the red cross? That's the DOCTOR CENTER.","Step inside any time to heal your tired Plitshon — it's free!"] },
  { x:11, y:11, dir:2, color:"#5BA34F",
    lines:["Professor van Dijk: When a wild Plitshon faints, it leaves an EGG.","Carry it as you walk and it will hatch into a new friend!"] },
  { x:27, y:31, dir:3, color:"#7A5230",
    lines:["A ranger: Deeper south lies KAASDORP, the cheese village.","Strong trainers gather there. Heal up before you go!"] },
];

// ---------- Signs ----------
const SIGNS = {
  "16,6":"TULPENBURG\nTown of Tulips & Mills",
  "20,13":"ROUTE 1 — south to HET WOUD.\nTall grass ahead!",
  "16,40":"Welcome to KAASDORP\nThe Cheese Village",
};

// ---------- The lonely Truk (grove) ----------
const TRUK_SPOT = { x:24, y:31 };

// ---------- Wild encounters (gentle early, tougher south) ----------
function rollWildSpecies(px,py){
  if (py>=36) return choice([makePlitshon("glitx",randInt(7,10)), makePlitshon("stonk",randInt(7,9))]);
  if (py>=26) return choice([makePlitshon("glitx",randInt(4,6)), makePlitshon("flamix",randInt(4,6))]);
  // route 1 — easy
  const r=Math.random();
  if (r<0.45) return makePlitshon("aquon", randInt(2,4));
  if (r<0.8)  return makePlitshon("flamix", randInt(2,4));
  return makePlitshon("stonk", randInt(3,5));
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
  "Professor van Dijk: You have no partner yet... but one is waiting for you out there.",
  "Professor van Dijk: Head south down ROUTE 1 to HET WOUD forest. Your adventure begins!",
  "TIP: Heal at any DOCTOR CENTER (red cross). Open your BAG with the MENU button.",
];
const STORY_FIND_TRUK = [
  "In a quiet forest clearing, a small Plitshon sits all alone...",
  "It looks up at you with bright, curious eyes.",
  "This little TRUK has waited a long time for a friend.",
  "TRUK bounces happily — it wants to join your adventure!",
  "TRUK (Lv.1) joined your party!",
];
