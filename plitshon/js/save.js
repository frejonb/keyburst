// ============================================================
//  SAVE — localStorage persistence
// ============================================================
const SAVE_KEY = "plitshon_save_v1";

function hasSave(){
  try { return !!localStorage.getItem(SAVE_KEY); } catch(e){ return false; }
}

function saveGame(){
  try {
    const snap = {
      v:1,
      ts: Date.now(),
      player: { tx:game.player.tx, ty:game.player.ty, dir:game.player.dir },
      party: game.party,
      box: game.box,
      eggs: game.eggs,
      items: game.items,
      steps: game.steps,
      lastHeal: game.lastHeal,
      flags: game.flags,
      trainers: TRAINERS.map(t=>t.defeated),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(snap));
    return true;
  } catch(e){ return false; }
}

function loadGame(){
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if(!raw) return false;
    const s = JSON.parse(raw);

    game.party = s.party || [];
    game.box   = s.box   || [];
    game.eggs  = s.eggs  || [];
    game.items = s.items || { potion:0 };
    game.steps = s.steps || 0;
    game.lastHeal = s.lastHeal || { x:18, y:6 };
    game.flags = Object.assign({ hasTruk:false, seenTall:false, trukTaken:false }, s.flags||{});

    const p = game.player;
    p.tx = s.player.tx; p.ty = s.player.ty; p.dir = s.player.dir;
    p.px = p.tx*TILE; p.py = p.ty*TILE; p.moving=false; p.frame=0;

    if(Array.isArray(s.trainers)) TRAINERS.forEach((t,i)=>{ t.defeated = !!s.trainers[i]; });

    game.cutsceneTruk = false;
    game.fx = [];
    return true;
  } catch(e){ return false; }
}

function deleteSave(){ try { localStorage.removeItem(SAVE_KEY); } catch(e){} }

// Continue from a save: hide title, resume overworld
function continueGame(){
  if(!loadGame()) return false;
  document.getElementById("title").classList.remove("show");
  game.state = STATE.OVERWORLD;
  audioStart(); setMusic("field");
  updateHUD();
  showDialog(["Welcome back to the TULIPA region!"]);
  return true;
}
