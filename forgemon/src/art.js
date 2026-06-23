// ============================================================
//  FORGEMON — procedural art. All sprites are generated at boot
//  with Phaser Graphics -> generateTexture, so no image files ship.
// ============================================================

// ---- int-color helpers (0xRRGGBB) ----
function clamp8(v){ return Math.max(0, Math.min(255, v|0)); }
function shade(color, amt){
  const r = clamp8(((color>>16)&255) + amt);
  const g = clamp8(((color>>8)&255) + amt);
  const b = clamp8((color&255) + amt);
  return (r<<16)|(g<<8)|b;
}
window.shade = shade;
function hexStr(color){ return '#'+color.toString(16).padStart(6,'0'); }
window.hexStr = hexStr;

window.ART = {
  // ---------------------------------------------------------
  monsterTexture(scene, key, speciesId){
    const sp = SPECIES[speciesId];
    const base = ELEMENTS[sp.element].color;
    const dk = shade(base,-55), lt = shade(base,55);
    const g = scene.make.graphics({ x:0, y:0, add:false });
    const W=80,H=80, cx=40;
    const outline = 0x231f33;

    // soft ground shadow
    g.fillStyle(0x000000, 0.18); g.fillEllipse(cx, 72, 46, 12);

    if(sp.shape===0){ // small blob
      const by=46;
      g.lineStyle(3, outline,1);
      g.fillStyle(base,1); g.fillCircle(cx, by, 22);
      g.fillStyle(lt,1); g.fillCircle(cx-7, by-7, 9);          // sheen
      g.fillStyle(dk,1); g.fillRoundedRect(cx-16,by+8,12,12,4);// feet
      g.fillRoundedRect(cx+4,by+8,12,12,4);
      g.fillStyle(base,1); g.fillTriangle(cx-18,by-16,cx-8,by-26,cx-4,by-14); // ears
      g.fillTriangle(cx+18,by-16,cx+8,by-26,cx+4,by-14);
      ART._face(g, cx, by-2, 1);
    } else if(sp.shape===1){ // round beast
      const by=44;
      g.fillStyle(dk,1); g.fillRoundedRect(cx-22,by+10,16,16,5); // paws
      g.fillRoundedRect(cx+6,by+10,16,16,5);
      g.fillStyle(base,1); g.fillCircle(cx, by, 26);
      g.fillStyle(dk,1); g.fillTriangle(cx+22,by+2,cx+34,by-6,cx+30,by+14); // tail
      g.fillStyle(base,1);
      g.fillTriangle(cx-22,by-18,cx-10,by-34,cx-4,by-18);       // ears
      g.fillTriangle(cx+22,by-18,cx+10,by-34,cx+4,by-18);
      g.fillStyle(lt,1); g.fillCircle(cx-9, by-8, 10);
      ART._face(g, cx, by, 1.2);
    } else { // tall / strong
      const by=42;
      g.fillStyle(dk,1);
      g.fillRoundedRect(cx-26,by-6,12,26,5); g.fillRoundedRect(cx+14,by-6,12,26,5); // arms
      g.fillRoundedRect(cx-16,by+24,13,16,4); g.fillRoundedRect(cx+3,by+24,13,16,4);// legs
      g.fillStyle(base,1); g.fillRoundedRect(cx-20,by-18,40,42,12);                 // torso
      g.fillStyle(lt,1); g.fillRoundedRect(cx-14,by-12,14,16,6);                    // chest sheen
      g.fillStyle(dk,1);
      g.fillTriangle(cx-20,by-18,cx-26,by-36,cx-8,by-22);   // horns
      g.fillTriangle(cx+20,by-18,cx+26,by-36,cx+8,by-22);
      ART._face(g, cx, by-2, 1.3);
    }
    g.generateTexture(key, W, H);
    g.destroy();
  },

  _face(g, cx, cy, s){
    // whites
    g.fillStyle(0xffffff,1);
    g.fillCircle(cx-8*s, cy, 6*s); g.fillCircle(cx+8*s, cy, 6*s);
    // pupils
    g.fillStyle(0x231f33,1);
    g.fillCircle(cx-7*s, cy+1, 3*s); g.fillCircle(cx+9*s, cy+1, 3*s);
    g.fillStyle(0xffffff,1);
    g.fillCircle(cx-8*s, cy-1, 1.3*s); g.fillCircle(cx+8*s, cy-1, 1.3*s);
    // cheeks
    g.fillStyle(0xff8aa0,0.6);
    g.fillCircle(cx-13*s, cy+7*s, 3*s); g.fillCircle(cx+13*s, cy+7*s, 3*s);
  },

  // ---------------------------------------------------------
  blockTexture(scene, key, blockId){
    const b = BLOCKS[blockId];
    let base;
    if(b.element) base = ELEMENTS[b.element].color;
    else if(blockId==='core') base = 0xf4e26b;
    else base = 0x8be0ff; // prime
    const top = shade(base,60), side = shade(base,-50);
    const g = scene.make.graphics({ x:0, y:0, add:false });
    const S=48;
    // isometric cube
    g.lineStyle(2, 0x231f33, 1);
    // top face (diamond)
    g.fillStyle(top,1);
    g.beginPath(); g.moveTo(24,4); g.lineTo(44,15); g.lineTo(24,26); g.lineTo(4,15); g.closePath(); g.fillPath(); g.strokePath();
    // left face
    g.fillStyle(base,1);
    g.beginPath(); g.moveTo(4,15); g.lineTo(24,26); g.lineTo(24,44); g.lineTo(4,33); g.closePath(); g.fillPath(); g.strokePath();
    // right face
    g.fillStyle(side,1);
    g.beginPath(); g.moveTo(44,15); g.lineTo(24,26); g.lineTo(24,44); g.lineTo(44,33); g.closePath(); g.fillPath(); g.strokePath();
    g.generateTexture(key, S, S);
    g.destroy();
  },

  // ---------------------------------------------------------
  playerTexture(scene, key){
    const g = scene.make.graphics({ x:0, y:0, add:false });
    const cx=16;
    g.fillStyle(0x000000,0.18); g.fillEllipse(cx,30,20,5);
    g.fillStyle(0x3a4a8c,1); g.fillRoundedRect(cx-8,14,16,14,4); // body
    g.fillStyle(0xf2c9a0,1); g.fillCircle(cx,9,7);               // head
    g.fillStyle(0x5b3a23,1); g.fillRoundedRect(cx-7,2,14,7,3);   // hair/cap
    g.fillStyle(0x231f33,1); g.fillCircle(cx-3,10,1.4); g.fillCircle(cx+3,10,1.4);
    g.generateTexture(key, 32, 32);
    g.destroy();
  },

  // ---------------------------------------------------------
  // battle VFX textures (white so they can be tinted per element)
  fxTextures(scene){
    // soft glowing orb
    let g=scene.make.graphics({x:0,y:0,add:false});
    for(let i=14;i>=1;i--){ g.fillStyle(0xffffff, (i/14)*0.10); g.fillCircle(18,18,i*1.25); }
    g.fillStyle(0xffffff,1); g.fillCircle(18,18,5);
    g.generateTexture('fx_orb',36,36); g.destroy();
    // round dot
    g=scene.make.graphics({x:0,y:0,add:false}); g.fillStyle(0xffffff,1); g.fillCircle(6,6,6);
    g.generateTexture('fx_dot',12,12); g.destroy();
    // spark diamond
    g=scene.make.graphics({x:0,y:0,add:false}); g.fillStyle(0xffffff,1);
    g.beginPath(); g.moveTo(5,0); g.lineTo(10,5); g.lineTo(5,10); g.lineTo(0,5); g.closePath(); g.fillPath();
    g.generateTexture('fx_spark',10,10); g.destroy();
    // chunky shard (for terra / impacts)
    g=scene.make.graphics({x:0,y:0,add:false}); g.fillStyle(0xffffff,1);
    g.fillRoundedRect(0,0,12,12,3);
    g.generateTexture('fx_chunk',12,12); g.destroy();
  },

  // ---------------------------------------------------------
  tileTextures(scene){
    const T = CONFIG.TILE;
    const mk = (key, draw)=>{ const g=scene.make.graphics({x:0,y:0,add:false}); draw(g); g.generateTexture(key,T,T); g.destroy(); };

    mk('t_grass', g=>{ g.fillStyle(0x6fae54,1); g.fillRect(0,0,T,T);
      g.fillStyle(0x7cbb5f,1); g.fillRect(0,0,T,2); g.fillStyle(0x5d9846,1);
      for(let i=0;i<5;i++) g.fillRect((i*7)%T, (i*11)%T, 2,2); });

    mk('t_tall', g=>{ g.fillStyle(0x4f9a3c,1); g.fillRect(0,0,T,T);
      g.fillStyle(0x3f7e2e,1);
      for(let i=0;i<6;i++){ const x=2+i*5; g.fillTriangle(x,T, x-3,T-12, x+3,T-12); }
      g.fillStyle(0x6fc04a,1);
      for(let i=0;i<6;i++){ const x=4+i*5; g.fillTriangle(x,T-6, x-2,T-16, x+2,T-16); } });

    mk('t_path', g=>{ g.fillStyle(0xcdb98a,1); g.fillRect(0,0,T,T);
      g.fillStyle(0xbfa877,1); for(let i=0;i<4;i++) g.fillRect((i*9)%T,(i*7)%T,3,3); });

    mk('t_water', g=>{ g.fillStyle(0x3f8fd6,1); g.fillRect(0,0,T,T);
      g.fillStyle(0x67aee8,1); g.fillRect(0,6,T,3); g.fillRect(0,18,T,3); });

    mk('t_tree', g=>{ g.fillStyle(0x6fae54,1); g.fillRect(0,0,T,T);
      g.fillStyle(0x5c3a22,1); g.fillRect(T/2-3,T-12,6,10);
      g.fillStyle(0x2f6f38,1); g.fillCircle(T/2,12,12);
      g.fillStyle(0x3e8e4a,1); g.fillCircle(T/2-4,10,7); });

    mk('t_wall', g=>{ g.fillStyle(0xe6d4ad,1); g.fillRect(0,0,T,T);
      g.fillStyle(0xcdb98a,1); g.fillRect(0,T/2,T,2); g.fillRect(T/2,0,2,T); });

    mk('t_roof', g=>{ g.fillStyle(0xb5483a,1); g.fillRect(0,0,T,T);
      g.fillStyle(0xd06354,1); g.fillRect(0,0,T,5); });

    mk('t_door', g=>{ g.fillStyle(0xe6d4ad,1); g.fillRect(0,0,T,T);
      g.fillStyle(0x5c3a22,1); g.fillRect(T/2-7,6,14,T-6);
      g.fillStyle(0xffcf4d,1); g.fillCircle(T/2+4,T/2+2,1.6); });

    mk('t_forge', g=>{ g.fillStyle(0x3a3550,1); g.fillRect(0,0,T,T);
      g.fillStyle(0x554d78,1); g.fillRect(0,0,T,5);
      g.fillStyle(0xff6b3d,1); g.fillCircle(T/2,T/2+4,7);
      g.fillStyle(0xffd23f,1); g.fillCircle(T/2,T/2+4,3); });
  },
};
