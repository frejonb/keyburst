// ============================================================
//  DIALOG — classic text box with typewriter reveal
// ============================================================
const dialogEl  = document.getElementById("dialog");
const dlLine1   = document.getElementById("dialogLine1");
const dlLine2   = document.getElementById("dialogLine2");
const dlPrompt  = document.querySelector("#dialog .prompt");

let dlgQueue = [];
let dlgAfter = null;
let dlgFull  = "";        // full text of current page
let dlgShown = 0;         // chars revealed
let dlgTyping = false;
let dlgTimer = null;
let dlgPrevState = STATE.OVERWORLD;

function showDialog(lines, after){
  dlgQueue = Array.isArray(lines) ? lines.slice() : [lines];
  dlgAfter = after || null;
  if(game.state!==STATE.CUTSCENE) { dlgPrevState = game.state; game.state = STATE.DIALOG; }
  dialogEl.classList.add("show");
  typePage();
}

function typePage(){
  dlgFull = String(dlgQueue[0] ?? "");
  dlgShown = 0; dlgTyping = true;
  dlPrompt.style.visibility = "hidden";
  if(dlgTimer) clearInterval(dlgTimer);
  dlgTimer = setInterval(()=>{
    dlgShown++;
    renderDialogText();
    if(dlgShown>=dlgFull.length){ dlgTyping=false; clearInterval(dlgTimer); dlPrompt.style.visibility="visible"; }
  }, 18);
  renderDialogText();
}

function renderDialogText(){
  const shown = dlgFull.slice(0,dlgShown);
  const parts = shown.split("\n");
  dlLine1.textContent = parts[0] || "";
  dlLine2.textContent = parts[1] || "";
}

function advanceDialog(){
  if(dlgTyping){            // reveal full page instantly
    dlgShown = dlgFull.length; renderDialogText();
    dlgTyping=false; if(dlgTimer) clearInterval(dlgTimer); dlPrompt.style.visibility="visible";
    return;
  }
  dlgQueue.shift();
  if(dlgQueue.length===0){
    dialogEl.classList.remove("show");
    const cb=dlgAfter; dlgAfter=null;
    if(game.state===STATE.DIALOG) game.state = STATE.OVERWORLD;
    if(cb) cb();
    return;
  }
  typePage();
}
