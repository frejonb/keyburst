// Entry point: responsive scaling, touch d-pad, story, victory

// ---- Responsive scaling ----
function rescale() {
  const scale = window.innerWidth / 640;
  const stage = document.getElementById("stage");
  const wrap  = document.getElementById("stageWrap");
  stage.style.transform = `scale(${scale})`;
  wrap.style.height = Math.ceil(480 * scale) + "px";
}

// ---- HUD goal tracker ----
function updateGoal() {
  const defeated = TRAINERS.filter(t => t.defeated).length;
  const el = document.getElementById("hudGoal");
  el.textContent = `TRAINERS: ${defeated}/3`;
  el.classList.toggle("done", defeated === 3);
}

// ---- Victory ----
function checkVictory() {
  if (!TRAINERS.every(t => t.defeated)) return;
  showDialog([
    "The three signal towers crackle back to life!",
    "YOU ARE THE PLITSHON CHAMPION!\nThe Grid thanks you, Trainer.",
  ]);
}

// ---- D-pad setup ----
function setupDpad() {
  document.querySelectorAll(".dpad-btn[data-dir]").forEach(btn => {
    const dir = parseInt(btn.dataset.dir);

    const fire = e => {
      e.preventDefault();
      if (game.state === STATE.OVERWORLD) tryMove(dir);
    };
    btn.addEventListener("touchstart", fire, { passive: false });
    btn.addEventListener("mousedown",  fire);
  });

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

  // Tap dialog to advance
  document.getElementById("dialog").addEventListener("click", () => {
    if (game.state === STATE.DIALOG) advanceDialog();
  });
}

// Hide/show d-pad based on state
function syncDpad() {
  const hidden = game.state === STATE.BATTLE || game.state === STATE.EVOLVE;
  document.getElementById("dpad").style.display = hidden ? "none" : "flex";
}
setInterval(syncDpad, 150);

// ---- Patch endBattleReturn to check victory ----
const _origEndBattleReturn = endBattleReturn;
// redefine globally
window.endBattleReturn = function () {
  _origEndBattleReturn();
  updateGoal();
  checkVictory();
};
// Patch all references inside battle.js by reassigning the global
// (since JS looks up globals by name at call time this works automatically)

// ---- Intro story ----
const INTRO = [
  "PLITSHON WORLD — a neon dimension where synthetic creatures bond with trainers.",
  "The Grid is unstable. Three rogue trainers have jammed the signal towers!",
  "Professor Zeon: 'You must challenge them and restore the network!'",
  "Professor Zeon: 'Take TRUK — your first Plitshon — and begin your journey!'",
  "Walk into TALL GRASS to find wild Plitshon.\nStep in front of a trainer to battle!",
];

function init() {
  rescale();
  window.addEventListener("resize", rescale);
  setupDpad();
  updateHUD();
  updateGoal();
  loop();
  showDialog(INTRO);
}

init();
