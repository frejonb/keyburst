// Evolution sequence overlay
const evolveEl     = document.getElementById("evolve");
const evolveSprite = document.getElementById("evolveSprite");
const evolveText   = document.getElementById("evolveText");
const evolveWrap   = document.getElementById("evolveSpriteWrap");
const evolvePrompt = document.getElementById("evolvePrompt");

let evolveDismissable = false;

function doEvolution() {
  const p     = battle.player;
  const sp    = SPECIES[p.speciesId];
  const newId = sp.evolvesTo;
  const newSp = SPECIES[newId];
  const oldName = p.name;
  const oldHp   = p.hp;
  const oldMax  = p.maxHp;

  game.state = STATE.EVOLVE;
  battleEl.classList.remove("show");
  evolveEl.classList.add("show");
  evolveWrap.classList.remove("rainbow");
  evolvePrompt.style.visibility = "hidden";
  evolveText.classList.remove("flashing");
  evolveDismissable = false;

  // Step 1: show current sprite, then fade to white
  drawSprite(evolveSprite, p.speciesId, p.color, 140);
  evolveSprite.style.opacity = "1";
  evolveSprite.style.filter  = "none";
  evolveText.textContent     = "";

  setTimeout(() => {
    evolveSprite.style.filter  = "brightness(6) saturate(0)";
  }, 100);

  // Step 2: flashing text while faded
  setTimeout(() => {
    evolveText.textContent = `${oldName} is evolving!`;
    evolveText.classList.add("flashing");
  }, 1100);

  // Perform the stat/species update now
  p.speciesId = newId;
  p.name      = newSp.name;
  p.color     = newSp.color;
  p.moves     = newSp.moves.map(m => ({ name: m, pp: MOVES[m].pp, maxPp: MOVES[m].pp }));
  recalcStats(p);
  p.hp = Math.max(1, Math.floor(p.maxHp * (oldHp / oldMax)));

  // Step 3: new sprite fades in after 3s total
  setTimeout(() => {
    drawSprite(evolveSprite, p.speciesId, p.color, 140);
    evolveSprite.style.filter  = "none";
    evolveSprite.style.opacity = "1";
    evolveText.classList.remove("flashing");
    evolveText.textContent = `${oldName} evolved into ${newSp.name}!`;
    evolveWrap.classList.add("rainbow");
    evolvePrompt.style.visibility = "visible";
    evolveDismissable = true;
  }, 3200);
}

function dismissEvolution() {
  if (!evolveDismissable) return;
  evolveDismissable = false;
  evolveEl.classList.remove("show");
  evolveWrap.classList.remove("rainbow");
  endBattleReturn();
}
