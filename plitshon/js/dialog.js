// Dialog box: queue-based, 2 visible lines, callback on dismiss
const dialogEl = document.getElementById("dialog");

let dialogQueue = [];
let dialogAfter = null;

function showDialog(lines, after) {
  dialogQueue  = Array.isArray(lines) ? lines.slice() : [lines];
  dialogAfter  = after || null;
  game.state   = STATE.DIALOG;
  dialogEl.classList.add("show");
  _renderDialog();
}

function advanceDialog() {
  dialogQueue.shift();
  if (dialogQueue.length === 0) {
    dialogEl.classList.remove("show");
    const cb   = dialogAfter;
    dialogAfter = null;
    if (game.state === STATE.DIALOG) game.state = STATE.OVERWORLD;
    if (cb) cb();
    return;
  }
  _renderDialog();
}

function _renderDialog() {
  const parts = String(dialogQueue[0]).split("\n");
  document.getElementById("dialogLine1").textContent = parts[0] || "";
  document.getElementById("dialogLine2").textContent = parts[1] || "";
}
