// ============================================================
//  MAIN — title, scaling, touch controls, victory, boot
// ============================================================

function rescale(){
  const scale = window.innerWidth / 640;
  const stage=document.getElementById("stage"), wrap=document.getElementById("stageWrap");
  stage.style.transform=`scale(${scale})`;
  wrap.style.height=Math.ceil(480*scale)+"px";
}

function startGame(){
  document.getElementById("title").classList.remove("show");
  game.state=STATE.OVERWORLD;
  audioStart(); setMusic("field");
  showDialog(STORY_INTRO);
}

function checkVictory(){
  if(!TRAINERS.every(t=>t.defeated)) return;
  showDialog([
    "The three trainers tip their caps to you.",
    "Word spreads across every polder and canal...",
    "YOU ARE THE TULIPA REGION CHAMPION!",
    "Professor van Dijk: And to think it began with one lonely Truk. Gefeliciteerd!",
  ]);
}

// ---- touch / click controls ----
function pressContext(){
  if(game.state===STATE.TITLE)   { startGame(); return; }
  if(game.state===STATE.MENU)    { closeMenu(); return; }
  if(game.state===STATE.EVOLVE)  { dismissEvolution(); return; }
  if(game.state===STATE.DIALOG||game.state===STATE.CUTSCENE){ advanceDialog(); return; }
  if(game.state===STATE.OVERWORLD){ interact(); return; }
  if(game.state===STATE.BATTLE && battle.phase===BattlePhase.SELECT){
    if(battle.selIndex===4) doFlee();
    else { const mv=battle.player.moves[battle.selIndex]; if(mv&&mv.pp>0) playerMove(battle.selIndex); }
  }
}

function setupTouch(){
  document.querySelectorAll(".dpad-btn[data-dir]").forEach(btn=>{
    const dir=+btn.dataset.dir;
    let held=false;
    const down=e=>{ e.preventDefault(); held=true; const step=()=>{ if(!held)return; if(game.state===STATE.OVERWORLD) requestMove(dir); setTimeout(step,90); }; step(); };
    const up=e=>{ held=false; };
    btn.addEventListener("touchstart",down,{passive:false});
    btn.addEventListener("touchend",up); btn.addEventListener("touchcancel",up);
    btn.addEventListener("mousedown",down); window.addEventListener("mouseup",up);
  });
  const ok=document.getElementById("dpad-action");
  const okFire=e=>{ e.preventDefault(); pressContext(); };
  ok.addEventListener("touchstart",okFire,{passive:false});
  ok.addEventListener("mousedown",okFire);

  document.getElementById("title").addEventListener("click", ()=>{ if(game.state===STATE.TITLE) startGame(); });
  document.getElementById("dialog").addEventListener("click", ()=>{ if(game.state===STATE.DIALOG||game.state===STATE.CUTSCENE) advanceDialog(); });

  // MENU / BAG button
  const mb=document.getElementById("menuBtn");
  const mbFire=e=>{ e.preventDefault(); toggleMenu(); };
  mb.addEventListener("touchstart",mbFire,{passive:false}); mb.addEventListener("mousedown",mbFire);
  // close button inside menu
  document.getElementById("menuClose").addEventListener("click", closeMenu);
  // mute
  document.getElementById("muteBtn").addEventListener("click", ()=>{ audioStart(); toggleMute(); });
}

function syncDpad(){
  const hide = game.state===STATE.BATTLE||game.state===STATE.EVOLVE;
  document.getElementById("dpad").style.display = hide?"none":"flex";
  const mb=document.getElementById("menuBtn");
  if(mb) mb.style.display = (game.state===STATE.OVERWORLD||game.state===STATE.MENU)?"":"none";
}
setInterval(syncDpad,150);

// ---- title canvas ----
function drawTitle(){
  const c=document.getElementById("titleCanvas"), x=c.getContext("2d");
  x.imageSmoothingEnabled=false;
  let f=0;
  (function anim(t){
    if(game.state!==STATE.TITLE) return;
    x.clearRect(0,0,c.width,c.height);
    // mascots bobbing
    drawCreature(x, c.width/2-70, c.height/2+10, 26, "truk", t);
    drawCreature(x, c.width/2+70, c.height/2+14, 24, "flamix", t+400);
    requestAnimationFrame(anim);
  })(0);
}

function init(){
  rescale();
  window.addEventListener("resize", rescale);
  setupTouch();
  updateHUD();
  requestAnimationFrame(loop);
  drawTitle();
}
init();
