// Canvas overworld rendering, HUD, and game loop
const cvs = document.getElementById("overworld");
const ctx = cvs.getContext("2d");

function drawTile(id, x, y) {
  const px = x * TILE, py = y * TILE;
  switch (id) {
    case GRASS:
      ctx.fillStyle = COLOR.grass;
      ctx.fillRect(px, py, TILE, TILE);
      break;
    case TALL_GRASS:
      ctx.fillStyle = COLOR.tallgrass;
      ctx.fillRect(px, py, TILE, TILE);
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = COLOR.neon;
      ctx.lineWidth = 2;
      drawV(px + 9,  py + 12);
      drawV(px + 21, py + 22);
      ctx.restore();
      break;
    case PATH:
      ctx.fillStyle = COLOR.path;
      ctx.fillRect(px, py, TILE, TILE);
      ctx.strokeStyle = "rgba(123,47,190,0.5)";
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
      break;
    case WALL:
      ctx.fillStyle = COLOR.wall;
      ctx.fillRect(px, py, TILE, TILE);
      break;
    case TREE:
      ctx.fillStyle = COLOR.path;
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = COLOR.trunk;
      ctx.fillRect(px + 14, py + 20, 4, 8);
      ctx.fillStyle = COLOR.treetop;
      ctx.beginPath();
      ctx.arc(px + 16, py + 14, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COLOR.neon;
      ctx.beginPath();
      ctx.arc(px + 13, py + 11, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
}

function drawV(cx, cy) {
  ctx.beginPath();
  ctx.moveTo(cx - 4, cy - 4);
  ctx.lineTo(cx,     cy + 3);
  ctx.lineTo(cx + 4, cy - 4);
  ctx.stroke();
}

function drawFigure(x, y, dir, bodyColor, headColor) {
  const px = x * TILE, py = y * TILE;
  const cx = px + TILE / 2;
  const bodyW = 20, bodyH = 28;
  const bx = cx - bodyW / 2;
  const by = py + (TILE - bodyH) / 2 + 2;

  ctx.save();
  ctx.shadowColor = bodyColor;
  ctx.shadowBlur = 8;
  ctx.fillStyle = bodyColor;
  ctx.fillRect(bx, by + 8, bodyW, bodyH - 8);
  ctx.fillStyle = headColor;
  ctx.beginPath();
  ctx.arc(cx, by + 6, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // direction notch
  ctx.fillStyle = "#fff";
  const ix = cx, iy = by + 6;
  ctx.beginPath();
  if      (dir === 0) { ctx.moveTo(ix, iy - 7); ctx.lineTo(ix - 3, iy - 2); ctx.lineTo(ix + 3, iy - 2); }
  else if (dir === 2) { ctx.moveTo(ix, iy + 7); ctx.lineTo(ix - 3, iy + 2); ctx.lineTo(ix + 3, iy + 2); }
  else if (dir === 1) { ctx.moveTo(ix + 7, iy); ctx.lineTo(ix + 2, iy - 3); ctx.lineTo(ix + 2, iy + 3); }
  else                { ctx.moveTo(ix - 7, iy); ctx.lineTo(ix - 2, iy - 3); ctx.lineTo(ix - 2, iy + 3); }
  ctx.closePath();
  ctx.fill();
}

function drawTrainer(t) {
  ctx.save();
  if (t.defeated) ctx.globalAlpha = 0.5;
  drawFigure(t.x, t.y, t.dir, t.color, lightenColor(t.color));
  ctx.restore();

  if (!t.defeated && game.alertTrainer === t.id) {
    const ax = t.x * TILE + TILE / 2;
    const ay = t.y * TILE;
    ctx.save();
    ctx.fillStyle   = COLOR.yellow;
    ctx.shadowColor = COLOR.yellow;
    ctx.shadowBlur  = 8;
    ctx.font        = "bold 18px 'Courier New'";
    ctx.textAlign   = "center";
    ctx.fillText("!", ax, ay - 2);
    ctx.restore();
  }
}

function drawScanlines() {
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  for (let y = 0; y < cvs.height; y += 4)
    ctx.fillRect(0, y, cvs.width, 1);
}

function renderOverworld() {
  ctx.fillStyle = COLOR.bg;
  ctx.fillRect(0, 0, cvs.width, cvs.height);

  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++)
      drawTile(MAP[y][x], x, y);

  for (const t of TRAINERS) drawTrainer(t);

  drawFigure(game.player.x, game.player.y, game.player.dir, COLOR.cyan, "#80FAFF");
  drawScanlines();
}

function updateHUD() {
  const p = game.party[0];
  document.getElementById("hudName").textContent = p.name;
  document.getElementById("hudLv").textContent   = "Lv." + p.level;
  const el = document.getElementById("hudHp");
  el.textContent = `HP ${p.hp}/${p.maxHp}`;
  el.classList.toggle("low", p.hp < p.maxHp * 0.25);
}

function loop() {
  if (game.state === STATE.OVERWORLD || game.state === STATE.DIALOG)
    renderOverworld();
  requestAnimationFrame(loop);
}
