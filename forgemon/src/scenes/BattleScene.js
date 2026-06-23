// ============================================================
//  BattleScene — 1-on-1 turn-based. Wild faints drop loot.
// ============================================================
class BattleScene extends Phaser.Scene {
  constructor(){ super('Battle'); }

  create(data){
    const W=this.scale.width, H=this.scale.height;
    this.enemy = data.wild;
    this.enemy.def = this.enemy.baseDef;
    this.player = leadMonster();
    this.player.def = this.player.baseDef;
    this.busy = true; this.mode='main';

    // background
    this.add.graphics().fillGradientStyle(0x2a2350,0x2a2350,0x191430,0x231b40,1).fillRect(0,0,W,H);
    this.add.graphics().fillStyle(0x3a2f5e,1).fillEllipse(520,210,230,40);   // enemy platform
    this.add.graphics().fillStyle(0x3a2f5e,1).fillEllipse(150,360,250,46);   // player platform

    // sprites
    this.enemySpr  = this.add.image(520,160,'mon_'+this.enemy.speciesId).setScale(1.7);
    this.playerSpr = this.add.image(150,300,'mon_'+this.player.speciesId).setScale(2.0).setFlipX(true);
    this.enemySpr.x += 260; this.playerSpr.x -= 260; // slide in
    this.tweens.add({ targets:this.enemySpr, x:520, duration:420, ease:'Cubic.out' });
    this.tweens.add({ targets:this.playerSpr, x:150, duration:420, ease:'Cubic.out' });

    // info boxes
    this.makeBox('e', 30, 36, this.enemy, false);
    this.makeBox('p', 360, 262, this.player, true);

    // message + menu areas
    this.msgBg = UI.panel(this, 16, 344, W-32, 36, { radius:8, fill:0x141029 });
    this.msg = UI.text(this, 30, 353, '', { size:15 });
    this.menu = this.add.container(0,0);

    this.say(`A wild ${this.enemy.name} appeared!`);
    this.time.delayedCall(650, ()=>{
      if(!GAME.flags.seenBattle){
        GAME.flags.seenBattle = true;
        Dialog.show(this, [
          { speaker:'Forgekeeper Vael', text:"This is a battle! Tap FIGHT, then pick a move to attack." },
          { speaker:'Forgekeeper Vael', text:"Moves have an element. Hit a foe with an element it's weak to for 'super effective' damage — mind the type matchups!" },
          { speaker:'Forgekeeper Vael', text:"BAG uses items, SWITCH changes your active Forgemon, RUN flees a wild fight. Defeat it to win loot blocks!" },
        ], ()=>{ this.busy=false; this.showMain(); });
      } else {
        this.busy=false; this.showMain();
      }
    });
  }

  // ---------- info boxes ----------
  makeBox(who, x, y, mon, withExp){
    UI.panel(this, x, y, 250, withExp?80:64, { radius:10 });
    const icon=this.add.image(x+24, y+30, 'mon_'+mon.speciesId).setScale(0.5);
    const nameText=UI.text(this, x+46, y+8, `${mon.name}`, { size:15, bold:true });
    const lvText=UI.text(this, x+200, y+8, `Lv.${mon.level}`, { size:13, color:'#cfc7ea' });
    const elText=UI.text(this, x+46, y+30, ELEMENTS[mon.element].name, { size:11, color:ELEMENTS[mon.element].hex });
    // hp bar
    const bx=x+46, by=y+46, bw=180;
    this.add.graphics().fillStyle(0x000000,0.4).fillRoundedRect(bx,by,bw,9,4);
    const fill=this.add.graphics();
    const hpText=UI.text(this, x+238, y+30, '', { size:12, color:'#cfc7ea', ox:1, oy:0 });
    const ref={ fill, bx, by, bw, hpText, mon, icon, nameText, lvText, elText };
    if(withExp){
      const ey=by+13;
      this.add.graphics().fillStyle(0x000000,0.4).fillRoundedRect(bx,ey,bw,5,2);
      ref.exp=this.add.graphics(); ref.ex=bx; ref.ey=ey; ref.ew=bw;
    }
    this[who+'box']=ref;
    this.drawHp(who);
  }
  drawHp(who){
    const r=this[who+'box'], m=r.mon;
    const pct=Math.max(0,m.hp/m.maxHp);
    let col=0x6ee0a0; if(pct<0.25) col=0xff5d73; else if(pct<0.5) col=0xffd23f;
    r.fill.clear(); r.fill.fillStyle(col,1); r.fill.fillRoundedRect(r.bx,r.by,Math.max(0,r.bw*pct),9,4);
    r.hpText.setText(`${Math.max(0,m.hp)}/${m.maxHp}`);
    if(r.exp){ const ep=Math.min(1,m.exp/m.expNeeded); r.exp.clear(); r.exp.fillStyle(0x6db7ff,1); r.exp.fillRoundedRect(r.ex,r.ey,r.ew*ep,5,2); }
  }

  say(t){ this.msg.setText(t); }

  // ---------- menus ----------
  clearMenu(){ this.menu.removeAll(true); }
  showMain(){
    this.mode='main'; this.clearMenu();
    const W=this.scale.width, MY=386, MH=88, gap=8, bw=(W-32-gap*3)/4;
    const opts=[
      ['FIGHT', 0xff6b3d, ()=>this.showFight()],
      ['BAG',   0x3a7bd5, ()=>this.showBag()],
      ['SWITCH',0x6b3d8e, ()=>this.showSwitch()],
      ['RUN',   0x555078, ()=>this.doRun()],
    ];
    opts.forEach((o,i)=>{
      const b=UI.button(this, 16+i*(bw+gap), MY, bw, MH, o[0], o[2], { fill:o[1], bold:true, size:21 });
      this.menu.add(b);
    });
  }
  _backBtn(){
    const W=this.scale.width;
    return UI.button(this, W-72, 386, 56, 88, '‹\nBack', ()=>this.showMain(), { fill:0x2a2740, size:14 });
  }
  showFight(){
    this.mode='fight'; this.clearMenu();
    const W=this.scale.width, MY=386, MH=88, gap=8;
    const Wc=W-32-56-8, cw=(Wc-gap)/2, ch=(MH-gap)/2;
    this.player.moves.forEach((mv,i)=>{
      const col=i%2, row=Math.floor(i/2);
      const el=MOVES[mv.name].element;
      const tint=el?ELEMENTS[el].color:0x4a4570;
      const b=UI.button(this, 16+col*(cw+gap), MY+row*(ch+gap), cw, ch,
        `${mv.name}\nPP ${mv.pp}/${mv.maxPp}`, ()=>{ if(mv.pp>0) this.playerMove(i); }, { fill:tint, size:16, bold:true });
      if(mv.pp<=0) b.setEnabled(false);
      this.menu.add(b);
    });
    this.menu.add(this._backBtn());
  }
  showBag(){
    this.mode='bag'; this.clearMenu();
    const W=this.scale.width, MY=386, MH=88, gap=8;
    const Wc=W-32-56-8, cw=(Wc-gap)/2, ch=(MH-gap)/2;
    const ids=Object.keys(ITEMS).filter(id=>itemCount(id)>0);
    if(!ids.length){ this.menu.add(UI.text(this, 24, MY+32, 'No items in bag.', {size:16, color:'#a9a3c4'})); }
    ids.forEach((id,i)=>{
      const col=i%2, row=Math.floor(i/2);
      const b=UI.button(this, 16+col*(cw+gap), MY+row*(ch+gap), cw, ch,
        `${ITEMS[id].name} ×${itemCount(id)}`, ()=>this.useItem(id), { fill:0x2f7d5a, size:15 });
      this.menu.add(b);
    });
    this.menu.add(this._backBtn());
  }
  showSwitch(){
    this.mode='switch'; this.clearMenu();
    const W=this.scale.width, MY=386, MH=88, gap=6;
    const Wc=W-32-56-8, cw=(Wc-gap)/2;
    const others=GAME.party.filter(m=>m!==this.player);
    const rows=Math.max(1, Math.ceil(others.length/2));
    const ch=Math.min(42, (MH-(rows-1)*gap)/rows);
    if(!others.length){ this.menu.add(UI.text(this, 24, MY+32, 'No others to switch to.', {size:16, color:'#a9a3c4'})); }
    others.forEach((m,i)=>{
      const col=i%2, row=Math.floor(i/2);
      const dead=m.hp<=0;
      const b=UI.button(this, 16+col*(cw+gap), MY+row*(ch+gap), cw, ch,
        `${m.name} Lv.${m.level} (${Math.max(0,m.hp)}/${m.maxHp})`, ()=>this.doSwitch(m), { fill:0x4a3f78, size:13 });
      if(dead) b.setEnabled(false);
      this.menu.add(b);
    });
    this.menu.add(this._backBtn());
  }

  // ---------- combat ----------
  calcDamage(move, att, def){
    const m=MOVES[move];
    if(m.power<=0) return 0;
    let dmg=Math.floor(m.power*att.atk/def.def/5)+randInt(0,3);
    let eff=1;
    if(m.element) eff=effectiveness(m.element, def.element);
    dmg=Math.max(1, Math.floor(dmg*eff));
    return { dmg, eff };
  }

  playerMove(idx){
    if(this.busy) return; this.busy=true; this.clearMenu();
    const mv=this.player.moves[idx]; mv.pp--;
    const m=MOVES[mv.name];
    if(m.effect){ this.applyEffect(this.player, m.effect, this.player.name, mv.name); this.castBuffFX(this.playerSpr, m.element); this.afterPlayer(); return; }
    const {dmg,eff}=this.calcDamage(mv.name, this.player, this.enemy);
    const big=m.power>=60;
    this.say(`${this.player.name} used ${mv.name}!`);
    if(big) this.moveBanner(mv.name, m.element);
    this.chargeUp(this.playerSpr, m.element);
    this.time.delayedCall(big?320:200, ()=>{
      this.lunge(this.playerSpr, 1);
      this.castFX(m.element, this.playerSpr.x, this.playerSpr.y, this.enemySpr.x, this.enemySpr.y, big,
        ()=>{ this.enemy.hp-=dmg; this.flash(this.enemySpr); this.knock(this.enemySpr, 1); this.drawHp('e'); this.effMsg(eff, this.enemy.name, dmg); },
        ()=>{ if(this.enemy.hp<=0) this.onEnemyFaint(); else this.afterPlayer(); });
    });
  }
  afterPlayer(){ this.time.delayedCall(420, ()=>this.enemyTurn()); }

  enemyTurn(){
    if(this.enemy.hp<=0) return;
    let pool=this.enemy.moves.filter(m=>m.pp>0); if(!pool.length) pool=this.enemy.moves;
    if(this.enemy.hp>this.enemy.maxHp*0.4){ const atks=pool.filter(m=>MOVES[m.name].power>0); if(atks.length) pool=atks; }
    const mv=choice(pool); if(mv.pp>0) mv.pp--;
    const m=MOVES[mv.name];
    if(m.effect){ this.applyEffect(this.enemy, m.effect, this.enemy.name, mv.name); this.castBuffFX(this.enemySpr, m.element); this.time.delayedCall(700, ()=>this.endTurn()); return; }
    const {dmg,eff}=this.calcDamage(mv.name, this.enemy, this.player);
    const big=m.power>=60;
    this.say(`Wild ${this.enemy.name} used ${mv.name}!`);
    if(big) this.moveBanner(mv.name, m.element);
    this.chargeUp(this.enemySpr, m.element);
    this.time.delayedCall(big?320:200, ()=>{
      this.lunge(this.enemySpr, -1);
      this.castFX(m.element, this.enemySpr.x, this.enemySpr.y, this.playerSpr.x, this.playerSpr.y, big,
        ()=>{ this.player.hp-=dmg; this.flash(this.playerSpr); this.knock(this.playerSpr, -1); this.drawHp('p'); this.effMsg(eff, this.player.name, dmg); },
        ()=>{ if(this.player.hp<=0) this.onPlayerFaint(); else this.endTurn(); });
    });
  }
  endTurn(){ this.busy=false; this.showMain(); }

  // ============================================================
  //  Ability VFX — dramatic, element-themed attack animations
  // ============================================================
  moveBanner(name, el){
    const W=this.scale.width;
    const color = el?ELEMENTS[el].hex:'#ffffff';
    const t=this.add.text(W/2, 122, name.toUpperCase(), {
      fontFamily:UI.FONT, fontSize:'46px', color, fontStyle:'bold', stroke:'#0a0814', strokeThickness:7,
    }).setOrigin(0.5).setDepth(45).setScale(0.4).setAlpha(0);
    this.tweens.add({ targets:t, scale:1, alpha:1, duration:200, ease:'Back.out' });
    this.tweens.add({ targets:t, alpha:0, y:108, delay:560, duration:280, onComplete:()=>t.destroy() });
  }

  chargeUp(spr, el){
    const color = el?ELEMENTS[el].color:0xffffff;
    const glow=this.add.image(spr.x, spr.y, 'fx_orb').setTint(color).setBlendMode('ADD').setScale(0.2).setAlpha(0.9).setDepth(19);
    this.tweens.add({ targets:glow, scale:2.2, alpha:0, duration:340, ease:'Cubic.out', onComplete:()=>glow.destroy() });
  }
  castBuffFX(spr, el){
    const color = el?ELEMENTS[el].color:0x6ee0a0;
    const p=this.add.particles(0,0,'fx_spark',{ x:spr.x, y:spr.y+30, speedY:{min:-140,max:-60}, speedX:{min:-40,max:40},
      lifespan:600, scale:{start:1.1,end:0}, tint:color, blendMode:'ADD', quantity:0, emitting:false }).setDepth(22);
    p.explode(22);
    this.time.delayedCall(900,()=>p.destroy());
  }

  // core dispatcher: source (sx,sy) -> target (tx,ty)
  castFX(el, sx, sy, tx, ty, big, onImpact, onDone){
    const dur = big?780:560;
    if(el==='volt'){
      this.lightning(sx,sy,tx,ty, ()=>{ this.impact(tx,ty, ELEMENTS.volt.color, big); onImpact&&onImpact(); });
      this.time.delayedCall(dur, ()=>onDone&&onDone()); return;
    }
    if(el==='terra'){
      for(let i=0;i<6;i++){
        const o=this.add.image(sx,sy,'fx_chunk').setTint(i%2?0xb07a3f:0x8a5a2b).setScale(1.6+Math.random()).setDepth(28).setAngle(Math.random()*360);
        this.tweens.add({ targets:o, x:tx+(Math.random()*50-25), y:ty+(Math.random()*36-18), angle:o.angle+240,
          duration:320, delay:i*26, ease:'Quad.in', onComplete:()=>o.destroy() });
      }
      this.time.delayedCall(360, ()=>{ this.impact(tx,ty, ELEMENTS.terra.color, big); onImpact&&onImpact(); });
      this.time.delayedCall(dur, ()=>onDone&&onDone()); return;
    }
    if(!el){ // neutral physical hit
      this.time.delayedCall(130, ()=>{ this.impact(tx,ty, 0xffffff, false); onImpact&&onImpact(); });
      this.time.delayedCall(500, ()=>onDone&&onDone()); return;
    }
    // ember / aqua / umbra / verdant — flying orb with trail
    const color = ELEMENTS[el].color;
    this.projectile(sx,sy,tx,ty,color, ()=>{ this.impact(tx,ty,color,big); onImpact&&onImpact(); });
    this.time.delayedCall(dur, ()=>onDone&&onDone());
  }

  projectile(sx,sy,tx,ty,color,onArrive){
    const orb=this.add.image(sx,sy,'fx_orb').setTint(color).setScale(1.0).setBlendMode('ADD').setDepth(28);
    const trail=this.add.particles(0,0,'fx_dot',{ lifespan:280, scale:{start:0.9,end:0}, tint:color,
      blendMode:'ADD', frequency:14, follow:orb }).setDepth(27);
    this.tweens.add({ targets:orb, x:tx, y:ty, duration:300, ease:'Quad.in', onComplete:()=>{
      orb.destroy(); trail.stop(); this.time.delayedCall(320,()=>trail.destroy()); onArrive&&onArrive();
    }});
  }

  lightning(sx,sy,tx,ty,onStrike){
    const g=this.add.graphics().setDepth(28).setBlendMode('ADD');
    const draw=()=>{ g.clear(); g.lineStyle(3, ELEMENTS.volt.color, 1);
      const seg=9; g.beginPath(); g.moveTo(sx,sy);
      for(let i=1;i<seg;i++){ const t=i/seg; g.lineTo(sx+(tx-sx)*t+(Math.random()*44-22), sy+(ty-sy)*t+(Math.random()*44-22)); }
      g.lineTo(tx,ty); g.strokePath();
    };
    let n=0; const tick=()=>{ draw(); if(++n<5) this.time.delayedCall(45,tick); else g.destroy(); };
    tick();
    this.time.delayedCall(140, ()=>onStrike&&onStrike());
  }

  impact(tx,ty,color,big){
    const burst=this.add.particles(0,0,'fx_dot',{ speed:{min:90,max:big?340:230}, lifespan:{min:260,max:big?640:480},
      scale:{start:big?1.7:1.2,end:0}, tint:color, blendMode:'ADD', quantity:0, emitting:false }).setDepth(31);
    burst.explode(big?44:26, tx, ty);
    const spark=this.add.particles(0,0,'fx_spark',{ speed:{min:140,max:big?420:300}, lifespan:{min:200,max:420},
      scale:{start:1.0,end:0}, tint:0xffffff, blendMode:'ADD', quantity:0, emitting:false }).setDepth(32);
    spark.explode(big?20:12, tx, ty);
    // shockwave ring
    const ring=this.add.image(tx,ty,'fx_orb').setTint(color).setBlendMode('ADD').setScale(0.4).setDepth(30);
    this.tweens.add({ targets:ring, scale:big?3.4:2.1, alpha:0, duration:big?460:320, ease:'Cubic.out', onComplete:()=>ring.destroy() });
    // camera drama
    this.cameras.main.shake(big?280:150, big?0.020:0.009);
    const c=Phaser.Display.Color.IntegerToRGB(color);
    this.cameras.main.flash(big?170:80, c.r,c.g,c.b, false);
    this.time.delayedCall(900, ()=>{ burst.destroy(); spark.destroy(); });
  }

  knock(spr, dir){ const x0=spr.x; this.tweens.add({ targets:spr, x:x0+dir*24, duration:90, yoyo:true, ease:'Quad.out' }); }

  applyEffect(mon, effect, who, move){
    if(effect==='raise_def'){ mon.def=Math.min(mon.baseDef*2, Math.floor(mon.def*1.3)); this.say(`${who} used ${move}! Defense rose!`); }
    if(effect==='raise_atk'){ mon.atk=Math.floor(mon.atk*1.18); this.say(`${who} used ${move}! Attack rose!`); }
  }
  effMsg(eff, name, dmg){
    let s=`${name} took ${dmg} damage!`;
    if(eff>1) s+='  It\'s super effective!';
    else if(eff<1) s+='  Not very effective...';
    this.say(s);
  }

  // ---------- item / switch / run ----------
  useItem(id){
    if(this.busy) return;
    const it=ITEMS[id];
    if(it.heal){
      if(this.player.hp>=this.player.maxHp){ this.say(`${this.player.name} is already at full HP.`); return; }
      GAME.inventory.items[id]--;
      this.player.hp=Math.min(this.player.maxHp, this.player.hp+it.heal);
      this.drawHp('p'); this.busy=true; this.clearMenu();
      this.say(`You used ${it.name}. ${this.player.name} recovered ${it.heal} HP!`);
      this.afterPlayer();
    }
  }
  doSwitch(m){
    if(this.busy||m.hp<=0) return;
    this.busy=true; this.clearMenu();
    this.player=m; this.player.def=this.player.baseDef;
    this.pbox.mon=m;
    this.playerSpr.setTexture('mon_'+m.speciesId);
    // rebuild player box labels by redrawing scene texts is heavy; just update hp + name via quick overlay
    this.refreshPlayerBox();
    this.say(`Go, ${m.name}!`);
    this.afterPlayer();
  }
  refreshPlayerBox(){
    const r=this.pbox; const m=this.player;
    r.icon.setTexture('mon_'+m.speciesId);
    r.nameText.setText(m.name);
    r.lvText.setText('Lv.'+m.level);
    r.elText.setText(ELEMENTS[m.element].name).setColor(ELEMENTS[m.element].hex);
    this.drawHp('p');
  }
  doRun(){
    if(this.busy) return; this.busy=true; this.clearMenu();
    if(Math.random()<0.7){ this.say('Got away safely!'); this.time.delayedCall(700, ()=>this.finish(false)); }
    else { this.say('Couldn\'t get away!'); this.time.delayedCall(700, ()=>this.enemyTurn()); }
  }

  // ---------- faints ----------
  onEnemyFaint(){
    this.enemy.hp=0; this.drawHp('e');
    this.tweens.add({ targets:this.enemySpr, y:this.enemySpr.y+30, alpha:0, duration:420 });
    const exp=Math.floor(this.enemy.level*14);
    this.player.exp+=exp;
    let levelMsgs=[];
    while(this.player.exp>=this.player.expNeeded){
      this.player.exp-=this.player.expNeeded; this.player.level++;
      recalcStats(this.player);
      this.player.hp=Math.min(this.player.maxHp, this.player.hp+Math.floor(this.player.maxHp*0.2));
      levelMsgs.push(`${this.player.name} grew to Lv.${this.player.level}!`);
    }
    this.drawHp('p');
    const loot=rollLoot(this.enemy);
    applyLoot(loot);
    this.registry.set('pendingLoot', loot);

    const msgs=[`Wild ${this.enemy.name} fainted!`, `${this.player.name} gained ${exp} EXP!`, ...levelMsgs,
      'It shattered into loot blocks!'];
    this.queue(msgs, ()=> this.finish(false, loot));
  }
  onPlayerFaint(){
    this.player.hp=0; this.drawHp('p');
    this.tweens.add({ targets:this.playerSpr, y:this.playerSpr.y+30, alpha:0, duration:420 });
    this.queue([`${this.player.name} fainted!`], ()=>{
      if(anyAlive()){
        // force switch
        this.busy=true;
        this.playerSpr.setAlpha(1); this.playerSpr.y=300;
        this.player=leadMonster(); this.player.def=this.player.baseDef;
        this.pbox.mon=this.player;
        this.playerSpr.setTexture('mon_'+this.player.speciesId);
        this.refreshPlayerBox();
        this.say(`Go, ${this.player.name}!`);
        this.time.delayedCall(900, ()=>{ this.busy=false; this.showMain(); });
      } else {
        healParty();
        this.registry.set('blackout', true);
        this.queue(['All your Forgemon fainted...'], ()=> this.finish(true));
      }
    });
  }

  // play a sequence of messages with delay, then callback
  queue(msgs, done){
    let i=0; this.busy=true; this.clearMenu();
    const next=()=>{ if(i>=msgs.length){ done&&done(); return; } this.say(msgs[i++]); this.time.delayedCall(1050, next); };
    next();
  }

  finish(blackout, loot){
    if(loot){ const w=this.scene.get('World'); if(w) w.pendingLoot=loot; }
    this.scene.stop();
    this.scene.resume('World');
  }

  // ---------- fx ----------
  lunge(spr, dir){ const x0=spr.x; this.tweens.add({ targets:spr, x:x0+dir*30, duration:110, yoyo:true }); }
  flash(spr){ this.tweens.add({ targets:spr, alpha:0.2, duration:70, yoyo:true, repeat:2 }); }
}
window.BattleScene = BattleScene;
