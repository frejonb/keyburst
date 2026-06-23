// ============================================================
//  SettingsScene — live tuning, esp. the crafting mode flag so
//  each crafting feel can be compared without editing code.
// ============================================================
class SettingsScene extends Phaser.Scene {
  constructor(){ super('Settings'); }
  create(){
    const W=this.scale.width, H=this.scale.height;
    UI.dim(this, 0.6);
    UI.panel(this, 60, 40, W-120, H-80, { radius:16, fill:0x1a1730 });
    UI.text(this, 84, 56, '⚙  SETTINGS', { size:24, bold:true, color:'#ffcf4d' });
    UI.button(this, W-156, 50, 96, 32, '✕ Close', ()=>this.close(), { fill:0x3a3560, size:14 });
    this.body=this.add.container(0,0);
    this.input.keyboard.on('keydown-ESC', ()=>this.close());
    this.rebuild();
  }
  close(){ this.scene.stop(); this.scene.resume('World'); }

  rebuild(){
    this.body.removeAll(true);
    const W=this.scale.width;

    // ----- crafting mode -----
    this.body.add(UI.text(this, 84, 100, 'Crafting mode  (try each to compare the feel)', { size:16, bold:true }));
    CRAFT_MODES.forEach((mode,i)=>{
      const active=CONFIG.CRAFT_MODE===mode;
      const b=UI.button(this, 84+i*((W-200)/3+4), 128, (W-200)/3-8, 46,
        CRAFT_MODE_LABELS[mode], ()=>{ CONFIG.CRAFT_MODE=mode; this.rebuild(); },
        { fill: active?0xff6b3d:0x2a2740, bold:active, size:14 });
      this.body.add(b);
    });
    const descs={
      recipes:'Fixed recipes: a set block combo yields a specific monster. Collectible, predictable.',
      element:'Element + quantity: dominant element picks the species, total blocks set the level. Flexible.',
      slots:'Slot assembly: combine ELEMENT / CORE / TRAIT blocks to assemble a monster. Creative.',
    };
    this.body.add(UI.text(this, 84, 182, descs[CONFIG.CRAFT_MODE], { size:13, color:'#a9a3c4', wrap:W-200 }));

    // ----- encounter rate -----
    this.body.add(UI.text(this, 84, 224, 'Encounter rate', { size:16, bold:true }));
    this.body.add(UI.text(this, 250, 226, `${Math.round(CONFIG.ENCOUNTER_RATE*100)}% per step`, { size:14, color:'#cfc7ea' }));
    this.body.add(UI.button(this, 84, 250, 40, 30, '–', ()=>{ CONFIG.ENCOUNTER_RATE=Math.max(0,Math.round((CONFIG.ENCOUNTER_RATE-0.04)*100)/100); this.rebuild(); }, { fill:0x3a3560, size:16 }));
    this.body.add(UI.button(this, 130, 250, 40, 30, '+', ()=>{ CONFIG.ENCOUNTER_RATE=Math.min(0.6,Math.round((CONFIG.ENCOUNTER_RATE+0.04)*100)/100); this.rebuild(); }, { fill:0x3a3560, size:16 }));

    // ----- testing helpers -----
    this.body.add(UI.text(this, 84, 300, 'Testing helpers', { size:16, bold:true }));
    this.body.add(UI.button(this, 84, 326, 200, 34, '+10 of every block', ()=>{ [...ELEMENT_BLOCKS,'core','prime'].forEach(id=>addBlock(id,10)); this.flashMsg('Added blocks!'); }, { fill:0x6b3d8e, size:13 }));
    this.body.add(UI.button(this, 296, 326, 160, 34, 'Heal party', ()=>{ healParty(); this.flashMsg('Party healed.'); }, { fill:0x2f7d5a, size:13 }));
    this.body.add(UI.button(this, 468, 326, 160, 34, 'Reset game', ()=>{ newGame(); this.flashMsg('New game started.'); }, { fill:0x9b3d4a, size:13 }));
    this.msg=UI.text(this, 84, 372, '', { size:13, color:'#6ee0a0' }); this.body.add(this.msg);
  }
  flashMsg(m){ if(this.msg) this.msg.setText(m); }
}
window.SettingsScene = SettingsScene;
