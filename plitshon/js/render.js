// ============================================================
//  RENDER — procedural sprites: creatures, player, NPCs, tiles
//  Style: bright, outlined, shaded "classic" look
// ============================================================

// ---- small drawing helpers ----
function fillEllipse(ctx,cx,cy,rx,ry){ ctx.beginPath(); ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2); ctx.fill(); }
function strokeEllipse(ctx,cx,cy,rx,ry){ ctx.beginPath(); ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2); ctx.stroke(); }

function eyes(ctx,cx,cy,r,gap,opts={}){
  const er=r, look=opts.look||0;
  for(const sx of [-1,1]){
    const x=cx+sx*gap, y=cy;
    ctx.fillStyle="#fff"; fillEllipse(ctx,x,y,er,er*1.15);
    ctx.fillStyle=PAL.outline; fillEllipse(ctx,x+look,y+er*0.2,er*0.5,er*0.6);
    ctx.fillStyle="#fff"; fillEllipse(ctx,x-er*0.25,y-er*0.3,er*0.22,er*0.22); // gloss
  }
}

// ============================================================
//  CREATURE BATTLE/OVERWORLD SPRITES
//  drawCreature(ctx, cx, cy, R, speciesId, t, opts)
//   R   = body radius in px
//   t   = time (ms) for idle animation
//   opts.flip = face left
// ============================================================
function drawCreature(ctx, cx, cy, R, speciesId, t=0, opts={}){
  const c = SPECIES[speciesId].color;
  const cd = darken(c,55), cl = lighten(c,55);
  const bob = Math.sin(t/420)*R*0.05;
  cy += bob;

  ctx.save();
  if(opts.flip){ ctx.translate(cx,0); ctx.scale(-1,1); ctx.translate(-cx,0); }

  // ground shadow
  ctx.fillStyle="rgba(0,0,0,0.18)";
  fillEllipse(ctx, cx, cy+R*1.05, R*0.95, R*0.28);

  ctx.lineJoin="round"; ctx.lineCap="round";
  const OL = Math.max(2, R*0.10);
  ctx.lineWidth=OL; ctx.strokeStyle=PAL.outline;

  // radial shaded body fill helper
  const bodyGrad = (x,y,r)=>{ const g=ctx.createRadialGradient(x-r*0.35,y-r*0.4,r*0.1,x,y,r*1.15); g.addColorStop(0,cl); g.addColorStop(0.55,c); g.addColorStop(1,cd); return g; };

  switch(speciesId){
    case "truk": {
      // ears (lightning)
      ctx.fillStyle=c;
      for(const sx of [-1,1]){
        ctx.beginPath();
        ctx.moveTo(cx+sx*R*0.5, cy-R*0.7);
        ctx.lineTo(cx+sx*R*1.0, cy-R*1.5);
        ctx.lineTo(cx+sx*R*0.95,cy-R*0.9);
        ctx.lineTo(cx+sx*R*1.25,cy-R*1.0);
        ctx.lineTo(cx+sx*R*0.55,cy-R*0.2);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      // tail zigzag
      ctx.fillStyle=c;
      ctx.beginPath();
      ctx.moveTo(cx+R*0.7, cy+R*0.2);
      ctx.lineTo(cx+R*1.5, cy-R*0.1);
      ctx.lineTo(cx+R*1.15,cy+R*0.25);
      ctx.lineTo(cx+R*1.7, cy+R*0.5);
      ctx.lineTo(cx+R*0.8, cy+R*0.7);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      // body
      ctx.fillStyle=bodyGrad(cx,cy,R); fillEllipse(ctx,cx,cy,R,R*0.98); strokeEllipse(ctx,cx,cy,R,R*0.98);
      // cheeks
      ctx.fillStyle="#E2453C"; fillEllipse(ctx,cx-R*0.55,cy+R*0.25,R*0.18,R*0.16); fillEllipse(ctx,cx+R*0.55,cy+R*0.25,R*0.18,R*0.16);
      eyes(ctx,cx,cy-R*0.1,R*0.2,R*0.34,{look:R*0.04});
      // smile
      ctx.strokeStyle=PAL.outline; ctx.lineWidth=OL*0.7; ctx.beginPath(); ctx.arc(cx,cy+R*0.18,R*0.22,0.15*Math.PI,0.85*Math.PI); ctx.stroke();
      break;
    }
    case "bruch": {
      // horns
      ctx.fillStyle=cd;
      for(const sx of [-1,1]){ ctx.beginPath(); ctx.moveTo(cx+sx*R*0.4,cy-R*0.8); ctx.lineTo(cx+sx*R*0.75,cy-R*1.45); ctx.lineTo(cx+sx*R*0.95,cy-R*0.7); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      // tail spikes
      ctx.fillStyle=c; ctx.beginPath(); ctx.moveTo(cx+R*0.8,cy+R*0.1); ctx.lineTo(cx+R*1.7,cy-R*0.2); ctx.lineTo(cx+R*1.4,cy+R*0.35); ctx.lineTo(cx+R*1.8,cy+R*0.7); ctx.lineTo(cx+R*0.9,cy+R*0.75); ctx.closePath(); ctx.fill(); ctx.stroke();
      // body (chunkier)
      ctx.fillStyle=bodyGrad(cx,cy,R*1.1); fillEllipse(ctx,cx,cy,R*1.1,R*1.02); strokeEllipse(ctx,cx,cy,R*1.1,R*1.02);
      // belly
      ctx.fillStyle=lighten(c,35); fillEllipse(ctx,cx,cy+R*0.35,R*0.55,R*0.45);
      eyes(ctx,cx,cy-R*0.15,R*0.2,R*0.38,{look:R*0.04});
      // fanged grin
      ctx.strokeStyle=PAL.outline; ctx.lineWidth=OL*0.7; ctx.beginPath(); ctx.arc(cx,cy+R*0.25,R*0.3,0.1*Math.PI,0.9*Math.PI); ctx.stroke();
      ctx.fillStyle="#fff"; ctx.beginPath(); ctx.moveTo(cx-R*0.2,cy+R*0.4); ctx.lineTo(cx-R*0.08,cy+R*0.62); ctx.lineTo(cx-R*0.32,cy+R*0.5); ctx.closePath(); ctx.fill();
      break;
    }
    case "kassler": {
      // crown of 5 spikes
      ctx.fillStyle=PAL.tYel; const cw=R*1.5;
      ctx.beginPath(); ctx.moveTo(cx-cw,cy-R*0.5);
      for(let i=0;i<5;i++){ const x0=cx-cw+(2*cw)*(i/5), x1=cx-cw+(2*cw)*((i+0.5)/5); ctx.lineTo(x0,cy-R*0.5); ctx.lineTo(x1,cy-R*1.4); }
      ctx.lineTo(cx+cw,cy-R*0.5); ctx.closePath(); ctx.fill(); ctx.stroke();
      // tail
      ctx.fillStyle=c; ctx.beginPath(); ctx.moveTo(cx+R*0.9,cy); ctx.lineTo(cx+R*1.9,cy-R*0.3); ctx.lineTo(cx+R*1.5,cy+R*0.3); ctx.lineTo(cx+R*2.0,cy+R*0.8); ctx.lineTo(cx+R*1.0,cy+R*0.8); ctx.closePath(); ctx.fill(); ctx.stroke();
      // body (large, imposing)
      ctx.fillStyle=bodyGrad(cx,cy,R*1.2); fillEllipse(ctx,cx,cy,R*1.2,R*1.1); strokeEllipse(ctx,cx,cy,R*1.2,R*1.1);
      ctx.fillStyle=lighten(c,30); fillEllipse(ctx,cx,cy+R*0.4,R*0.6,R*0.5);
      // fierce eyes (angled)
      ctx.fillStyle="#fff"; fillEllipse(ctx,cx-R*0.4,cy-R*0.05,R*0.22,R*0.2); fillEllipse(ctx,cx+R*0.4,cy-R*0.05,R*0.22,R*0.2);
      ctx.fillStyle=PAL.outline; fillEllipse(ctx,cx-R*0.36,cy,R*0.1,R*0.13); fillEllipse(ctx,cx+R*0.44,cy,R*0.1,R*0.13);
      ctx.strokeStyle=PAL.outline; ctx.lineWidth=OL*0.8;
      ctx.beginPath(); ctx.moveTo(cx-R*0.6,cy-R*0.35); ctx.lineTo(cx-R*0.2,cy-R*0.2); ctx.moveTo(cx+R*0.6,cy-R*0.35); ctx.lineTo(cx+R*0.2,cy-R*0.2); ctx.stroke(); // brows
      break;
    }
    case "flamix": {
      // flame crest
      ctx.fillStyle=PAL.tYel;
      ctx.beginPath(); ctx.moveTo(cx,cy-R*1.7); ctx.quadraticCurveTo(cx+R*0.5,cy-R*0.9,cx+R*0.2,cy-R*0.6);
      ctx.quadraticCurveTo(cx,cy-R*0.95,cx-R*0.2,cy-R*0.6); ctx.quadraticCurveTo(cx-R*0.5,cy-R*0.9,cx,cy-R*1.7); ctx.closePath(); ctx.fill(); ctx.stroke();
      // body teardrop
      ctx.fillStyle=bodyGrad(cx,cy,R);
      ctx.beginPath(); ctx.moveTo(cx,cy-R*0.7);
      ctx.bezierCurveTo(cx+R*1.1,cy-R*0.1, cx+R*0.8,cy+R, cx,cy+R);
      ctx.bezierCurveTo(cx-R*0.8,cy+R, cx-R*1.1,cy-R*0.1, cx,cy-R*0.7);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      eyes(ctx,cx,cy,R*0.18,R*0.3,{look:R*0.03});
      ctx.strokeStyle=PAL.outline; ctx.lineWidth=OL*0.7; ctx.beginPath(); ctx.arc(cx,cy+R*0.25,R*0.18,0.1*Math.PI,0.9*Math.PI); ctx.stroke();
      break;
    }
    case "aquon": {
      // top fin
      ctx.fillStyle=cd; ctx.beginPath(); ctx.moveTo(cx,cy-R*1.4); ctx.lineTo(cx+R*0.45,cy-R*0.6); ctx.lineTo(cx-R*0.45,cy-R*0.6); ctx.closePath(); ctx.fill(); ctx.stroke();
      // body droplet
      ctx.fillStyle=bodyGrad(cx,cy,R); fillEllipse(ctx,cx,cy,R,R*1.05); strokeEllipse(ctx,cx,cy,R,R*1.05);
      // shine
      ctx.fillStyle="rgba(255,255,255,0.5)"; fillEllipse(ctx,cx-R*0.4,cy-R*0.4,R*0.22,R*0.32);
      eyes(ctx,cx,cy-R*0.05,R*0.18,R*0.32,{look:R*0.03});
      ctx.strokeStyle=PAL.outline; ctx.lineWidth=OL*0.7; ctx.beginPath(); ctx.arc(cx,cy+R*0.3,R*0.16,0,Math.PI); ctx.stroke();
      break;
    }
    case "stonk": {
      // rocky faceted body
      const pts=[[0,-1],[0.85,-0.5],[0.95,0.5],[0.4,1],[-0.4,1],[-0.95,0.5],[-0.85,-0.5]];
      ctx.fillStyle=bodyGrad(cx,cy,R);
      ctx.beginPath(); pts.forEach((p,i)=>{ const x=cx+p[0]*R*1.05,y=cy+p[1]*R; i?ctx.lineTo(x,y):ctx.moveTo(x,y); }); ctx.closePath(); ctx.fill(); ctx.stroke();
      // facet lines
      ctx.strokeStyle=darken(c,40); ctx.lineWidth=OL*0.5;
      ctx.beginPath(); ctx.moveTo(cx-R*0.6,cy-R*0.2); ctx.lineTo(cx,cy+R*0.1); ctx.lineTo(cx+R*0.7,cy-R*0.3); ctx.stroke();
      eyes(ctx,cx,cy+R*0.05,R*0.16,R*0.3);
      break;
    }
    case "glitx": {
      // glitch slices behind
      ctx.fillStyle="#00E0FF"; ctx.globalAlpha=0.7; ctx.fillRect(cx-R*0.9+4,cy-R*0.5,R*1.8,R*0.3);
      ctx.fillStyle="#FF2D78"; ctx.fillRect(cx-R*0.9-4,cy+R*0.25,R*1.6,R*0.25); ctx.globalAlpha=1;
      // square body
      ctx.fillStyle=bodyGrad(cx,cy,R);
      const s=R*0.92; roundRectPath(ctx,cx-s,cy-s,s*2,s*2,R*0.18); ctx.fill(); ctx.stroke();
      // pixel eyes
      ctx.fillStyle="#fff"; ctx.fillRect(cx-R*0.5,cy-R*0.25,R*0.3,R*0.3); ctx.fillRect(cx+R*0.2,cy-R*0.25,R*0.3,R*0.3);
      ctx.fillStyle=PAL.outline; ctx.fillRect(cx-R*0.42,cy-R*0.15,R*0.15,R*0.15); ctx.fillRect(cx+R*0.28,cy-R*0.15,R*0.15,R*0.15);
      // glitch mouth
      ctx.fillStyle=PAL.outline; ctx.fillRect(cx-R*0.3,cy+R*0.35,R*0.6,R*0.1);
      break;
    }
  }
  ctx.restore();
}

function roundRectPath(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
}

// ============================================================
//  PLAYER & NPC overworld figures (animated walk)
// ============================================================
function drawPlayer(ctx, px, py, dir, frame){
  drawHuman(ctx, px, py, dir, frame, {coat:"#E8772E", coatDk:"#B85A1E", cap:"#2E5AAC", capDk:"#214488", hair:"#6B4326"});
}
function drawNPCFigure(ctx, px, py, dir, color){
  drawHuman(ctx, px, py, dir, 0, {coat:color, coatDk:darken(color,50), cap:darken(color,20), capDk:darken(color,60), hair:"#4A3520"});
}

// human figure centered in a 32px tile, ~26px tall
function drawHuman(ctx, px, py, dir, frame, col){
  const cx = px + TILE/2;
  const topY = py + 4;
  const OL = 2;
  ctx.save();
  ctx.lineJoin="round";
  // shadow
  ctx.fillStyle="rgba(0,0,0,0.18)"; fillEllipse(ctx,cx,py+TILE-3,9,3.5);

  const legSwing = frame===1 ? 2 : (frame===2 ? -2 : 0);

  // legs
  ctx.fillStyle="#3A4A6A"; ctx.strokeStyle=PAL.outline; ctx.lineWidth=OL;
  ctx.fillRect(cx-5, topY+15, 4, 8+ (frame===1?-1:0));
  ctx.fillRect(cx+1, topY+15, 4, 8+ (frame===2?-1:0));
  ctx.strokeRect(cx-5, topY+15, 4, 8); ctx.strokeRect(cx+1, topY+15, 4, 8);

  // body / coat
  ctx.fillStyle=col.coat;
  roundRectPath(ctx, cx-7, topY+7, 14, 11, 3); ctx.fill(); ctx.strokeStyle=PAL.outline; ctx.lineWidth=OL; ctx.stroke();
  ctx.fillStyle=col.coatDk; ctx.fillRect(cx-7, topY+13, 14, 2); // belt shade

  // head
  ctx.fillStyle="#F0C79A";
  roundRectPath(ctx, cx-6, topY, 12, 9, 3); ctx.fill(); ctx.stroke();
  // cap
  ctx.fillStyle=col.cap;
  roundRectPath(ctx, cx-7, topY-2, 14, 5, 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle=col.capDk; ctx.fillRect(cx-7, topY+2, 14, 1.5);

  // face by direction
  ctx.fillStyle=PAL.outline;
  if(dir===2){ // down — eyes
    ctx.fillRect(cx-3, topY+4, 2, 2); ctx.fillRect(cx+1, topY+4, 2, 2);
  } else if(dir===0){ // up — back of head (hair)
    ctx.fillStyle=col.hair; ctx.fillRect(cx-5, topY+3, 10, 5);
  } else if(dir===1){ // right
    ctx.fillRect(cx+2, topY+4, 2, 2);
    ctx.fillStyle=col.hair; ctx.fillRect(cx-5, topY+3, 4, 5);
  } else { // left
    ctx.fillRect(cx-4, topY+4, 2, 2);
    ctx.fillStyle=col.hair; ctx.fillRect(cx+1, topY+3, 4, 5);
  }
  ctx.restore();
}

// small wild creature overworld marker (e.g. Truk in grove)
function drawOverworldCreature(ctx, px, py, speciesId, t){
  drawCreature(ctx, px+TILE/2, py+TILE/2-2, 9, speciesId, t);
}

// ============================================================
//  TILE RENDERING (animated water & tulips)
// ============================================================
function drawTileAt(ctx, id, px, py, t){
  switch(id){
    case T_GRASS: grassBase(ctx,px,py); break;
    case T_FLOWER: grassBase(ctx,px,py); flowerDeco(ctx,px,py); break;
    case T_TALL: grassBase(ctx,px,py); tallGrass(ctx,px,py,t); break;
    case T_PATH: pathTile(ctx,px,py); break;
    case T_SAND: ctx.fillStyle=PAL.sand; ctx.fillRect(px,py,TILE,TILE); ctx.fillStyle=PAL.sandDk; ctx.fillRect(px+5,py+18,3,3); ctx.fillRect(px+20,py+8,3,3); break;
    case T_WATER: waterTile(ctx,px,py,t); break;
    case T_BRIDGE: bridgeTile(ctx,px,py); break;
    case T_TREE: grassBase(ctx,px,py); treeTile(ctx,px,py); break;
    case T_TULR: tulipTile(ctx,px,py,PAL.tRed,PAL.tRedDk); break;
    case T_TULY: tulipTile(ctx,px,py,PAL.tYel,PAL.tYelDk); break;
    case T_WALL: wallTile(ctx,px,py); break;
    case T_ROOF: roofTile(ctx,px,py); break;
    case T_CROOF: crossRoofTile(ctx,px,py); break;
    case T_DOOR: wallTile(ctx,px,py); doorTile(ctx,px,py); break;
    case T_CDOOR: wallTile(ctx,px,py); doorTile(ctx,px,py,true); break;
    case T_MILL: grassBase(ctx,px,py); millTile(ctx,px,py,t); break;
    case T_SIGN: grassBase(ctx,px,py); signTile(ctx,px,py); break;
    case T_FENCE: grassBase(ctx,px,py); fenceTile(ctx,px,py); break;
    default: grassBase(ctx,px,py);
  }
}

function grassBase(ctx,px,py){
  ctx.fillStyle=PAL.grass; ctx.fillRect(px,py,TILE,TILE);
  ctx.fillStyle=PAL.grassDk;
  ctx.fillRect(px+6,py+22,3,2); ctx.fillRect(px+22,py+10,3,2); ctx.fillRect(px+14,py+27,3,2);
  ctx.fillStyle=PAL.grassLt; ctx.fillRect(px+10,py+6,2,2); ctx.fillRect(px+26,py+20,2,2);
}
function flowerDeco(ctx,px,py){
  const cs=[PAL.tRed,PAL.tYel,PAL.tPink,"#fff"];
  const spots=[[8,10],[20,14],[14,22]];
  spots.forEach((s,i)=>{ ctx.fillStyle=cs[i%cs.length]; fillEllipse(ctx,px+s[0],py+s[1],2.5,2.5); ctx.fillStyle=PAL.tYel; fillEllipse(ctx,px+s[0],py+s[1],1,1); });
}
function tallGrass(ctx,px,py,t){
  const sway=Math.sin((t/300)+(px+py))*1.2;
  ctx.fillStyle=PAL.tallDk; ctx.fillRect(px,py,TILE,TILE);
  ctx.strokeStyle=PAL.tall; ctx.lineWidth=2; ctx.lineCap="round";
  for(let i=0;i<5;i++){ const bx=px+4+i*6; ctx.beginPath(); ctx.moveTo(bx,py+TILE-2); ctx.lineTo(bx+sway,py+10); ctx.stroke(); }
  ctx.strokeStyle=PAL.tallTip; ctx.lineWidth=1;
  for(let i=0;i<5;i++){ const bx=px+4+i*6; ctx.beginPath(); ctx.moveTo(bx,py+22); ctx.lineTo(bx+sway,py+10); ctx.stroke(); }
}
function pathTile(ctx,px,py){
  ctx.fillStyle=PAL.brick; ctx.fillRect(px,py,TILE,TILE);
  ctx.strokeStyle=PAL.brickLn; ctx.lineWidth=1;
  // brick courses
  for(let r=0;r<4;r++){ const y=py+r*8; ctx.beginPath(); ctx.moveTo(px,y+0.5); ctx.lineTo(px+TILE,y+0.5); ctx.stroke();
    const off=(r%2)?0:8; for(let bx=off;bx<TILE;bx+=16){ ctx.beginPath(); ctx.moveTo(px+bx+0.5,y); ctx.lineTo(px+bx+0.5,y+8); ctx.stroke(); } }
  ctx.fillStyle=PAL.brickDk; ctx.fillRect(px+2,py+2,2,1);
}
function waterTile(ctx,px,py,t){
  ctx.fillStyle=PAL.water; ctx.fillRect(px,py,TILE,TILE);
  const o=Math.sin(t/500+px*0.1)*2;
  ctx.strokeStyle=PAL.waterLt; ctx.lineWidth=2; ctx.lineCap="round";
  for(let i=0;i<3;i++){ const y=py+8+i*9; ctx.beginPath(); ctx.moveTo(px+4+o,y); ctx.quadraticCurveTo(px+12,y-2,px+20+o,y); ctx.stroke(); }
  ctx.strokeStyle=PAL.waterDk; ctx.beginPath(); ctx.moveTo(px+2,py+TILE-3); ctx.lineTo(px+TILE-2,py+TILE-3); ctx.stroke();
}
function bridgeTile(ctx,px,py){
  ctx.fillStyle=PAL.water; ctx.fillRect(px,py,TILE,TILE);
  ctx.fillStyle="#9C6B3A"; ctx.fillRect(px,py+4,TILE,TILE-8);
  ctx.strokeStyle="#6B4326"; ctx.lineWidth=1;
  for(let bx=px;bx<px+TILE;bx+=6){ ctx.beginPath(); ctx.moveTo(bx,py+4); ctx.lineTo(bx,py+TILE-4); ctx.stroke(); }
  ctx.fillStyle="#6B4326"; ctx.fillRect(px,py+2,TILE,2); ctx.fillRect(px,py+TILE-4,TILE,2);
}
function treeTile(ctx,px,py){
  ctx.fillStyle=PAL.trunkDk; ctx.fillRect(px+13,py+20,6,10);
  ctx.fillStyle=PAL.trunk; ctx.fillRect(px+13,py+20,3,10);
  ctx.fillStyle=PAL.leafDk; fillEllipse(ctx,px+16,py+13,13,12);
  ctx.fillStyle=PAL.leaf; fillEllipse(ctx,px+16,py+12,11,10);
  ctx.fillStyle=PAL.leafLt; fillEllipse(ctx,px+12,py+9,4,3.5); fillEllipse(ctx,px+20,py+14,3,2.5);
}
function tulipTile(ctx,px,py,col,cold){
  ctx.fillStyle=PAL.grassDk; ctx.fillRect(px,py,TILE,TILE);
  // rows of tulips
  for(let r=0;r<2;r++) for(let c=0;c<2;c++){
    const x=px+9+c*14, y=py+10+r*13;
    ctx.strokeStyle=PAL.stem; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x,y+7); ctx.stroke();
    ctx.fillStyle=cold; roundRectPath(ctx,x-4,y-5,8,7,2.5); ctx.fill();
    ctx.fillStyle=col; roundRectPath(ctx,x-3.5,y-4.5,7,5.5,2); ctx.fill();
  }
}
function wallTile(ctx,px,py){
  ctx.fillStyle=PAL.wall; ctx.fillRect(px,py,TILE,TILE);
  ctx.strokeStyle=PAL.wallDk; ctx.lineWidth=1;
  for(let r=0;r<4;r++){ const y=py+r*8; ctx.beginPath(); ctx.moveTo(px,y+0.5); ctx.lineTo(px+TILE,y+0.5); ctx.stroke(); }
  // window
  ctx.fillStyle=PAL.outline; ctx.fillRect(px+10,py+9,12,11);
  ctx.fillStyle=PAL.window; ctx.fillRect(px+11,py+10,10,9);
  ctx.strokeStyle=PAL.wallDk; ctx.beginPath(); ctx.moveTo(px+16,py+10); ctx.lineTo(px+16,py+19); ctx.moveTo(px+11,py+14.5); ctx.lineTo(px+21,py+14.5); ctx.stroke();
}
function roofTile(ctx,px,py){
  ctx.fillStyle=PAL.roofDk; ctx.fillRect(px,py,TILE,TILE);
  ctx.fillStyle=PAL.roof; ctx.fillRect(px,py+3,TILE,TILE-3);
  ctx.fillStyle=PAL.roofLt; ctx.fillRect(px,py+3,TILE,3);
  ctx.strokeStyle=PAL.roofDk; ctx.lineWidth=1;
  for(let bx=px+4;bx<px+TILE;bx+=8){ ctx.beginPath(); ctx.moveTo(bx,py+6); ctx.lineTo(bx,py+TILE); ctx.stroke(); }
}
function crossRoofTile(ctx,px,py){
  ctx.fillStyle=PAL.cRoofDk; ctx.fillRect(px,py,TILE,TILE);
  ctx.fillStyle=PAL.cRoof; ctx.fillRect(px,py+3,TILE,TILE-3);
  ctx.fillStyle="#F07A6E"; ctx.fillRect(px,py+3,TILE,3);
  // white medical cross
  ctx.fillStyle="#fff";
  ctx.fillRect(px+13,py+8,6,18);
  ctx.fillRect(px+7,py+14,18,6);
}
function doorTile(ctx,px,py,medical){
  ctx.fillStyle=PAL.door; roundRectPath(ctx,px+8,py+6,16,26,3); ctx.fill();
  ctx.fillStyle=darken(PAL.door,30); ctx.fillRect(px+15,py+8,2,22);
  if(medical){ ctx.fillStyle="#fff"; ctx.fillRect(px+14,py+12,4,10); ctx.fillRect(px+11,py+15,10,4);
    ctx.fillStyle=PAL.cRoof; ctx.fillRect(px+15,py+13,2,8); ctx.fillRect(px+12,py+16,8,2); }
  else { ctx.fillStyle=PAL.tYel; fillEllipse(ctx,px+20,py+20,1.6,1.6); }
}
function millTile(ctx,px,py,t){
  ctx.fillStyle=PAL.millBody; roundRectPath(ctx,px+9,py+10,14,22,3); ctx.fill();
  ctx.strokeStyle=PAL.millDk; ctx.lineWidth=1; strokeEllipse(ctx,px+16,py+10,7,4);
  // rotating blades
  const cx=px+16, cy=py+9, a=t/600;
  ctx.strokeStyle=PAL.millBlade; ctx.lineWidth=2;
  for(let i=0;i<4;i++){ const ang=a+i*Math.PI/2; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(ang)*11, cy+Math.sin(ang)*11); ctx.stroke(); }
  ctx.fillStyle=PAL.outline; fillEllipse(ctx,cx,cy,2,2);
  ctx.fillStyle=PAL.window; ctx.fillRect(px+13,py+18,6,6);
}
function signTile(ctx,px,py){
  ctx.fillStyle=PAL.trunkDk; ctx.fillRect(px+15,py+14,3,14);
  ctx.fillStyle="#C9A56E"; roundRectPath(ctx,px+6,py+6,20,12,2); ctx.fill();
  ctx.strokeStyle=PAL.trunkDk; ctx.lineWidth=1; ctx.strokeRect(px+6,py+6,20,12);
  ctx.fillStyle=PAL.trunkDk; ctx.fillRect(px+9,py+9,14,1.5); ctx.fillRect(px+9,py+12,14,1.5); ctx.fillRect(px+9,py+15,9,1.5);
}
function fenceTile(ctx,px,py){
  ctx.strokeStyle=PAL.fenceDk; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(px+2,py+18); ctx.lineTo(px+TILE-2,py+18); ctx.stroke();
  ctx.fillStyle=PAL.fence;
  for(let bx=px+4;bx<px+TILE;bx+=10){ ctx.fillRect(bx,py+12,3,14); }
}
