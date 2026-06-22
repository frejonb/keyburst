// Entry point + responsive scaling + touch d-pad

function rescale() {
  const stage = document.getElementById("stage");
  const wrap  = document.getElementById("stageWrap");
  const scale = Math.min(1, window.innerWidth / 640);
  stage.style.transform = `scale(${scale})`;
  // Collapse the extra space the un-scaled element would occupy
  wrap.style.height = Math.ceil(480 * scale) + "px";
}

// ---- D-pad wiring ----
function setupDpad() {
  // Direction buttons
  document.querySelectorAll(".dpad-btn[data-dir]").forEach(btn => {
    const dir = parseInt(btn.dataset.dir);
    const fire = e => {
      e.preventDefault();
      if (game.state === STATE.OVERWORLD) tryMove(dir);
    };
    btn.addEventListener("touchstart", fire, { passive: false });
    btn.addEventListener("mousedown",  fire);
  });

  // Centre button = confirm (dialog advance / battle select)
  const centre = document.getElementById("dpad-action");
  const confirm = e => {
    e.preventDefault();
    if (game.state === STATE.EVOLVE)  { dismissEvolution(); return; }
    if (game.state === STATE.DIALOG)  { advanceDialog();    return; }
    if (game.state === STATE.BATTLE && battle.phase === BattlePhase.SELECT) {
      if (battle.selIndex === 4) doFlee();
      else {
        const mv = battle.player.moves[battle.selIndex];
        if (mv && mv.pp > 0) playerMove(battle.selIndex);
      }
    }
  };
  centre.addEventListener("touchstart", confirm, { passive: false });
  centre.addEventListener("mousedown",  confirm);

  // Also: tapping the dialog box itself advances it
  document.getElementById("dialog").addEventListener("click", () => {
    if (game.state === STATE.DIALOG) advanceDialog();
  });

  // Tapping battle overlay (outside buttons) does nothing harmful
}

// Show/hide d-pad depending on game state
function syncDpad() {
  const dpad = document.getElementById("dpad");
  dpad.style.display = (game.state === STATE.BATTLE || game.state === STATE.EVOLVE)
    ? "none" : "flex";
}

// Patch game state changes to also sync dpad visibility
const _origShowDialog = showDialog;
showDialog = function(lines, after) {
  _origShowDialog(lines, after);
  syncDpad();
};

// Poll state for dpad visibility (cheap, catches all transitions)
setInterval(syncDpad, 200);

function init() {
  rescale();
  window.addEventListener("resize", rescale);
  setupDpad();
  updateHUD();
  loop();
  showDialog(["Welcome to the Plitshon world!\nYou received Truk!"]);
}

init();
