// ============================================================
//  FORGEMON — runtime game state + inventory + crafting logic
// ============================================================
window.GAME = {
  party: [],
  inventory: { blocks:{}, items:{} },
  flags: { intro:false },
};

function newGame(){
  GAME.party = [ makeMonster('emberling', CONFIG.START_PARTY_LEVEL) ];
  GAME.inventory = {
    // a small starter kit so crafting is testable immediately
    blocks: { ember:2, aqua:2, terra:1, volt:1, verdant:1, core:1 },
    items:  { potion:3 },
  };
  GAME.flags = { intro:false, seenBattle:false, seenLoot:false, seenForge:false };
}
window.newGame = newGame;

// ---------- inventory helpers ----------
function addBlock(id, n=1){ GAME.inventory.blocks[id] = (GAME.inventory.blocks[id]||0)+n; }
function addItem(id, n=1){ GAME.inventory.items[id] = (GAME.inventory.items[id]||0)+n; }
function blockCount(id){ return GAME.inventory.blocks[id]||0; }
function itemCount(id){ return GAME.inventory.items[id]||0; }
function applyLoot(drops){
  for(const id in drops.blocks) addBlock(id, drops.blocks[id]);
  for(const id in drops.items)  addItem(id, drops.items[id]);
}
window.addBlock=addBlock; window.addItem=addItem;
window.blockCount=blockCount; window.itemCount=itemCount;
window.applyLoot=applyLoot;

// ---------- party helpers ----------
function partyFull(){ return GAME.party.length >= CONFIG.PARTY_MAX; }
function addMonster(m){
  if(partyFull()) return false;
  GAME.party.push(m); return true;
}
function leadMonster(){
  return GAME.party.find(m=>m.hp>0) || GAME.party[0];
}
function healParty(){ GAME.party.forEach(m=>{ m.hp=m.maxHp; m.moves.forEach(mv=>mv.pp=mv.maxPp); }); }
function anyAlive(){ return GAME.party.some(m=>m.hp>0); }
window.partyFull=partyFull; window.addMonster=addMonster;
window.leadMonster=leadMonster; window.healParty=healParty; window.anyAlive=anyAlive;

// ============================================================
//  CRAFTING
//  All three modes funnel into spendAndCreate(...) so the rest of
//  the game doesn't care which mode is active.
// ============================================================

// spend a {blockId:count} map; returns false if not affordable
function canAfford(cost){
  for(const id in cost){ if(blockCount(id) < cost[id]) return false; }
  return true;
}
function spend(cost){
  for(const id in cost) GAME.inventory.blocks[id] -= cost[id];
}
window.canAfford=canAfford;

// ---- Mode A: fixed recipes ----
function craftRecipe(recipe){
  if(!canAfford(recipe.blocks)) return { ok:false, msg:'Not enough blocks.' };
  if(partyFull()) return { ok:false, msg:'Your party is full (max '+CONFIG.PARTY_MAX+').' };
  spend(recipe.blocks);
  const m = makeMonster(recipe.species, recipe.level);
  addMonster(m);
  return { ok:true, monster:m };
}
window.craftRecipe = craftRecipe;

// ---- Mode B: element + quantity ----
// counts: {ember:n, aqua:n, ...} of element blocks the player commits.
// dominant element -> species; total element blocks -> level; a Beast Core
// (if included) unlocks the tier-2 form of the dominant element.
function craftElement(counts, useCore){
  const total = ELEMENT_BLOCKS.reduce((s,el)=> s + (counts[el]||0), 0);
  if(total < 2) return { ok:false, msg:'Commit at least 2 element blocks.' };
  if(partyFull()) return { ok:false, msg:'Your party is full.' };
  // affordability
  const cost = {};
  for(const el in counts){ if(counts[el]>0) cost[el] = counts[el]; }
  if(useCore) cost.core = 1;
  if(!canAfford(cost)) return { ok:false, msg:'Not enough blocks.' };
  if(useCore && blockCount('core')<1) return { ok:false, msg:'Need a Beast Core.' };

  // dominant element
  let dom = ELEMENT_BLOCKS[0], best=-1;
  for(const el of ELEMENT_BLOCKS){ if((counts[el]||0)>best){ best=counts[el]||0; dom=el; } }

  const tier2 = useCore && total>=4;
  const species = tier2 ? TIER2_BY_ELEMENT[dom] : TIER1_BY_ELEMENT[dom];
  // level scales with how much you poured in
  let level = Math.max(3, Math.round(total*1.8) + (tier2?6:0));
  level = Math.min(level, 30);

  spend(cost);
  const m = makeMonster(species, level);
  addMonster(m);
  return { ok:true, monster:m };
}
window.craftElement = craftElement;

// ---- Mode C: slot assembly ----
// slots = { element:<elBlockId|null>, core:<'core'|'prime'|null>, trait:<elBlockId|null> }
// element slot  -> species element (required)
// core slot     -> body tier: none=tier1, core=tier1 buffed, prime=tier2
// trait slot    -> grants a stat lean + bonus level
function craftSlots(slots){
  if(!slots.element) return { ok:false, msg:'Place an element block in the ELEMENT slot.' };
  if(partyFull()) return { ok:false, msg:'Your party is full.' };

  const cost = {};
  cost[slots.element] = (cost[slots.element]||0) + 1;
  if(slots.core) cost[slots.core] = (cost[slots.core]||0) + 1;
  if(slots.trait) cost[slots.trait] = (cost[slots.trait]||0) + 1;
  if(!canAfford(cost)) return { ok:false, msg:'Not enough blocks.' };

  const el = BLOCKS[slots.element].element;
  const tier2 = slots.core === 'prime';
  const species = tier2 ? TIER2_BY_ELEMENT[el] : TIER1_BY_ELEMENT[el];

  let level = 6;
  if(slots.core==='core') level += 4;
  if(slots.core==='prime') level += 10;
  if(slots.trait) level += 3;
  level = Math.min(level, 30);

  spend(cost);
  const m = makeMonster(species, level);
  // trait: a matching-element trait block leans attack, off-element leans defense
  if(slots.trait){
    const tEl = BLOCKS[slots.trait].element;
    if(tEl===el){ m.atk = Math.round(m.atk*1.15); m.trait='Fierce'; }
    else { m.def = Math.round(m.def*1.15); m.baseDef=m.def; m.trait='Sturdy'; }
  }
  addMonster(m);
  return { ok:true, monster:m };
}
window.craftSlots = craftSlots;
