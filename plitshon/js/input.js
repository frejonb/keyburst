// Keyboard input: overworld movement and battle navigation
const keyDown = {};

window.addEventListener("keydown", e => {
  const k = e.key;

  if (game.state === STATE.EVOLVE) {
    e.preventDefault();
    dismissEvolution();
    return;
  }

  if (game.state === STATE.DIALOG) {
    if (k === "Enter" || k === " ") { e.preventDefault(); advanceDialog(); }
    return;
  }

  if (game.state === STATE.BATTLE) {
    handleBattleKey(e);
    return;
  }

  if (game.state === STATE.OVERWORLD) {
    if (keyDown[k]) return;
    keyDown[k] = true;
    const dir = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 }[k];
    if (dir !== undefined) { e.preventDefault(); tryMove(dir); }
  }
});

window.addEventListener("keyup", e => { keyDown[e.key] = false; });

// Continuous movement while key held (cooldown enforced inside tryMove)
setInterval(() => {
  if (game.state !== STATE.OVERWORLD) return;
  const dirs = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 };
  for (const k in dirs) {
    if (keyDown[k]) { tryMove(dirs[k]); break; }
  }
}, 50);

// ---------- Battle key handling ----------
function handleBattleKey(e) {
  if (battle.phase !== BattlePhase.SELECT) return;
  const k = e.key;

  // 1-4 direct move select
  if (["1","2","3","4"].includes(k)) {
    e.preventDefault();
    const i = parseInt(k) - 1;
    const mv = battle.player.moves[i];
    if (mv && mv.pp > 0) { battle.selIndex = i; playerMove(i); }
    return;
  }

  // Arrow navigation
  if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(k)) {
    e.preventDefault();
    navigateSelection(k);
    renderMoves();
    return;
  }

  // Confirm
  if (k === "Enter" || k === " ") {
    e.preventDefault();
    if (battle.selIndex === 4) {
      doFlee();
    } else {
      const mv = battle.player.moves[battle.selIndex];
      if (mv && mv.pp > 0) playerMove(battle.selIndex);
    }
    return;
  }

  // F shortcut for flee
  if (k === "f" || k === "F") { e.preventDefault(); doFlee(); }
}

function navigateSelection(k) {
  const n = battle.player.moves.length;
  let i = battle.selIndex;

  if (i === 4) {
    if (k === "ArrowUp") i = Math.min(n - 1, 3);
    battle.selIndex = i;
    return;
  }

  if      (k === "ArrowRight" && i % 2 === 0 && i + 1 < n) i++;
  else if (k === "ArrowLeft"  && i % 2 === 1)               i--;
  else if (k === "ArrowDown") {
    if (i + 2 < n) i += 2;
    else           i = 4;
  }
  else if (k === "ArrowUp" && i >= 2) i -= 2;

  battle.selIndex = i;
}
