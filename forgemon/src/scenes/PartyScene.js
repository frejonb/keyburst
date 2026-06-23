// ============================================================
//  PartyScene — view party, set lead, use healing items
// ============================================================
class PartyScene extends Phaser.Scene {
  constructor(){ super('Party'); }
  create(){
    const W=this.scale.width, H=this.scale.height;
    UI.dim(this, 0.6);
    UI.panel(this, 20, 16, W-40, H-32, { radius:16, fill:0x1a1730 });
    UI.text(this, 40, 30, '🐾  YOUR PARTY', { size:24, bold:true, color:'#ffcf4d' });
    UI.button(this, W-120, 26, 96, 32, '✕ Close', ()=>this.close(), { fill:0x3a3560, size:14 });
    this.feedback=UI.text(this, 40, H-38, '', { size:14, color:'#6ee0a0' });
    this.body=this.add.container(0,0);
    this.input.keyboard.on('keydown-ESC', ()=>this.close());
    this.rebuild();
  }
  close(){ this.scene.stop(); this.scene.resume('World'); }
  flash(m,good=true){ this.feedback.setColor(good?'#6ee0a0':'#ff5d73').setText(m); }

  rebuild(){
    this.body.removeAll(true);
    const W=this.scale.width;
    GAME.party.forEach((m,i)=>{
      const col=i%2, row=Math.floor(i/2);
      const x=40+col*((W-80)/2+0)+col*8, y=70+row*116;
      const cw=(W-96)/2;
      this.body.add(UI.panel(this, x, y, cw, 108, { radius:12, fill: i===0?0x2f2a4e:0x241f3a, line: i===0?0xffcf4d:0x3a3660 }));
      this.body.add(this.add.image(x+42, y+42, 'mon_'+m.speciesId).setScale(0.78));
      this.body.add(UI.text(this, x+84, y+8, `${m.name}`, { size:16, bold:true }));
      if(i===0) this.body.add(UI.text(this, x+cw-12, y+10, 'LEAD', { size:11, bold:true, color:'#ffcf4d', ox:1 }));
      this.body.add(UI.text(this, x+84, y+28, `Lv.${m.level} · ${ELEMENTS[m.element].name}${m.trait?' · '+m.trait:''}`, { size:12, color:ELEMENTS[m.element].hex }));
      this.body.add(UI.text(this, x+84, y+46, `HP ${Math.max(0,m.hp)}/${m.maxHp}  ATK ${m.atk} DEF ${m.def}`, { size:12, color:'#cfc7ea' }));
      // bottom action row (kept clear of the name)
      if(m.hp<m.maxHp && itemCount('potion')>0){
        this.body.add(UI.button(this, x+10, y+76, 96, 26, `+ Potion`, ()=>{ GAME.inventory.items.potion--; m.hp=Math.min(m.maxHp,m.hp+ITEMS.potion.heal); this.rebuild(); }, { fill:0x2f7d5a, size:13 }));
      } else {
        this.body.add(UI.text(this, x+12, y+82, m.moves.map(mv=>mv.name).join(', '), { size:11, color:'#9a93bd', wrap:cw-110 }));
      }
      if(i!==0){
        this.body.add(UI.button(this, x+cw-104, y+76, 96, 26, '★ Set Lead', ()=>{ GAME.party.splice(i,1); GAME.party.unshift(m); this.rebuild(); }, { fill:0x4a3f78, size:13 }));
      }
    });
    const yb=70+Math.ceil(GAME.party.length/2)*116+4;
    this.body.add(UI.text(this, 40, yb, `Bag — Potion ×${itemCount('potion')}  ·  Super Potion ×${itemCount('superpotion')}  ·  Revive ×${itemCount('revive')}`, { size:13, color:'#bdb6dd' }));
  }
}
window.PartyScene = PartyScene;
