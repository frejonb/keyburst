// ============================================================
//  TitleScene — splash + start
// ============================================================
class TitleScene extends Phaser.Scene {
  constructor(){ super('Title'); }
  create(){
    const W=this.scale.width, H=this.scale.height;
    this.add.graphics().fillGradientStyle(0x1a1530,0x1a1530,0x2b2350,0x3a2a5c,1).fillRect(0,0,W,H);

    // floating element blocks as decoration
    ['ember','aqua','terra','volt','umbra','verdant'].forEach((el,i)=>{
      const s = this.add.image(70+i*((W-140)/5), H*0.30, 'blk_'+el).setScale(1.3);
      this.tweens.add({ targets:s, y:s.y-12, duration:900+i*120, yoyo:true, repeat:-1, ease:'Sine.inOut' });
    });

    UI.text(this, W/2, H*0.46, 'FORGEMON', { size:52, bold:true, color:'#ffcf4d', ox:0.5, oy:0.5 });
    UI.text(this, W/2, H*0.46+44, 'craft monsters from the loot they leave behind', { size:16, color:'#cfc7ea', ox:0.5, oy:0.5 });

    const start = UI.button(this, W/2-110, H*0.66, 220, 52, '▶  START', ()=>{
      this.scene.start('World');
    }, { fill:0xff6b3d, size:20, bold:true });

    UI.text(this, W/2, H-26, 'Arrows / WASD to move · Click buttons in battle & forge', { size:13, color:'#9a93bd', ox:0.5, oy:0.5 });

    this.input.keyboard.once('keydown-ENTER', ()=> this.scene.start('World'));
  }
}
window.TitleScene = TitleScene;
