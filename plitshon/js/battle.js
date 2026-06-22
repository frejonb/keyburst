// ============================================================
//  BATTLE — turn-based state machine with animated sprites
// ============================================================
const battleEl = document.getElementById("battle");
const enemyCv  = document.getElementById("enemySprite");
const playerCv = document.getElementById("playerSprite");
const enemyCtx = enemyCv.getContext("2d");
const playerCtx= playerCv.getContext("2d");
enemyCtx.imageSmoothingEnabled=false; playerCtx.imageSmoothingEnabled=false;

const BattlePhase = { SELECT:"select", BUSY:"busy" };

const battle = {
  enemy:null, enemyParty:null, enemyIndex:0, trainer:null, player:null,
  phase:BattlePhase.SELECT, selIndex:0, logLines:[],
};

// animation state
const banim = {
  running:false, t0:0,
  enemyDX:0, playerDX:0, enemyDY:0, playerDY:0,
  enemyFlash:0, playerFlash:0,
  enemyIn:0, playerIn:0,   // slide-in progress 0..1
};

function logMsg(msg){
  battle.logLines.push(msg);
  if(battle.logLines.length>3) battle.logLines.shift();
  document.getElementById("battleLog").innerHTML =
    battle.logLines.map(l=>`<div class="logline">${l}</div>`).join("");
}

function beginBattle(enemy, trainer, enemyParty){
  battle.enemy=enemy; battle.trainer=trainer;
  battle.enemyParty=enemyParty||[enemy]; battle.enemyIndex=0;
  battle.player=game.party[0];
  battle.phase=BattlePhase.BUSY; battle.selIndex=0; battle.logLines=[];
  battle.player.def=battle.player.baseDef; enemy.def=enemy.baseDef;

  game.state=STATE.BATTLE;
  battleEl.classList.add("show");

  banim.enemyIn=0; banim.playerIn=0; banim.enemyDX=0; banim.playerDX=0;
  banim.enemyDY=0; banim.playerDY=0; banim.enemyFlash=0; banim.playerFlash=0;
  startBattleAnim();

  renderBattle();
  logMsg(trainer ? `${trainer.name} sent out ${enemy.name}!` : `A wild ${enemy.name} appeared!`);

  // slide-in then enable select
  setTimeout(()=>{ battle.phase=BattlePhase.SELECT; renderMoves(); }, 700);
}

// ---------- battle render loop ----------
function startBattleAnim(){
  if(banim.running) return;
  banim.running=true; banim.t0=performance.now();
  requestAnimationFrame(battleFrame);
}
function battleFrame(t){
  if(game.state!==STATE.BATTLE && game.state!==STATE.EVOLVE){ banim.running=false; return; }
  // ease slide-in
  banim.enemyIn  = Math.min(1, banim.enemyIn + 0.06);
  banim.playerIn = Math.min(1, banim.playerIn + 0.06);
  banim.enemyFlash  = Math.max(0, banim.enemyFlash - 0.08);
  banim.playerFlash = Math.max(0, banim.playerFlash - 0.08);
  banim.enemyDX  *= 0.8; banim.playerDX *= 0.8; banim.enemyDY*=0.8; banim.playerDY*=0.8;

  if(game.state===STATE.BATTLE) drawBattleSprites(t);
  requestAnimationFrame(battleFrame);
}
function drawBattleSprites(t){
  // enemy
  enemyCtx.clearRect(0,0,enemyCv.width,enemyCv.height);
  const eEase = 1-Math.pow(1-banim.enemyIn,3);
  const ex = enemyCv.width/2 + (1-eEase)*120 + banim.enemyDX;
  const ey = enemyCv.height/2 + banim.enemyDY;
  enemyCtx.save(); enemyCtx.globalAlpha=eEase;
  if(battle.enemy) drawCreature(enemyCtx, ex, ey-6, enemyCv.width*0.30, battle.enemy.speciesId, t);
  enemyCtx.restore();
  if(banim.enemyFlash>0){ enemyCtx.save(); enemyCtx.globalAlpha=banim.enemyFlash*0.8; enemyCtx.fillStyle="#fff"; enemyCtx.fillRect(0,0,enemyCv.width,enemyCv.height); enemyCtx.restore(); }

  // player (faces right, flipped)
  playerCtx.clearRect(0,0,playerCv.width,playerCv.height);
  const pEase = 1-Math.pow(1-banim.playerIn,3);
  const pxc = playerCv.width/2 - (1-pEase)*120 + banim.playerDX;
  const pyc = playerCv.height/2 + banim.playerDY;
  playerCtx.save(); playerCtx.globalAlpha=pEase;
  if(battle.player) drawCreature(playerCtx, pxc, pyc-4, playerCv.width*0.30, battle.player.speciesId, t, {flip:true});
  playerCtx.restore();
  if(banim.playerFlash>0){ playerCtx.save(); playerCtx.globalAlpha=banim.playerFlash*0.8; playerCtx.fillStyle="#fff"; playerCtx.fillRect(0,0,playerCv.width,playerCv.height); playerCtx.restore(); }
}

// ---------- UI render ----------
function renderBattle(){
  const e=battle.enemy, p=battle.player;
  document.getElementById("enemyName").textContent=e.name;
  document.getElementById("enemyLv").textContent="Lv."+e.level;
  setBar("enemyHpFill",e.hp,e.maxHp,true);
  document.getElementById("enemyHpText").textContent=`${Math.max(0,e.hp)}/${e.maxHp}`;

  document.getElementById("pName").textContent=p.name;
  document.getElementById("pLv").textContent="Lv."+p.level;
  setBar("pHpFill",p.hp,p.maxHp,true);
  document.getElementById("pHpText").textContent=`${Math.max(0,p.hp)}/${p.maxHp}`;
  setBar("pExpFill",p.exp,p.expNeeded,false);

  renderMoves();
}
function setBar(id,val,max,isHp){
  const el=document.getElementById(id);
  const pct=Math.max(0,Math.min(100,(val/max)*100));
  el.style.width=pct+"%";
  if(isHp){ el.classList.remove("low","mid"); if(val<max*0.25) el.classList.add("low"); else if(val<max*0.5) el.classList.add("mid"); }
}
function renderMoves(){
  const wrap=document.getElementById("moves"); wrap.innerHTML="";
  const sel = battle.phase===BattlePhase.SELECT;
  battle.player.moves.forEach((mv,i)=>{
    const b=document.createElement("div");
    b.className="movebtn"+(battle.selIndex===i?" sel":"")+(mv.pp<=0?" disabled":"");
    b.innerHTML=`<span class="mname">${mv.name}</span><span class="mpp">PP ${mv.pp}/${mv.maxPp}</span>`;
    b.onclick=()=>{ if(sel&&mv.pp>0){ battle.selIndex=i; playerMove(i); } };
    wrap.appendChild(b);
  });
  const flee=document.getElementById("fleeBtn");
  flee.classList.toggle("sel",battle.selIndex===4);
  flee.onclick=()=>{ if(battle.phase===BattlePhase.SELECT) doFlee(); };
}

// ---------- combat ----------
function calcDamage(name,att,def){
  const m=MOVES[name];
  return Math.max(1, Math.floor((m.power*att.atk)/def.def/5)+Math.floor(Math.random()*5));
}

function playerMove(idx){
  if(battle.phase!==BattlePhase.SELECT) return;
  const mv=battle.player.moves[idx];
  if(!mv||mv.pp<=0) return;
  battle.phase=BattlePhase.BUSY; mv.pp--;

  if(MOVES[mv.name].effect==="raise_def"){
    battle.player.def=Math.min(battle.player.baseDef*2,Math.floor(battle.player.def*1.3));
    logMsg(`${battle.player.name} used ${mv.name}! Defense rose!`);
    renderBattle(); setTimeout(enemyTurn,650); return;
  }
  // lunge
  banim.playerDX = 34;
  const dmg=calcDamage(mv.name,battle.player,battle.enemy);
  setTimeout(()=>{ battle.enemy.hp-=dmg; banim.enemyFlash=1; banim.enemyDX=-14; renderBattle(); }, 160);
  logMsg(`${battle.player.name} used ${mv.name}!`);
  setTimeout(()=>{
    logMsg(`${battle.enemy.name} took ${dmg} damage!`); renderBattle();
    if(battle.enemy.hp<=0){ battle.enemy.hp=0; renderBattle(); setTimeout(onEnemyFainted,650); }
    else setTimeout(enemyTurn,550);
  },560);
}

function enemyTurn(){
  if(battle.enemy.hp<=0) return;
  const e=battle.enemy;
  let pool=e.moves.filter(m=>m.pp>0); if(!pool.length) pool=e.moves;
  if(e.hp>e.maxHp*0.30){ const d=pool.filter(m=>MOVES[m.name].power>0); if(d.length) pool=d; }
  const mv=choice(pool); if(mv.pp>0) mv.pp--;

  if(MOVES[mv.name].effect==="raise_def"){
    e.def=Math.min(e.baseDef*2,Math.floor(e.def*1.3));
    logMsg(`${e.name} used ${mv.name}! Defense rose!`);
    renderBattle(); setTimeout(endTurn,650); return;
  }
  banim.enemyDX=-34;
  const dmg=calcDamage(mv.name,e,battle.player);
  setTimeout(()=>{ battle.player.hp-=dmg; banim.playerFlash=1; banim.playerDX=14; renderBattle(); },160);
  logMsg(`${e.name} used ${mv.name}!`);
  setTimeout(()=>{
    logMsg(`${battle.player.name} took ${dmg} damage!`); renderBattle();
    if(battle.player.hp<=0){ battle.player.hp=0; renderBattle(); setTimeout(onPlayerFainted,650); }
    else setTimeout(endTurn,550);
  },560);
}

function endTurn(){ battle.phase=BattlePhase.SELECT; battle.selIndex=0; renderMoves(); }

// ---------- win ----------
function onEnemyFainted(){
  const isTrainer=!!battle.trainer;
  const expGained=Math.floor(battle.enemy.level*15*(isTrainer?1.5:1));
  battle.player.exp+=expGained;
  banim.enemyIn=0; // fade out enemy

  let leveled=false, willEvo=false;
  while(battle.player.exp>=battle.player.expNeeded){
    battle.player.level++; battle.player.exp=0;
    recalcStats(battle.player);
    battle.player.hp=Math.min(battle.player.maxHp, battle.player.hp+Math.floor(battle.player.maxHp*0.20));
    leveled=true;
    const sp=SPECIES[battle.player.speciesId];
    if(sp.evolvesTo && battle.player.level>=sp.evolvesAt) willEvo=true;
  }
  renderBattle();

  if(isTrainer && battle.enemyIndex<battle.enemyParty.length-1){
    battle.enemyIndex++;
    const next=battle.enemyParty[battle.enemyIndex]; next.def=next.baseDef;
    const msgs=[`${battle.enemy.name} fainted!`, `${battle.player.name} gained ${expGained} EXP!`];
    if(leveled) msgs.push(`${battle.player.name} grew to Lv.${battle.player.level}!`);
    msgs.push(`${battle.trainer.name} sent out ${next.name}!`);
    afterBattleDialog(msgs, ()=>{
      battle.enemy=next; banim.enemyIn=0;
      battle.phase=BattlePhase.SELECT; battle.selIndex=0;
      game.state=STATE.BATTLE; battleEl.classList.add("show"); startBattleAnim();
      renderBattle();
      setTimeout(()=>{ banim.enemyIn=0; },10);
    });
    return;
  }

  const msgs=[`${battle.enemy.name} fainted!`, `${battle.player.name} gained ${expGained} EXP!`];
  if(leveled) msgs.push(`${battle.player.name} grew to Lv.${battle.player.level}!`);
  afterBattleDialog(msgs, ()=>{
    if(isTrainer){
      battle.trainer.defeated=true; game.alertTrainer=null;
      showDialog([battle.trainer.post], ()=> willEvo?doEvolution():endBattleReturn());
    } else {
      willEvo?doEvolution():endBattleReturn();
    }
  });
}

function onPlayerFainted(){
  afterBattleDialog([`${battle.player.name} fainted!`,"You scurry back to safety..."], ()=>{
    for(const p of game.party){ p.hp=Math.max(1,Math.floor(p.maxHp*0.5)); p.def=p.baseDef; }
    // return to town centre
    const gp=game.player; gp.tx=16; gp.ty=11; gp.px=16*TILE; gp.py=11*TILE; gp.dir=2; gp.moving=false;
    endBattleReturn();
  });
}

function doFlee(){
  if(battle.phase!==BattlePhase.SELECT) return;
  if(battle.trainer){ logMsg("You can't flee from a trainer battle!"); return; }
  battle.phase=BattlePhase.BUSY;
  if(Math.random()<0.7){ logMsg("Got away safely!"); setTimeout(endBattleReturn,650); }
  else { logMsg("Couldn't escape!"); setTimeout(enemyTurn,750); }
}

function afterBattleDialog(msgs, after){ battleEl.classList.remove("show"); showDialog(msgs, after); }
function endBattleReturn(){
  battleEl.classList.remove("show");
  game.state=STATE.OVERWORLD; game.alertTrainer=null;
  banim.running=false;
  updateHUD();
  if(TRAINERS.every(t=>t.defeated)) checkVictory();
}
