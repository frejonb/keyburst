// ============================================================
//  EVOLUTION — fade, flash, reveal with rainbow glow
// ============================================================
const evolveEl     = document.getElementById("evolve");
const evolveCv     = document.getElementById("evolveSprite");
const evolveCtx    = evolveCv.getContext("2d");
const evolveText   = document.getElementById("evolveText");
const evolveWrap   = document.getElementById("evolveSpriteWrap");
const evolvePrompt = document.getElementById("evolvePrompt");
evolveCtx.imageSmoothingEnabled=false;

let evolveDismissable=false;
let evoAnim={running:false, from:null, to:null, whiteness:0, t0:0};

function doEvolution(){
  const p=battle.player, sp=SPECIES[p.speciesId];
  const newId=sp.evolvesTo, newSp=SPECIES[newId];
  const oldName=p.name, oldHp=p.hp, oldMax=p.maxHp;

  game.state=STATE.EVOLVE;
  battleEl.classList.remove("show");
  evolveEl.classList.add("show");
  evolveWrap.classList.remove("rainbow");
  evolvePrompt.style.visibility="hidden";
  evolveText.classList.remove("flashing");
  evolveText.textContent="";
  evolveDismissable=false;

  evoAnim={running:true, from:p.speciesId, to:newId, whiteness:0, t0:performance.now(), phase:0};
  requestAnimationFrame(evoFrame);

  setTimeout(()=>{ evoAnim.phase=1; evolveText.textContent=`${oldName} is evolving!`; evolveText.classList.add("flashing"); },1100);

  // apply changes
  p.speciesId=newId; p.name=newSp.name; p.color=newSp.color;
  p.moves=newSp.moves.map(m=>({name:m,pp:MOVES[m].pp,maxPp:MOVES[m].pp}));
  recalcStats(p);
  p.hp=Math.max(1,Math.floor(p.maxHp*(oldHp/oldMax)));

  setTimeout(()=>{
    evoAnim.phase=2;
    evolveText.classList.remove("flashing");
    evolveText.textContent=`${oldName} evolved into ${newSp.name}!`;
    evolveWrap.classList.add("rainbow");
    evolvePrompt.style.visibility="visible";
    evolveDismissable=true;
  },3200);
}

function evoFrame(t){
  if(game.state!==STATE.EVOLVE){ evoAnim.running=false; return; }
  const w=evolveCv.width, h=evolveCv.height;
  evolveCtx.clearRect(0,0,w,h);
  const species = evoAnim.phase>=2 ? evoAnim.to : evoAnim.from;
  drawCreature(evolveCtx, w/2, h/2, w*0.30, species, t);
  // whiteness during phase 1
  let white = 0;
  if(evoAnim.phase===1) white = 0.85;
  else if(evoAnim.phase===0) white = Math.min(0.6,(t-evoAnim.t0)/1100*0.6);
  if(white>0){ evolveCtx.save(); evolveCtx.globalAlpha=white; evolveCtx.fillStyle="#fff"; evolveCtx.fillRect(0,0,w,h); evolveCtx.restore(); }
  requestAnimationFrame(evoFrame);
}

function dismissEvolution(){
  if(!evolveDismissable) return;
  evolveDismissable=false; evoAnim.running=false;
  evolveEl.classList.remove("show");
  evolveWrap.classList.remove("rainbow");
  endBattleReturn();
}
