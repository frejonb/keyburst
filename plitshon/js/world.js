// ============================================================
//  WORLD — game state, camera, render loop, HUD
// ============================================================
const STATE = { TITLE:"title", OVERWORLD:"overworld", DIALOG:"dialog", BATTLE:"battle", EVOLVE:"evolve", CUTSCENE:"cutscene", MENU:"menu" };

const PARTY_MAX = 6;

const game = {
  state: STATE.TITLE,
  player: {
    tx: 18, ty: 6,                 // tile coords (start in town, on main street)
    px: 18*TILE, py: 6*TILE,       // pixel coords (world space)
    dir: 2, frame: 0,
    moving:false, fromPx:0, fromPy:0, moveStart:0, stepParity:0,
  },
  party: [],                        // EMPTY — Truk is found later
  box: [],                          // overflow Plitshon (party full)
  eggs: [],                         // {speciesId, level, stepsLeft, totalSteps}
  items: { potion: 3 },
  steps: 0,
  lastHeal: { x:18, y:6 },          // respawn point (last doctor center / start)
  flags: { hasTruk:false, seenTall:false, trukTaken:false },
  alertTrainer: null,
  npcFrame: 0,
};

const camera = { x:0, y:0 };

const cvs = document.getElementById("overworld");
const ctx = cvs.getContext("2d");
ctx.imageSmoothingEnabled = false;

const STEP_MS = 150;               // time to walk one tile

let _time = 0;

function updateCamera(){
  const p = game.player;
  let cx = p.px + TILE/2 - cvs.width/2;
  let cy = p.py + TILE/2 - cvs.height/2;
  cx = Math.max(0, Math.min(cx, MW*TILE - cvs.width));
  cy = Math.max(0, Math.min(cy, MH*TILE - cvs.height));
  camera.x = cx; camera.y = cy;
}

function renderWorld(t){
  updateCamera();
  const ox = Math.floor(camera.x), oy = Math.floor(camera.y);

  // sky/base
  ctx.fillStyle = PAL.grassDk;
  ctx.fillRect(0,0,cvs.width,cvs.height);

  // visible tile range
  const x0 = Math.floor(ox/TILE), y0 = Math.floor(oy/TILE);
  const x1 = Math.min(MW-1, x0 + VW + 1), y1 = Math.min(MH-1, y0 + VH + 1);

  for(let y=Math.max(0,y0); y<=y1; y++){
    for(let x=Math.max(0,x0); x<=x1; x++){
      drawTileAt(ctx, MAP[y][x], x*TILE - ox, y*TILE - oy, t);
    }
  }

  // ----- collect entities for y-sorted draw -----
  const ents = [];
  for(const n of NPCS)      ents.push({ y:n.y, draw:()=>drawNPCFigure(ctx, n.x*TILE-ox, n.y*TILE-oy, n.dir, n.color) });
  for(const tr of TRAINERS) ents.push({ y:tr.y, draw:()=>drawTrainerEntity(tr, ox, oy) });
  if(!game.flags.trukTaken)
    ents.push({ y:TRUK_SPOT.y, draw:()=>drawOverworldCreature(ctx, TRUK_SPOT.x*TILE-ox, TRUK_SPOT.y*TILE-oy, "truk", t) });
  // player
  const p = game.player;
  ents.push({ y: p.py/TILE, draw:()=>drawPlayer(ctx, p.px-ox, p.py-oy, p.dir, p.frame) });

  ents.sort((a,b)=>a.y-b.y);
  for(const e of ents) e.draw();
}

function drawTrainerEntity(tr, ox, oy){
  ctx.save();
  if(tr.defeated) ctx.globalAlpha = 0.55;
  drawNPCFigure(ctx, tr.x*TILE-ox, tr.y*TILE-oy, tr.dir, tr.color);
  ctx.restore();
  if(!tr.defeated && game.alertTrainer===tr.id){
    const bx = tr.x*TILE-ox + TILE/2, by = tr.y*TILE-oy - 6;
    ctx.fillStyle="#FFE600"; ctx.strokeStyle=PAL.outline; ctx.lineWidth=2;
    ctx.font="bold 20px 'Courier New'"; ctx.textAlign="center";
    ctx.strokeText("!",bx,by); ctx.fillText("!",bx,by);
  }
}

// ---------- HUD ----------
function updateHUD(){
  const hud = document.getElementById("hud");
  if(game.party.length===0){
    document.getElementById("hudParty").style.display="none";
  } else {
    document.getElementById("hudParty").style.display="";
    const p = game.party[0];
    document.getElementById("hudName").textContent = p.name;
    document.getElementById("hudLv").textContent = "Lv."+p.level;
    const el=document.getElementById("hudHp");
    el.textContent = `${p.hp}/${p.maxHp}`;
    el.classList.toggle("low", p.hp < p.maxHp*0.25);
  }
  const defeated = TRAINERS.filter(t=>t.defeated).length;
  const g=document.getElementById("hudGoal");
  g.textContent = `BADGES ${defeated}/3`;
  g.classList.toggle("done", defeated===3);
  // egg indicator
  const eg=document.getElementById("hudEgg");
  if(eg){
    if(game.eggs.length>0){ eg.style.display=""; eg.textContent=`🥚×${game.eggs.length}`; }
    else eg.style.display="none";
  }
}

// ---------- main loop ----------
function loop(t){
  _time = t;
  game.npcFrame = Math.floor(t/350)%2;

  // advance player walk tween
  const p = game.player;
  if(p.moving){
    const prog = Math.min(1, (t - p.moveStart)/STEP_MS);
    p.px = p.fromPx + (p.tx*TILE - p.fromPx)*prog;
    p.py = p.fromPy + (p.ty*TILE - p.fromPy)*prog;
    p.frame = p.stepParity ? 1 : 2;
    if(prog>=1){
      p.moving=false; p.px=p.tx*TILE; p.py=p.ty*TILE; p.frame=0;
      p.stepParity ^= 1;
      onArrive();
    }
  }

  if(game.state===STATE.OVERWORLD || game.state===STATE.DIALOG || game.state===STATE.CUTSCENE || game.state===STATE.MENU){
    renderWorld(t);
  }
  requestAnimationFrame(loop);
}
