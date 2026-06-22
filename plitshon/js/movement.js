// Player movement, collision, and encounter triggering

function tryMove(dir) {
  const now = performance.now();
  if (now - game.lastStep < 150) return;
  game.lastStep  = now;
  game.player.dir = dir;

  const nx = game.player.x + DX[dir];
  const ny = game.player.y + DY[dir];

  const blocked =
    nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS ||
    !WALKABLE[MAP[ny][nx]] ||
    TRAINERS.some(t => t.x === nx && t.y === ny);

  if (!blocked) {
    game.player.x = nx;
    game.player.y = ny;
  }

  afterStep();
}

function afterStep() {
  game.alertTrainer = null;

  // Check trainer detection (player is exactly 1 tile in front of their facing dir)
  for (const t of TRAINERS) {
    if (t.defeated) continue;
    const fx = t.x + DX[t.dir];
    const fy = t.y + DY[t.dir];
    if (game.player.x === fx && game.player.y === fy) {
      game.alertTrainer = t.id;
      renderOverworld();           // flash the "!" for one frame
      startTrainerEncounter(t);
      return;
    }
  }

  // Tall grass random encounter
  const tile = MAP[game.player.y][game.player.x];
  if (tile === TALL_GRASS) {
    if (!game.seenTallGrass) {
      game.seenTallGrass = true;
      showDialog(["Wild Plitshon live in the tall grass!"]);
      return;
    }
    if (Math.random() < 0.20) {
      startWildEncounter();
      return;
    }
  }

  updateHUD();
}

// ---------- Wild encounter ----------
function rollWildSpecies() {
  const px = game.player.x, py = game.player.y;
  if (px > 13) return makePlitshon("flamix", randInt(4, 7));
  if (py > 7)  return makePlitshon("glitx",  randInt(6, 10));
  const r = Math.random();
  if (r < 0.4) return makePlitshon("aquon", randInt(3, 6));
  if (r < 0.8) return makePlitshon("stonk", randInt(5, 8));
  return Math.random() < 0.5
    ? makePlitshon("flamix", randInt(4, 7))
    : makePlitshon("aquon",  randInt(3, 6));
}

function startWildEncounter() {
  const enemy = rollWildSpecies();
  showDialog([`A wild ${enemy.name} appeared!`], () => beginBattle(enemy, null, [enemy]));
}

// ---------- Trainer encounter ----------
function startTrainerEncounter(t) {
  game.state = STATE.DIALOG;
  showDialog([`${t.name} wants to battle!`], () => {
    const freshParty = t.party.map(p => makePlitshon(p.speciesId, p.level));
    beginBattle(freshParty[0], t, freshParty);
  });
}
