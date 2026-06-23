// ============================================================
//  FORGEMON — lightweight UI helpers (panels, buttons, text)
// ============================================================
window.UI = {
  FONT: '"Trebuchet MS", "Segoe UI", system-ui, sans-serif',

  text(scene, x, y, str, opts={}){
    return scene.add.text(x, y, str, {
      fontFamily: UI.FONT,
      fontSize: (opts.size||16)+'px',
      color: opts.color || CONFIG.UI.ink,
      fontStyle: opts.bold ? 'bold' : 'normal',
      align: opts.align || 'left',
      wordWrap: opts.wrap ? { width:opts.wrap } : undefined,
      lineSpacing: opts.lineSpacing||0,
    }).setOrigin(opts.ox!=null?opts.ox:0, opts.oy!=null?opts.oy:0);
  },

  panel(scene, x, y, w, h, opts={}){
    const g = scene.add.graphics();
    const fill = opts.fill!=null ? opts.fill : CONFIG.UI.panel;
    const line = opts.line!=null ? opts.line : CONFIG.UI.line;
    const r = opts.radius!=null ? opts.radius : 12;
    g.fillStyle(0x000000, opts.shadow!=null?opts.shadow:0.25);
    g.fillRoundedRect(x+3, y+4, w, h, r);
    g.fillStyle(fill, opts.alpha!=null?opts.alpha:1);
    g.fillRoundedRect(x, y, w, h, r);
    g.lineStyle(2, line, 1);
    g.strokeRoundedRect(x, y, w, h, r);
    return g;
  },

  // returns { container, setLabel, setEnabled, bg }
  button(scene, x, y, w, h, label, onClick, opts={}){
    const c = scene.add.container(x, y);
    const fill = opts.fill!=null ? opts.fill : CONFIG.UI.panelHi;
    const line = opts.line!=null ? opts.line : CONFIG.UI.accentInt || 0x4a4570;
    const r = opts.radius!=null ? opts.radius : 10;
    const bg = scene.add.graphics();
    const draw = (f, l)=>{ bg.clear();
      bg.fillStyle(f,1); bg.fillRoundedRect(0,0,w,h,r);
      bg.lineStyle(2, l,1); bg.strokeRoundedRect(0,0,w,h,r);
    };
    draw(fill, line);
    const txt = scene.add.text(w/2, h/2, label, {
      fontFamily: UI.FONT, fontSize:(opts.size||15)+'px',
      color: opts.color||CONFIG.UI.ink, fontStyle: opts.bold?'bold':'normal',
      align:'center', wordWrap:{width:w-10},
    }).setOrigin(0.5);
    c.add([bg, txt]);
    c.setSize(w,h);
    let enabled = true;
    c.setInteractive(new Phaser.Geom.Rectangle(0,0,w,h), Phaser.Geom.Rectangle.Contains);
    c.on('pointerover', ()=>{ if(enabled) draw(shade(fill,18), CONFIG.UI.line||line); });
    c.on('pointerout',  ()=>{ if(enabled) draw(fill, line); });
    c.on('pointerdown', ()=>{ if(enabled){ draw(shade(fill,-15), line); } });
    c.on('pointerup',   ()=>{ if(enabled){ draw(shade(fill,18), line); onClick&&onClick(); } });
    c.setLabel = (s)=> txt.setText(s);
    c.setEnabled = (b)=>{ enabled=b; c.input.enabled=b; bg.alpha=b?1:0.45; txt.alpha=b?1:0.5; };
    c.bg = bg; c.txt = txt; c.redraw = ()=>draw(fill,line);
    return c;
  },

  // a full-screen dim overlay behind modal scenes
  dim(scene, alpha=0.55){
    const g = scene.add.graphics();
    g.fillStyle(0x0a0814, alpha);
    g.fillRect(0,0, scene.scale.width, scene.scale.height);
    return g;
  },
};
