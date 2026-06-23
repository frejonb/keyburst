// ============================================================
//  WorldScene — tile overworld, grid movement, wild encounters,
//  forge & heal buildings. Stays alive; battle/menus launch on top.
// ============================================================
const SOLID = { t_tree:1, t_water:1, t_wall:1, t_roof:1 };
// dir 0=up, 1=right, 2=down, 3=left
const DIRS = [[0,-1],[1,0],[0,1],[-1,0]];

class WorldScene extends Phaser.Scene {
  constructor(){ super('World'); }

  create(){
    const T = CONFIG.TILE;
    this.T = T;
    this.buildMap();

    // draw tiles
    this.tileLayer = this.add.group();
    for(let y=0;y<this.MH;y++) for(let x=0;x<this.MW;x++){
      this.add.image(x*T, y*T, this.map[y][x]).setOrigin(0,0);
    }

    // player
    this.ptx = this.spawn.x; this.pty = this.spawn.y;
    this.player = this.add.image(this.ptx*T+T/2, this.pty*T+T/2, 'player').setDepth(5);
    this.moving = false;

    // camera
    this.cameras.main.setBounds(0,0,this.MW*T,this.MH*T);
    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);
    this.cameras.main.setBackgroundColor(0x0e0c1a);

    // input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');
    this.input.addPointer(2);      // allow a couple of simultaneous touches
    this.touchDir = null;
    this.dialogOpen = false;

    this.buildHUD();
    this.buildControls();

    // refresh after returning from battle/menus
    this.events.on('resume', ()=> this.onResume());
    this.events.on('wake',   ()=> this.onResume());

    if(!GAME.flags.intro){
      GAME.flags.intro = true;
      this.time.delayedCall(350, ()=> this.showIntro());
    }
  }

  // ---------------- guided story ----------------
  showIntro(){
    Dialog.show(this, [
      { speaker:'Forgekeeper Vael', text:"Welcome to Forge Vale, apprentice! I am Vael, keeper of the great Forge." },
      { speaker:'Forgekeeper Vael', text:"In our land we do not capture monsters — we FORGE them. This little Emberling is your first companion." },
      { speaker:'Forgekeeper Vael', text:"Move with the D-PAD at the bottom-left (or arrow keys). Walk into the tall green grass to meet a wild Forgemon." },
      { speaker:'Forgekeeper Vael', text:"Battles are one-on-one. When a wild Forgemon faints it SHATTERS into element blocks — that is your crafting loot." },
      { speaker:'Forgekeeper Vael', text:"Bring those blocks to the orange FORGE tile (or tap FORGE) to craft a brand-new monster for your party." },
      { speaker:'Forgekeeper Vael', text:"Hurt party? Step on the house DOOR to heal for free. Now go — gather loot and forge your team!" },
    ]);
  }
  guideToForge(){
    if(GAME.flags.seenLoot) return;
    GAME.flags.seenLoot = true;
    Dialog.show(this, [
      { speaker:'Forgekeeper Vael', text:"Well fought! The wild Forgemon left behind loot blocks — check the top of the screen." },
      { speaker:'Forgekeeper Vael', text:"Head to the orange FORGE tile up north, or just tap the FORGE button, to turn those blocks into a new monster." },
    ]);
  }

  // ---------------- map ----------------
  buildMap(){
    const MW=28, MH=22; this.MW=MW; this.MH=MH;
    const m=[]; for(let y=0;y<MH;y++) m.push(new Array(MW).fill('t_grass'));
    const rect=(x,y,w,h,id)=>{ for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++) if(i>=0&&j>=0&&i<MW&&j<MH) m[j][i]=id; };
    const put=(x,y,id)=>{ if(x>=0&&y>=0&&x<MW&&y<MH) m[y][x]=id; };

    // border of trees
    rect(0,0,MW,1,'t_tree'); rect(0,MH-1,MW,1,'t_tree');
    rect(0,0,1,MH,'t_tree'); rect(MW-1,0,1,MH,'t_tree');

    // ---- town (top) ----
    rect(2,2,MW-4,1,'t_path');           // top street
    rect(11,2,2,6,'t_path');             // vertical street
    // forge building
    rect(4,2,4,1,'t_roof'); rect(4,3,4,2,'t_wall'); put(5,4,'t_forge');
    this.forge = {x:5,y:4};
    // heal house
    rect(18,2,4,1,'t_roof'); rect(18,3,4,2,'t_wall'); put(20,4,'t_door');
    this.heal = {x:20,y:4};
    rect(2,6,MW-4,1,'t_path');

    // ---- meadow (zone 0) ----
    rect(3,9,7,3,'t_tall');
    rect(15,9,7,3,'t_tall');
    put(12,10,'t_tree'); put(24,11,'t_tree'); put(2,12,'t_tree');
    rect(10,8,2,8,'t_path');             // path south

    // ---- pond ----
    rect(20,14,5,3,'t_water');

    // ---- deepwood (zone 1, south) ----
    rect(2,16,4,1,'t_tree'); rect(MW-5,16,4,1,'t_tree');
    rect(3,17,6,4,'t_tall');
    rect(16,18,8,3,'t_tall');
    put(12,18,'t_tree'); put(13,20,'t_tree'); put(25,19,'t_tree'); put(6,19,'t_tree');

    this.map = m;
    this.spawn = { x:11, y:7 };
    this.zoneSouth = 16; // ty >= this => zone 1
  }

  walkable(x,y){
    if(x<0||y<0||x>=this.MW||y>=this.MH) return false;
    return !SOLID[this.map[y][x]];
  }

  // ---------------- HUD ----------------
  buildHUD(){
    const W=this.scale.width;
    this.hud = this.add.container(0,0).setScrollFactor(0).setDepth(50);
    this.hudBg = UI.panel(this, 8, 8, 210, 52, { radius:10 }).setScrollFactor(0).setDepth(50);
    this.hudIcon = this.add.image(36, 34, 'mon_emberling').setScale(0.55).setScrollFactor(0).setDepth(51);
    this.hudName = UI.text(this, 62, 14, '', { size:15, bold:true }).setScrollFactor(0).setDepth(51);
    this.hudHp   = UI.text(this, 62, 36, '', { size:13, color:'#cfc7ea' }).setScrollFactor(0).setDepth(51);

    const py = this.scale.height-46;
    this.btnParty = UI.button(this, W-216, py, 100, 38, 'PARTY', ()=> this.openMenu('Party'),  { fill:0x3a3560 });
    this.btnCraft = UI.button(this, W-110, py, 100, 38, 'FORGE', ()=> this.openMenu('Craft'),  { fill:0x6b3d8e });
    this.btnSet   = UI.button(this, W-216, py-46, 100, 30, '⚙ Settings', ()=> this.openMenu('Settings'), { fill:0x2a2740, size:13 });
    [this.btnParty,this.btnCraft,this.btnSet].forEach(b=> b.setScrollFactor(0).setDepth(51));

    this.refreshHUD();
  }
  refreshHUD(){
    const lead = leadMonster();
    if(!lead) return;
    this.hudIcon.setTexture('mon_'+lead.speciesId);
    this.hudName.setText(`${lead.name}  Lv.${lead.level}`);
    this.hudHp.setText(`HP ${Math.max(0,lead.hp)}/${lead.maxHp}   Party ${GAME.party.length}/${CONFIG.PARTY_MAX}`);
  }

  openMenu(scene){
    this.scene.pause();
    this.scene.launch(scene);
    this.scene.bringToTop(scene);
  }

  onResume(){
    this.refreshHUD();
    if(this.registry.get('blackout')){
      this.registry.set('blackout', false);
      this.ptx=this.spawn.x; this.pty=this.spawn.y;
      this.player.setPosition(this.ptx*this.T+this.T/2, this.pty*this.T+this.T/2);
      this.toast('You were carried back to the forge and your party was healed.', 3200);
    }
    if(this.pendingLoot){
      const l=this.pendingLoot; this.pendingLoot=null;
      this.showLoot(l);
      if(!GAME.flags.seenLoot) this.time.delayedCall(600, ()=> this.guideToForge());
    }
  }

  // ---------------- touch controls ----------------
  buildControls(){
    const H=this.scale.height;
    const s=56, cx=74, cy=H-104;           // d-pad centre, bottom-left
    const pads=[
      [0,'▲', cx,      cy-s ],
      [2,'▼', cx,      cy+s ],
      [3,'◀', cx-s,    cy   ],
      [1,'▶', cx+s,    cy   ],
    ];
    this.dpad=[];
    pads.forEach(([dir,glyph,x,y])=>{
      const g=this.add.graphics().setScrollFactor(0).setDepth(60);
      const draw=(pressed)=>{ g.clear();
        g.fillStyle(0x000000,0.25); g.fillRoundedRect(x-s/2+2,y-s/2+3,s,s,12);
        g.fillStyle(pressed?0xff6b3d:0x2a2740, 0.92); g.fillRoundedRect(x-s/2,y-s/2,s,s,12);
        g.lineStyle(2,0x4a4570,1); g.strokeRoundedRect(x-s/2,y-s/2,s,s,12);
      };
      draw(false);
      const label=this.add.text(x,y,glyph,{ fontFamily:UI.FONT, fontSize:'26px', color:'#f4f0ff' })
        .setOrigin(0.5).setScrollFactor(0).setDepth(61);
      const hit=this.add.zone(x,y,s+6,s+6).setScrollFactor(0).setDepth(62)
        .setInteractive();
      const press=()=>{ this.touchDir=dir; draw(true); };
      const release=()=>{ if(this.touchDir===dir) this.touchDir=null; draw(false); };
      hit.on('pointerdown',press);
      hit.on('pointerup',release);
      hit.on('pointerout',release);
      hit.on('pointerupoutside',release);
      this.dpad.push({g,label,hit});
    });
  }

  // ---------------- update / movement ----------------
  update(){
    if(this.moving || this.dialogOpen) return;
    let dir=null;
    if(this.cursors.left.isDown||this.keys.A.isDown) dir=3;
    else if(this.cursors.right.isDown||this.keys.D.isDown) dir=1;
    else if(this.cursors.up.isDown||this.keys.W.isDown) dir=0;
    else if(this.cursors.down.isDown||this.keys.S.isDown) dir=2;
    if(this.touchDir!=null) dir=this.touchDir;
    if(dir==null) return;

    const nx=this.ptx+DIRS[dir][0], ny=this.pty+DIRS[dir][1];
    if(!this.walkable(nx,ny)) return;
    this.step(nx,ny);
  }

  step(nx,ny){
    const T=this.T;
    this.moving=true;
    this.ptx=nx; this.pty=ny;
    this.tweens.add({
      targets:this.player, x:nx*T+T/2, y:ny*T+T/2, duration:130, ease:'Linear',
      onComplete:()=>{
        this.moving=false;
        this.onTile(nx,ny);
      }
    });
  }

  onTile(x,y){
    const tile=this.map[y][x];
    if(tile==='t_forge'){ this.openMenu('Craft'); return; }
    if(tile==='t_door'){ healParty(); this.refreshHUD(); this.toast('Your Forgemon were fully healed!', 2200); return; }
    if(tile==='t_tall' && Math.random()<CONFIG.ENCOUNTER_RATE){
      const zone = y>=this.zoneSouth ? 1 : 0;
      this.startBattle(rollWild(zone));
    }
  }

  startBattle(wild){
    this.scene.pause();
    this.scene.launch('Battle', { wild });
    this.scene.bringToTop('Battle');
  }

  // loot popup after battle (set by BattleScene via registry)
  showLoot(loot){
    const names=[];
    for(const id in loot.blocks) names.push(`${loot.blocks[id]}× ${BLOCKS[id].name}`);
    for(const id in loot.items)  names.push(`${loot.items[id]}× ${ITEMS[id].name}`);
    if(!names.length) return;
    this.toast('Loot: ' + names.join('  ·  '), 3200);
  }

  // ---------------- toast ----------------
  toast(msg, ms=2600){
    if(this.toastEl) this.toastEl.destroy();
    const W=this.scale.width;
    const c=this.add.container(0,0).setScrollFactor(0).setDepth(80);
    const bg=UI.panel(this, 232, 8, W-240, 52, { radius:10, fill:0x161327 });
    const t=UI.text(this, 248, 16, msg, { size:13, wrap:W-272, color:'#f4f0ff' });
    c.add([bg,t]); this.toastEl=c;
    this.time.delayedCall(ms, ()=>{ if(this.toastEl===c){ c.destroy(); this.toastEl=null; } });
  }
}
window.WorldScene = WorldScene;
