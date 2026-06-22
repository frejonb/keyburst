// ============================================================
//  MOVEMENT — smooth stepping, triggers, interaction
// ============================================================

function tileBlockedByEntity(tx,ty){
  if(NPCS.some(n=>n.x===tx&&n.y===ty)) return true;
  if(TRAINERS.some(t=>t.x===tx&&t.y===ty)) return true;
  if(!game.flags.trukTaken && TRUK_SPOT.x===tx && TRUK_SPOT.y===ty) return true;
  return false;
}

// Called by input: attempt to walk/turn in a direction
function requestMove(dir){
  const p = game.player;
  if(game.state!==STATE.OVERWORLD || p.moving) return;
  p.dir = dir;
  const nx = p.tx + DX[dir], ny = p.ty + DY[dir];

  let blocked = false;
  if(nx<0||ny<0||nx>=MW||ny>=MH) blocked=true;
  else if(!isWalkable(MAP[ny][nx])) blocked=true;
  else if(tileBlockedByEntity(nx,ny)) blocked=true;

  if(blocked){
    // bumping a door/sign in front: allow OK-style read on bump? keep silent.
    return;
  }
  // begin tween
  p.fromPx = p.px; p.fromPy = p.py;
  p.tx = nx; p.ty = ny;
  p.moveStart = _time;
  p.moving = true;
}

// Called when a step completes
function onArrive(){
  const p = game.player;
  // step bookkeeping: advance eggs
  game.steps++;
  tickEggs();

  // enter a Doctor Center
  if(MAP[p.ty][p.tx]===T_CDOOR){ enterDoctorCenter(); return; }

  // 1) find Truk if adjacent to the grove creature
  if(!game.flags.trukTaken && manhattan(p.tx,p.ty,TRUK_SPOT.x,TRUK_SPOT.y)===1){
    faceToward(p, TRUK_SPOT.x, TRUK_SPOT.y);
    findTruk();
    return;
  }
  // 2) trainer line-of-sight
  const tr = trainerSeesPlayer();
  if(tr){
    game.alertTrainer = tr.id;
    startTrainerEncounter(tr);
    return;
  }
  // 3) wild encounter on tall grass
  if(MAP[p.ty][p.tx]===T_TALL){
    if(!game.flags.hasTruk){
      if(!game.flags.seenTall){
        game.flags.seenTall=true;
        showDialog(["The grass rustles... but you have no Plitshon yet.","Better find a partner before exploring here!"]);
      }
      return;
    }
    if(Math.random()<0.22){ startWildEncounter(); return; }
  }
  updateHUD();
}

function manhattan(x1,y1,x2,y2){ return Math.abs(x1-x2)+Math.abs(y1-y2); }
function faceToward(p,tx,ty){
  if(tx>p.tx)p.dir=1; else if(tx<p.tx)p.dir=3; else if(ty>p.ty)p.dir=2; else p.dir=0;
}

// trainer LOS: player stands in front of trainer within 4 clear tiles
function trainerSeesPlayer(){
  if(!game.flags.hasTruk) return null;     // no battles before you have a partner
  const p=game.player;
  for(const tr of TRAINERS){
    if(tr.defeated) continue;
    for(let d=1; d<=4; d++){
      const sx=tr.x+DX[tr.dir]*d, sy=tr.y+DY[tr.dir]*d;
      if(sx<0||sy<0||sx>=MW||sy>=MH) break;
      if(!isWalkable(MAP[sy][sx])) break;          // wall blocks sight
      if(p.tx===sx && p.ty===sy) return tr;
      if(tileBlockedByEntity(sx,sy)) break;
    }
  }
  return null;
}

// ---------- Interaction (OK / A button facing a tile) ----------
function interact(){
  if(game.state!==STATE.OVERWORLD) return;
  const p=game.player;
  const fx=p.tx+DX[p.dir], fy=p.ty+DY[p.dir];

  // Truk
  if(!game.flags.trukTaken && fx===TRUK_SPOT.x && fy===TRUK_SPOT.y){ findTruk(); return; }
  // NPC
  const npc=NPCS.find(n=>n.x===fx&&n.y===fy);
  if(npc){ showDialog(npc.lines.slice()); return; }
  // Trainer
  const tr=TRAINERS.find(t=>t.x===fx&&t.y===fy);
  if(tr){
    if(tr.defeated) showDialog([tr.post]);
    else if(!game.flags.hasTruk) showDialog([`${tr.name}: Come back when you have a Plitshon of your own!`]);
    else { game.alertTrainer=tr.id; startTrainerEncounter(tr); }
    return;
  }
  // Sign
  if(MAP[fy] && MAP[fy][fx]===T_SIGN){
    const key=fx+","+fy;
    showDialog([SIGNS[key]||"A weathered signpost."]);
    return;
  }
  // Doctor Center door
  if(MAP[fy] && MAP[fy][fx]===T_CDOOR){ enterDoctorCenter(); return; }
  // Door
  if(MAP[fy] && MAP[fy][fx]===T_DOOR){ showDialog(["The door is locked. Maybe later."]); return; }
}

// ---------- Doctor Center ----------
function enterDoctorCenter(){
  game.lastHeal = { x:game.player.tx, y:game.player.ty };
  const needsHeal = game.party.some(p=>p.hp<p.maxHp);
  const msgs = [
    "You step into the DOCTOR CENTER.",
    "Nurse Tineke: Welcome! Let me take your Plitshon.",
  ];
  if(game.party.length===0) msgs.push("Nurse Tineke: ...Oh, you have none yet! Come back soon.");
  else msgs.push("Nurse Tineke: All better! Your Plitshon are fully healed.");
  showDialog(msgs, ()=>{
    healParty();
    // step back out (south) so you don't re-trigger
    const p=game.player; p.dir=2;
    updateHUD();
  });
}
function healParty(){
  for(const p of game.party){ p.hp=p.maxHp; p.def=p.baseDef; for(const mv of p.moves) mv.pp=mv.maxPp; }
}

// ---------- Eggs ----------
function addEgg(speciesId, level){
  const steps = 18 + level*2;       // hatch time scales gently with level
  game.eggs.push({ speciesId, level:Math.max(1,Math.floor(level*0.6)), stepsLeft:steps, totalSteps:steps });
  updateHUD();
}
function tickEggs(){
  if(game.eggs.length===0) return;
  let hatched=null;
  for(const e of game.eggs){ e.stepsLeft--; if(e.stepsLeft<=0 && !hatched) hatched=e; }
  if(hatched){
    game.eggs = game.eggs.filter(e=>e!==hatched);
    const baby = makePlitshon(hatched.speciesId, Math.max(1,hatched.level));
    let where;
    if(game.party.length<PARTY_MAX){ game.party.push(baby); where="It joined your party!"; }
    else { game.box.push(baby); where="Your party is full — it rests in the BOX."; }
    updateHUD();
    showDialog([`Huh? Your egg is hatching!`, `The egg hatched into ${baby.name} (Lv.${baby.level})!`, where]);
  }
  updateHUD();
}

// ---------- Find Truk cutscene ----------
function findTruk(){
  if(game.flags.trukTaken) return;
  game.state=STATE.CUTSCENE;
  showDialog(STORY_FIND_TRUK, ()=>{
    game.flags.trukTaken=true;
    game.flags.hasTruk=true;
    game.party=[makePlitshon("truk",1)];
    updateHUD();
    game.state=STATE.OVERWORLD;
    showDialog(["Now the tall grass holds wild Plitshon to train against!","Defeat the 3 region trainers to become Champion."]);
  });
}

// ---------- Encounters ----------
function startWildEncounter(){
  const enemy = rollWildSpecies(game.player.tx, game.player.ty);
  showDialog([`A wild ${enemy.name} appeared!`], ()=>beginBattle(enemy, null, [enemy]));
}
function startTrainerEncounter(tr){
  game.state=STATE.DIALOG;
  showDialog([`${tr.name} wants to battle!`, tr.pre], ()=>{
    const fresh=tr.party.map(p=>makePlitshon(p.speciesId,p.level));
    beginBattle(fresh[0], tr, fresh);
  });
}
