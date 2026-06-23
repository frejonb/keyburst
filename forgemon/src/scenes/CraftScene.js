// ============================================================
//  CraftScene — the forge. Renders one of three crafting modes
//  based on CONFIG.CRAFT_MODE so the feel of each can be compared.
// ============================================================
class CraftScene extends Phaser.Scene {
  constructor(){ super('Craft'); }

  create(){
    const W=this.scale.width, H=this.scale.height;
    UI.dim(this, 0.6);
    UI.panel(this, 20, 16, W-40, H-32, { radius:16, fill:0x1a1730 });

    UI.text(this, 40, 30, '⚒  THE FORGE', { size:24, bold:true, color:'#ffcf4d' });
    this.modeLabel=UI.text(this, 40, 60, '', { size:14, color:'#cfc7ea' });

    UI.button(this, W-120, 26, 96, 32, '✕ Close', ()=>this.close(), { fill:0x3a3560, size:14 });

    // inventory strip
    this.invText=UI.text(this, 40, 84, '', { size:13, color:'#bdb6dd', wrap:W-100 });
    this.body=this.add.container(0,0);
    this.feedback=UI.text(this, 40, H-40, '', { size:15, color:'#6ee0a0' });

    // local craft state
    this.elemCounts={}; ELEMENT_BLOCKS.forEach(e=>this.elemCounts[e]=0);
    this.useCore=false;
    this.slots={ element:null, core:null, trait:null };

    this.input.keyboard.on('keydown-ESC', ()=>this.close());
    this.rebuild();
  }

  close(){ this.scene.stop(); this.scene.resume('World'); }

  refreshInv(){
    const parts=[];
    for(const id of [...ELEMENT_BLOCKS,'core','prime']){
      const n=blockCount(id); if(n>0) parts.push(`${BLOCKS[id].glyph}${BLOCKS[id].name.replace(' Block','')} ×${n}`);
    }
    this.invText.setText('Blocks:  ' + (parts.length?parts.join('   '):'(none — go defeat wild Forgemon!)'));
  }

  rebuild(){
    this.body.removeAll(true);
    this.refreshInv();
    this.modeLabel.setText('Mode: '+CRAFT_MODE_LABELS[CONFIG.CRAFT_MODE]+'   ·   change in ⚙ Settings');
    if(CONFIG.CRAFT_MODE==='recipes') this.buildRecipes();
    else if(CONFIG.CRAFT_MODE==='element') this.buildElement();
    else this.buildSlots();
  }

  flash(msg, good=true){ this.feedback.setColor(good?'#6ee0a0':'#ff5d73').setText(msg); }
  onCraft(res){
    if(res.ok){ this.flash(`Forged ${res.monster.name} (Lv.${res.monster.level})! Added to your party.`, true); }
    else this.flash(res.msg, false);
    this.rebuild();
  }

  // ---------------- MODE A: recipes ----------------
  buildRecipes(){
    this.body.add(UI.text(this, 40, 126, 'Pick a recipe. Cards you can afford are lit.', { size:13, color:'#a9a3c4' }));
    const startY=146, cw=186, ch=72, gx=8, gy=6, cols=3;
    RECIPES.forEach((r,i)=>{
      const col=i%cols, row=Math.floor(i/cols);
      const x=40+col*(cw+gx), y=startY+row*(ch+gy);
      const sp=SPECIES[r.species];
      const cost=Object.entries(r.blocks).map(([id,n])=>`${BLOCKS[id].glyph}×${n}`).join(' ');
      const afford=canAfford(r.blocks);
      const b=UI.button(this, x, y, cw, ch,
        `${sp.name}  Lv.${r.level}\n${ELEMENTS[sp.element].name}\n${cost}`,
        ()=> this.onCraft(craftRecipe(r)),
        { fill: afford?0x3a2f5e:0x241f3a, size:13 });
      const icon=this.add.image(x+cw-26, y+26, 'mon_'+r.species).setScale(0.42);
      if(!afford){ b.setEnabled(false); icon.setAlpha(0.4); }
      this.body.add([b, icon]);
    });
  }

  // ---------------- MODE B: element + quantity ----------------
  buildElement(){
    this.body.add(UI.text(this, 40, 124, 'Commit element blocks. The dominant element sets the species; total blocks set the level.', { size:13, color:'#a9a3c4', wrap:560 }));
    const startY=166;
    ELEMENT_BLOCKS.forEach((el,i)=>{
      const y=startY+i*40;
      this.body.add(this.add.image(54, y+12, 'blk_'+el).setScale(0.6));
      this.body.add(UI.text(this, 78, y+4, `${ELEMENTS[el].name}  (have ${blockCount(el)})`, { size:14 }));
      const minus=UI.button(this, 250, y, 30, 26, '–', ()=>{ if(this.elemCounts[el]>0){ this.elemCounts[el]--; this.rebuild(); } }, { fill:0x3a3560, size:16 });
      const cnt=UI.text(this, 292, y+4, ''+this.elemCounts[el], { size:16, bold:true, ox:0.5 }); cnt.x=298;
      const plus=UI.button(this, 320, y, 30, 26, '+', ()=>{ if(this.elemCounts[el]<blockCount(el)){ this.elemCounts[el]++; this.rebuild(); } }, { fill:0x3a3560, size:16 });
      this.body.add([minus,cnt,plus]);
    });

    // core toggle
    const haveCore=blockCount('core')>0;
    const coreBtn=UI.button(this, 40, startY+6*40+6, 220, 30,
      (this.useCore?'☑':'☐')+' Use Beast Core (evolve, +6 Lv)', ()=>{ if(haveCore){ this.useCore=!this.useCore; this.rebuild(); } },
      { fill:this.useCore?0x6b3d8e:0x2a2740, size:13 });
    if(!haveCore){ coreBtn.setEnabled(false); }
    this.body.add(coreBtn);

    // preview
    this.buildElementPreview(380, 166);
  }
  buildElementPreview(x,y){
    const total=ELEMENT_BLOCKS.reduce((s,e)=>s+this.elemCounts[e],0);
    this.body.add(UI.panel(this, x, y, 200, 200, { radius:12, fill:0x241f3a }));
    UI.text(this, x+16, y+12, 'PREVIEW', { size:13, bold:true, color:'#ffcf4d' });
    if(total<2){ this.body.add(UI.text(this, x+16, y+44, 'Commit at least\n2 element blocks.', { size:13, color:'#a9a3c4' })); return; }
    let dom=ELEMENT_BLOCKS[0], best=-1;
    for(const e of ELEMENT_BLOCKS){ if(this.elemCounts[e]>best){ best=this.elemCounts[e]; dom=e; } }
    const tier2=this.useCore && total>=4;
    const species=tier2?TIER2_BY_ELEMENT[dom]:TIER1_BY_ELEMENT[dom];
    let level=Math.min(30, Math.max(3, Math.round(total*1.8)+(tier2?6:0)));
    const sp=SPECIES[species];
    this.body.add(this.add.image(x+100, y+92, 'mon_'+species).setScale(1.0));
    this.body.add(UI.text(this, x+100, y+138, `${sp.name}`, { size:16, bold:true, ox:0.5 }));
    this.body.add(UI.text(this, x+100, y+158, `Lv.${level} · ${ELEMENTS[sp.element].name}`, { size:12, color:'#cfc7ea', ox:0.5 }));
    const forge=UI.button(this, x, y+210, 200, 36, '⚒  FORGE', ()=> this.onCraft(craftElement(this.elemCounts, this.useCore)), { fill:0xff6b3d, bold:true, size:16 });
    this.body.add(forge);
  }

  // ---------------- MODE C: slots ----------------
  buildSlots(){
    this.body.add(UI.text(this, 40, 124, 'Place blocks in the slots, then forge. ELEMENT sets the type; CORE sets the body tier; TRAIT leans the stats.', { size:13, color:'#a9a3c4', wrap:560 }));
    const slotDefs=[
      ['element','ELEMENT', el=>!!BLOCKS[el].element, 'any element block'],
      ['core','CORE', id=>id==='core'||id==='prime', 'Beast Core or Prime Shard (optional)'],
      ['trait','TRAIT', el=>!!BLOCKS[el].element, 'any element block (optional)'],
    ];
    const sy=166;
    slotDefs.forEach((d,i)=>{
      const x=40+i*132, cx=x+60;
      this.body.add(UI.panel(this, x, sy, 120, 132, { radius:12, fill:0x241f3a }));
      this.body.add(UI.text(this, cx, sy+10, d[1], { size:14, bold:true, color:'#ffcf4d', ox:0.5 }));
      const cur=this.slots[d[0]];
      if(cur){
        this.body.add(this.add.image(cx, sy+66, 'blk_'+cur).setScale(1.1));
        this.body.add(UI.text(this, cx, sy+100, BLOCKS[cur].name.replace(' Block',''), { size:12, ox:0.5 }));
        const clr=UI.button(this, cx-30, sy+110, 60, 20, 'clear', ()=>{ this.slots[d[0]]=null; this.rebuild(); }, { fill:0x3a3560, size:11 });
        this.body.add(clr);
      } else {
        this.body.add(UI.text(this, cx, sy+54, '＋', { size:30, color:'#5a5480', ox:0.5 }));
        this.body.add(UI.text(this, cx, sy+92, d[3], { size:10, color:'#8a83ad', ox:0.5, align:'center', wrap:110 }));
      }
    });

    // block palette to click into the active... simpler: clicking a palette block fills first matching empty slot
    this.body.add(UI.text(this, 40, sy+150, 'Your blocks (click to slot):', { size:13, color:'#a9a3c4' }));
    let px=40;
    [...ELEMENT_BLOCKS,'core','prime'].forEach(id=>{
      const n=blockCount(id) - this.slotsUsing(id);
      if(blockCount(id)<=0) return;
      const b=UI.button(this, px, sy+172, 96, 30, `${BLOCKS[id].glyph} ${BLOCKS[id].name.replace(' Block','')} ×${n}`, ()=>this.slotBlock(id), { fill: n>0?0x3a2f5e:0x241f3a, size:12 });
      if(n<=0) b.setEnabled(false);
      this.body.add(b); px+=104;
      if(px>this.scale.width-130){ px=40; }
    });

    // preview + forge
    this.buildSlotsPreview(444, 166);
  }
  slotsUsing(id){ let n=0; for(const k in this.slots){ if(this.slots[k]===id) n++; } return n; }
  slotBlock(id){
    const isCore = id==='core'||id==='prime';
    if(isCore){ if(!this.slots.core){ this.slots.core=id; this.rebuild(); return; } this.flash('CORE slot is full.', false); return; }
    if(!this.slots.element){ this.slots.element=id; }
    else if(!this.slots.trait){ this.slots.trait=id; }
    else { this.flash('Element slots are full.', false); return; }
    this.rebuild();
  }
  buildSlotsPreview(x,y){
    const w=172, cx=x+w/2;
    this.body.add(UI.panel(this, x, y, w, 200, { radius:12, fill:0x241f3a }));
    this.body.add(UI.text(this, x+16, y+12, 'PREVIEW', { size:13, bold:true, color:'#ffcf4d' }));
    if(!this.slots.element){ this.body.add(UI.text(this, x+16, y+44, 'Add an element\nblock to the\nELEMENT slot.', { size:13, color:'#a9a3c4' })); return; }
    const el=BLOCKS[this.slots.element].element;
    const tier2=this.slots.core==='prime';
    const species=tier2?TIER2_BY_ELEMENT[el]:TIER1_BY_ELEMENT[el];
    let level=6; if(this.slots.core==='core') level+=4; if(this.slots.core==='prime') level+=10; if(this.slots.trait) level+=3;
    level=Math.min(level,30);
    const sp=SPECIES[species];
    let traitTxt='';
    if(this.slots.trait){ traitTxt = BLOCKS[this.slots.trait].element===el ? 'Fierce (+ATK)' : 'Sturdy (+DEF)'; }
    this.body.add(this.add.image(cx, y+86, 'mon_'+species).setScale(1.0));
    this.body.add(UI.text(this, cx, y+128, sp.name, { size:16, bold:true, ox:0.5 }));
    this.body.add(UI.text(this, cx, y+148, `Lv.${level} · ${ELEMENTS[sp.element].name}`, { size:12, color:'#cfc7ea', ox:0.5 }));
    if(traitTxt) this.body.add(UI.text(this, cx, y+166, traitTxt, { size:12, color:'#ffcf4d', ox:0.5 }));
    this.body.add(UI.button(this, x, y+210, w, 36, '⚒  FORGE', ()=>this.onCraft(craftSlots(this.slots)), { fill:0xff6b3d, bold:true, size:16 }));
  }
}
window.CraftScene = CraftScene;
