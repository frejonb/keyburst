// ============================================================
//  INVENTORY / MENU overlay — party, eggs, items
// ============================================================
const menuEl = document.getElementById("menu");

function toggleMenu(){
  if(game.state===STATE.MENU) closeMenu();
  else if(game.state===STATE.OVERWORLD) openMenu();
}
function openMenu(){
  if(game.state!==STATE.OVERWORLD) return;
  game.state=STATE.MENU;
  menuEl.classList.add("show");
  renderMenu();
}
function closeMenu(){
  menuEl.classList.remove("show");
  if(game.state===STATE.MENU) game.state=STATE.OVERWORLD;
}

function renderMenu(){
  // ---- party ----
  const pc=document.getElementById("menuParty");
  if(game.party.length===0){
    pc.innerHTML=`<div class="mEmpty">No Plitshon yet. Find one in HET WOUD!</div>`;
  } else {
    pc.innerHTML=game.party.map(p=>{
      const pct=Math.max(0,Math.min(100,p.hp/p.maxHp*100));
      const cls=p.hp<p.maxHp*0.25?"low":(p.hp<p.maxHp*0.5?"mid":"");
      return `<div class="mMon">
        <canvas class="mMonSprite" width="48" height="48" data-sp="${p.speciesId}"></canvas>
        <div class="mMonInfo">
          <div class="mMonTop"><b>${p.name}</b><span>Lv.${p.level}</span></div>
          <div class="mBar"><div class="mBarFill ${cls}" style="width:${pct}%"></div></div>
          <div class="mHp">HP ${p.hp}/${p.maxHp}</div>
        </div></div>`;
    }).join("");
    // draw sprites
    requestAnimationFrame(()=>{
      pc.querySelectorAll(".mMonSprite").forEach(cv=>{
        const c=cv.getContext("2d"); c.clearRect(0,0,48,48);
        drawCreature(c, 24, 26, 15, cv.dataset.sp, performance.now());
      });
    });
  }

  // ---- eggs ----
  const ec=document.getElementById("menuEggs");
  if(game.eggs.length===0){ ec.innerHTML=`<div class="mEmpty">No eggs. Defeat wild Plitshon to find some!</div>`; }
  else {
    ec.innerHTML=game.eggs.map(e=>{
      const done=e.totalSteps-e.stepsLeft, pct=Math.min(100,done/e.totalSteps*100);
      return `<div class="mEgg">
        <span class="mEggIcon">🥚</span>
        <div class="mEggInfo">
          <div class="mEggTop">Mystery Egg <span>${e.stepsLeft} steps left</span></div>
          <div class="mBar"><div class="mBarFill egg" style="width:${pct}%"></div></div>
        </div></div>`;
    }).join("");
  }

  // ---- items ----
  const ic=document.getElementById("menuItems");
  ic.innerHTML=`<div class="mItem">
      <span>🧪 Potion ×${game.items.potion}</span>
      <button id="usePotion" ${(game.items.potion<=0||game.party.length===0)?"disabled":""}>USE</button>
    </div>`;
  const up=document.getElementById("usePotion");
  if(up) up.onclick=usePotion;
}

function usePotion(){
  if(game.items.potion<=0 || game.party.length===0) return;
  const p=game.party[0];
  if(p.hp>=p.maxHp){ flashMenuMsg(`${p.name} is already full!`); return; }
  game.items.potion--;
  p.hp=Math.min(p.maxHp, p.hp+25);
  updateHUD(); renderMenu();
  flashMenuMsg(`${p.name} recovered HP!`);
}
function flashMenuMsg(t){
  const m=document.getElementById("menuMsg");
  m.textContent=t; m.classList.remove("show"); void m.offsetWidth; m.classList.add("show");
}
