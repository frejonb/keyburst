// ============================================================
//  INPUT — keyboard for overworld, battle, dialog, title
// ============================================================
const keyDown = {};
const DIRKEYS = { ArrowUp:0, ArrowRight:1, ArrowDown:2, ArrowLeft:3, w:0, d:1, s:2, a:3, W:0, D:1, S:2, A:3 };

window.addEventListener("keydown", e=>{
  const k=e.key;

  if(game.state===STATE.TITLE){
    if(k==="Enter"||k===" "){ e.preventDefault(); startGame(); }
    return;
  }
  if(game.state===STATE.EVOLVE){ e.preventDefault(); dismissEvolution(); return; }
  if(game.state===STATE.DIALOG||game.state===STATE.CUTSCENE){
    if(k==="Enter"||k===" "||k==="z"||k==="Z"){ e.preventDefault(); advanceDialog(); }
    return;
  }
  if(game.state===STATE.BATTLE){ handleBattleKey(e); return; }

  if(game.state===STATE.OVERWORLD){
    if(k==="Enter"||k===" "||k==="z"||k==="Z"){ e.preventDefault(); interact(); return; }
    if(k in DIRKEYS){ e.preventDefault(); keyDown[k]=true; requestMove(DIRKEYS[k]); }
  }
});
window.addEventListener("keyup", e=>{ keyDown[e.key]=false; });

// continuous walking while held
setInterval(()=>{
  if(game.state!==STATE.OVERWORLD) return;
  for(const k in DIRKEYS){ if(keyDown[k]){ requestMove(DIRKEYS[k]); break; } }
},40);

function handleBattleKey(e){
  if(battle.phase!==BattlePhase.SELECT) return;
  const k=e.key;
  if(["1","2","3","4"].includes(k)){ e.preventDefault(); const i=+k-1; const mv=battle.player.moves[i]; if(mv&&mv.pp>0){ battle.selIndex=i; playerMove(i);} return; }
  if(k in DIRKEYS && (k.startsWith("Arrow"))){ e.preventDefault(); navSel(k); renderMoves(); return; }
  if(k==="Enter"||k===" "||k==="z"||k==="Z"){
    e.preventDefault();
    if(battle.selIndex===4) doFlee();
    else { const mv=battle.player.moves[battle.selIndex]; if(mv&&mv.pp>0) playerMove(battle.selIndex); }
    return;
  }
  if(k==="f"||k==="F"){ e.preventDefault(); doFlee(); }
}

function navSel(k){
  const n=battle.player.moves.length; let i=battle.selIndex;
  if(i===4){ if(k==="ArrowUp") i=Math.min(n-1,3); battle.selIndex=i; return; }
  if(k==="ArrowRight"&&i%2===0&&i+1<n) i++;
  else if(k==="ArrowLeft"&&i%2===1) i--;
  else if(k==="ArrowDown"){ if(i+2<n) i+=2; else i=4; }
  else if(k==="ArrowUp"&&i>=2) i-=2;
  battle.selIndex=i;
}
