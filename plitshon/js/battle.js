// Full battle state machine
const battleEl = document.getElementById("battle");

const BattlePhase = { SELECT: "select", BUSY: "busy" };

const battle = {
  enemy:       null,
  enemyParty:  null,
  enemyIndex:  0,
  trainer:     null,
  player:      null,
  phase:       BattlePhase.SELECT,
  selIndex:    0,
  logLines:    [],
};

// ---------- Log ----------
function logMsg(msg) {
  battle.logLines.push(msg);
  if (battle.logLines.length > 3) battle.logLines.shift();
  document.getElementById("battleLog").innerHTML =
    battle.logLines.map(l => `<div class="logline">&gt; ${l}</div>`).join("");
}

// ---------- Begin ----------
function beginBattle(enemy, trainer, enemyParty) {
  battle.enemy      = enemy;
  battle.trainer    = trainer;
  battle.enemyParty = enemyParty || [enemy];
  battle.enemyIndex = 0;
  battle.player     = game.party[0];
  battle.phase      = BattlePhase.SELECT;
  battle.selIndex   = 0;
  battle.logLines   = [];

  // reset per-battle def buffs
  battle.player.def = battle.player.baseDef;
  battle.enemy.def  = battle.enemy.baseDef;

  game.state = STATE.BATTLE;
  battleEl.classList.add("show");

  logMsg(trainer
    ? `${trainer.name} sent out ${enemy.name}!`
    : `Wild ${enemy.name} appeared!`);

  renderBattle();
  drawSprite(document.getElementById("enemySprite"),  enemy.speciesId,         enemy.color,         120);
  drawSprite(document.getElementById("playerSprite"), battle.player.speciesId, battle.player.color, 100);
}

// ---------- Render ----------
function renderBattle() {
  const e = battle.enemy, p = battle.player;

  document.getElementById("enemyName").textContent = e.name;
  document.getElementById("enemyLv").textContent   = "Lv." + e.level;
  setBar("enemyHpFill", e.hp, e.maxHp, true);
  document.getElementById("enemyHpText").textContent = `HP ${Math.max(0, e.hp)}/${e.maxHp}`;

  document.getElementById("pName").textContent = p.name;
  document.getElementById("pLv").textContent   = "Lv." + p.level;
  setBar("pHpFill", p.hp, p.maxHp, true);
  document.getElementById("pHpText").textContent = `HP ${Math.max(0, p.hp)}/${p.maxHp}`;
  setBar("pExpFill", p.exp, p.expNeeded, false);
  document.getElementById("pExpText").textContent = `EXP ${p.exp}/${p.expNeeded}`;

  renderMoves();
}

function setBar(id, val, max, isHp) {
  const el  = document.getElementById(id);
  const pct = Math.max(0, Math.min(100, (val / max) * 100));
  el.style.width = pct + "%";
  if (isHp) el.classList.toggle("low", val < max * 0.25);
}

function renderMoves() {
  const wrap = document.getElementById("moves");
  wrap.innerHTML = "";
  battle.player.moves.forEach((mv, i) => {
    const btn = document.createElement("div");
    btn.className = "movebtn" +
      (battle.selIndex === i ? " sel"      : "") +
      (mv.pp <= 0            ? " disabled" : "");
    btn.innerHTML = `<div class="mname">${mv.name}</div><div class="mpp">PP ${mv.pp}/${mv.maxPp}</div>`;
    btn.onclick = () => {
      if (battle.phase === BattlePhase.SELECT && mv.pp > 0) {
        battle.selIndex = i;
        playerMove(i);
      }
    };
    wrap.appendChild(btn);
  });

  const flee = document.getElementById("fleeBtn");
  flee.classList.toggle("sel", battle.selIndex === 4);
  flee.onclick = () => { if (battle.phase === BattlePhase.SELECT) doFlee(); };
}

// ---------- Damage ----------
function calcDamage(moveName, attacker, defender) {
  const m = MOVES[moveName];
  return Math.max(1,
    Math.floor((m.power * attacker.atk) / defender.def / 5) +
    Math.floor(Math.random() * 5)
  );
}

function flashSprite(id) {
  const el = document.getElementById(id);
  el.classList.remove("flash");
  void el.offsetWidth;
  el.classList.add("flash");
}

// ---------- Player turn ----------
function playerMove(idx) {
  if (battle.phase !== BattlePhase.SELECT) return;
  const mv  = battle.player.moves[idx];
  if (!mv || mv.pp <= 0) return;

  battle.phase = BattlePhase.BUSY;
  mv.pp--;

  if (MOVES[mv.name].effect === "raise_def") {
    battle.player.def = Math.min(
      battle.player.baseDef * 2,
      Math.floor(battle.player.def * 1.3)
    );
    logMsg(`${battle.player.name} used ${mv.name}! DEF rose!`);
    renderBattle();
    setTimeout(enemyTurn, 600);
    return;
  }

  const dmg = calcDamage(mv.name, battle.player, battle.enemy);
  battle.enemy.hp -= dmg;
  logMsg(`${battle.player.name} used ${mv.name}!`);
  flashSprite("enemySprite");
  renderBattle();

  setTimeout(() => {
    logMsg(`${battle.enemy.name} lost ${dmg} HP!`);
    renderBattle();
    if (battle.enemy.hp <= 0) {
      battle.enemy.hp = 0;
      renderBattle();
      setTimeout(onEnemyFainted, 600);
    } else {
      setTimeout(enemyTurn, 500);
    }
  }, 500);
}

// ---------- Enemy turn ----------
function enemyTurn() {
  if (battle.enemy.hp <= 0) return;
  const e = battle.enemy;

  const usable = e.moves.filter(m => m.pp > 0);
  let pool = usable.length ? usable : e.moves;
  if (e.hp > e.maxHp * 0.30) {
    const dmgMoves = pool.filter(m => MOVES[m.name].power > 0);
    if (dmgMoves.length) pool = dmgMoves;
  }
  const mv = choice(pool);
  if (mv.pp > 0) mv.pp--;

  if (MOVES[mv.name].effect === "raise_def") {
    e.def = Math.min(e.baseDef * 2, Math.floor(e.def * 1.3));
    logMsg(`${e.name} used ${mv.name}! DEF rose!`);
    renderBattle();
    setTimeout(endTurn, 600);
    return;
  }

  const dmg = calcDamage(mv.name, e, battle.player);
  battle.player.hp -= dmg;
  logMsg(`${e.name} used ${mv.name}!`);
  flashSprite("playerSprite");
  renderBattle();

  setTimeout(() => {
    logMsg(`${battle.player.name} lost ${dmg} HP!`);
    renderBattle();
    if (battle.player.hp <= 0) {
      battle.player.hp = 0;
      renderBattle();
      setTimeout(onPlayerFainted, 600);
    } else {
      setTimeout(endTurn, 500);
    }
  }, 500);
}

function endTurn() {
  battle.phase    = BattlePhase.SELECT;
  battle.selIndex = 0;
  renderMoves();
}

// ---------- Enemy fainted ----------
function onEnemyFainted() {
  const isTrainer  = !!battle.trainer;
  const expGained  = Math.floor(battle.enemy.level * 15 * (isTrainer ? 1.5 : 1));
  battle.player.exp += expGained;

  let leveled  = false;
  let willEvo  = false;

  while (battle.player.exp >= battle.player.expNeeded) {
    battle.player.level++;
    battle.player.exp = 0;
    recalcStats(battle.player);
    battle.player.hp = Math.min(
      battle.player.maxHp,
      battle.player.hp + Math.floor(battle.player.maxHp * 0.20)
    );
    leveled = true;
    const sp = SPECIES[battle.player.speciesId];
    if (sp.evolvesTo && battle.player.level >= sp.evolvesAt) willEvo = true;
  }

  renderBattle();

  // Trainer has more party members?
  if (isTrainer && battle.enemyIndex < battle.enemyParty.length - 1) {
    battle.enemyIndex++;
    const next = battle.enemyParty[battle.enemyIndex];
    next.def   = next.baseDef;
    battle.enemy = next;

    const msgs = [`Gained ${expGained} EXP!`];
    if (leveled) msgs.push(`${battle.player.name} grew to Lv.${battle.player.level}!`);
    msgs.push(`${battle.trainer.name} sent out ${next.name}!`);

    afterBattleDialog(msgs, () => {
      drawSprite(document.getElementById("enemySprite"), next.speciesId, next.color, 100);
      battle.phase    = BattlePhase.SELECT;
      battle.selIndex = 0;
      game.state      = STATE.BATTLE;
      battleEl.classList.add("show");
      renderBattle();
    });
    return;
  }

  // Battle fully won
  const msgs = [`${battle.enemy.name} fainted!`, `Gained ${expGained} EXP!`];
  if (leveled) msgs.push(`${battle.player.name} grew to Lv.${battle.player.level}!`);

  afterBattleDialog(msgs, () => {
    if (isTrainer) {
      battle.trainer.defeated = true;
      showDialog([`${battle.trainer.name}: You're too strong!`], () => {
        if (willEvo) doEvolution(); else endBattleReturn();
      });
    } else {
      if (willEvo) doEvolution(); else endBattleReturn();
    }
  });
}

// ---------- Player fainted ----------
function onPlayerFainted() {
  afterBattleDialog(["You blacked out!"], () => {
    for (const p of game.party) {
      p.hp  = Math.max(1, Math.floor(p.maxHp * 0.5));
      p.def = p.baseDef;
    }
    game.player.x = 2; game.player.y = 6; game.player.dir = 2;
    endBattleReturn();
  });
}

// ---------- Flee ----------
function doFlee() {
  if (battle.phase !== BattlePhase.SELECT) return;
  if (battle.trainer) { logMsg("Can't flee a trainer battle!"); return; }
  battle.phase = BattlePhase.BUSY;
  if (Math.random() < 0.70) {
    logMsg("Got away safely!");
    setTimeout(endBattleReturn, 600);
  } else {
    logMsg("Couldn't escape!");
    setTimeout(enemyTurn, 700);
  }
}

// ---------- Helpers ----------
function afterBattleDialog(msgs, after) {
  battleEl.classList.remove("show");
  showDialog(msgs, after);
}

function endBattleReturn() {
  battleEl.classList.remove("show");
  game.state        = STATE.OVERWORLD;
  game.alertTrainer = null;
  updateHUD();
}
