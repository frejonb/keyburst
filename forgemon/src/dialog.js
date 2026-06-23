// ============================================================
//  FORGEMON — Dialog: a tap/enter-to-advance story box usable
//  from any scene. Sets scene.dialogOpen while active.
// ============================================================
window.Dialog = {
  show(scene, lines, onDone){
    const W=scene.scale.width, H=scene.scale.height;
    scene.dialogOpen = true;

    const dim = scene.add.graphics().setScrollFactor(0).setDepth(200);
    dim.fillStyle(0x000000, 0.45); dim.fillRect(0,0,W,H);

    const boxH = 132, boxY = H-boxH-16;
    const panel = UI.panel(scene, 24, boxY, W-48, boxH, { radius:14, fill:0x161327, line:0xffcf4d })
      .setScrollFactor(0).setDepth(201);

    const speaker = scene.add.text(44, boxY-2+14, '', {
      fontFamily:UI.FONT, fontSize:'14px', color:'#ffcf4d', fontStyle:'bold',
    }).setScrollFactor(0).setDepth(202);

    const txt = scene.add.text(44, boxY+40, '', {
      fontFamily:UI.FONT, fontSize:'17px', color:'#f4f0ff',
      wordWrap:{ width:W-100 }, lineSpacing:5,
    }).setScrollFactor(0).setDepth(202);

    const prompt = scene.add.text(W-72, boxY+boxH-26, '▼ tap', {
      fontFamily:UI.FONT, fontSize:'13px', color:'#cfc7ea',
    }).setScrollFactor(0).setDepth(202);
    scene.tweens.add({ targets:prompt, alpha:0.3, duration:600, yoyo:true, repeat:-1 });

    const zone = scene.add.zone(0,0,W,H).setOrigin(0).setScrollFactor(0).setDepth(203).setInteractive();

    const items=[dim,panel,speaker,txt,prompt,zone];
    let i=0;
    const render=()=>{
      const ln = lines[i];
      if(typeof ln === 'object'){ speaker.setText(ln.speaker||''); txt.setText(ln.text); }
      else { speaker.setText(''); txt.setText(ln); }
    };
    render();

    const kb = scene.input.keyboard;
    const advance=()=>{
      i++;
      if(i>=lines.length){
        items.forEach(o=>o.destroy());
        kb.off('keydown-ENTER', advance); kb.off('keydown-SPACE', advance);
        scene.dialogOpen=false;
        if(onDone) onDone();
      } else render();
    };
    zone.on('pointerdown', advance);
    kb.on('keydown-ENTER', advance);
    kb.on('keydown-SPACE', advance);
  },
};
