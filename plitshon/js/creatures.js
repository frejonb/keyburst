// ============================================================
//  PLITSHON — creatures.js
//  High-quality pixel-art creature sprites.
//  Defines the global drawCreature(ctx, cx, cy, R, speciesId, t, opts).
//  Self-contained: plain browser JS, no modules/imports.
//
//  Each creature is authored as a grid of logical pixels using a
//  string map. Each character is a palette key. The grid is rendered
//  as crisp filled rects scaled to fit R, giving deliberate pixel art.
// ============================================================
(function () {
  "use strict";

  // ---------- color helpers (self-contained) ----------
  function hexToRgb(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  }
  function rgbToHex(r, g, b) {
    const h = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
    return "#" + h(r) + h(g) + h(b);
  }
  function lighten(hex, amt) {
    if (amt == null) amt = 60;
    const [r, g, b] = hexToRgb(hex);
    return rgbToHex(r + amt, g + amt, b + amt);
  }
  function darken(hex, amt) {
    if (amt == null) amt = 60;
    const [r, g, b] = hexToRgb(hex);
    return rgbToHex(r - amt, g - amt, b - amt);
  }
  // blend toward a target color by f (0..1)
  function mix(hex, target, f) {
    const a = hexToRgb(hex), b = hexToRgb(target);
    return rgbToHex(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f);
  }

  const OUTLINE = "#2A2433";

  // ============================================================
  //  Sprite grids. Legend (shared meaning across species):
  //    space / '.'  = transparent
  //    'o'          = dark outline
  //    'B'          = base body color
  //    's'          = body shadow tone
  //    'h'          = body highlight tone
  //    'H'          = bright highlight / glint area
  //    'a'          = accent 1 (species specific)
  //    'A'          = accent 1 dark
  //    'b'          = accent 2
  //    'c'          = cheek / blush
  //    'e'          = eye dark (iris)
  //    'w'          = eye white / glint
  //    'm'          = mouth / muzzle dark
  //    't'          = tooth / white detail
  //    'g'          = belly / lighter underside
  //  Each species supplies a palette mapping these keys -> hex.
  //  Grids are 40 wide. Height varies (centered logic handled below).
  // ============================================================

  // ---- TRUK: cute electric mouse, yellow, lightning ears + tail, red cheeks
  const TRUK = [
    "...........oo...............oo..........",
    "..........oBo.............oBo...........",
    "..........osBo...........oBso...........",
    "...........oBBo.........oBBo............",
    "............oBBo.......oBBo.............",
    ".....oo......oBBoo...ooBBo......oo......",
    "....oBBoo.....oBBBoooBBBo....ooBBo......",
    "...oBhhBBoooooBBBBBBBBBBBooooBBhBo......",
    "...oBhhhBBBBBBBBhhhhhhBBBBBBBBhhBo......",
    "...oBhhBBBhhhhhhhhhhhhhhhhhBBBhhBo......",
    "....ooBBhhhhhhhhhhhhhhhhhhhhhBBoo.......",
    "......oBhhhhhhhhhhhhhhhhhhhhhhBo........",
    ".....oBhhhhhwwwhhhhhhhhwwwhhhhhBo.......",
    ".....oBhhhhwweohhhhhhhweowwhhhhBo.......",
    ".....oBhhhhweeohhhhhhhweeowhhhhBo.......",
    ".....oBhhhhhwoohhhhhhhhwoohhhhhBo.......",
    "....oBccchhhhhhhhmmmhhhhhhhccccBo.......",
    "....oBcccchhhhhmmtttmmhhhhhcccBo........",
    ".....oBcchhhhhhmtttttmhhhhhhcBo.........",
    "......oBhhhhhhhhmmmmmhhhhhhhBo..........",
    ".......oBhhhhhhhhhhhhhhhhhhBo...........",
    "........oBhhhhhhhhhhhhhhhhBo......aaoo...",
    "........oBshhhhhhhhhhhhhhBo.....aaAAo....",
    ".........oBshhhhhhhhhhhhBo....aaAAo......",
    "..........oBsshhhhhhhsBoo...aaAAo........",
    "...........oBBsshhssBBo...aaAAaao........",
    "............ooBBsssBBo...aAAo..aao.......",
    "...........oBoooBBooooo.aaAo.............",
    "..........oBBo...oBBo..aAAo..............",
    "..........oBBo...oBBo.aaAo...............",
    "..........oggo...oggo.ooo................",
    "...........oo.....oo....................",
  ];

  // ---- BRUCH: bigger orange, two horns, fanged grin, spiky tail
  const BRUCH = [
    "......oo..................oo............",
    ".....oao o...............o oao..........",
    ".....oaAo.oo...........oo.oAao..........",
    "......oaAo.oBo.......oBo.oAao...........",
    ".......oAo.oBBo.....oBBo.oAo............",
    "........ooooBBBoo000oBBBoooo............",
    ".......oBBBBBBBBhhhhhBBBBBBBBo..........",
    "......oBhhhBBBhhhhhhhhhBBBhhhBo.........",
    ".....oBhhhhBhhhhhhhhhhhhhBhhhhBo........",
    ".....oBhhhhhhhhhhhhhhhhhhhhhhhBo........",
    "....oBhhhhwwhhhhhhhhhhhhhhwwhhhBo.......",
    "....oBhhhwweohhhhhhhhhhhhweowhhhBo......",
    "....oBhhhweeohhhhhhhhhhhhweeowhhBo......",
    "....oBcchhhwoohhhhhhhhhhhhwoohccBo......",
    "...oBccchhhhhhhhmmmmmmhhhhhhhccBo.......",
    "...oBcccchhhhhmmtmttmtmmhhhhhccBo.......",
    "....oBcchhhhhmttttttttttmhhhhcBo........",
    ".....oBhhhhhhmmttttttttmmhhhhBo.........",
    "......oBhhhhhhhmmmmmmmmhhhhhBo..........",
    ".......oBhhhhhhhhhhhhhhhhhhBo.......oo...",
    "......oBshhhhhhhhhhhhhhhhhhhBo....oaao...",
    ".....oBsshhhhhhhhhhhhhhhhhhhsBo..oaAao...",
    ".....oBsshhhhhhhhhhhhhhhhhhssBo.oaAaoo...",
    "....oBssshhhhhhhhhhhhhhhhhsssBoooaAo.....",
    "....oBsssshhhhhhhhhhhhhhssssBo.oaAao.....",
    "....oBssoBsssshhhhhhssssBoosBoaaAo.......",
    "...oBsoo.ooBBssssssssBBooo.oBBaAo........",
    "...oBBo....ooBBBBBBBBoo....oBaaAo........",
    "..oBBo...oBBoo......ooBBo..ooaAao........",
    "..oggo..oBBo..........oBBo..oaao.........",
    "...oo..oggo............oggo..oo..........",
    ".......oo................oo.............",
  ];

  // ---- KASSLER: imposing magenta, crown of spikes, intense eyes
  const KASSLER = [
    "....o....oo....oo....oo....o............",
    "...oao..oao o.oao o.o oao.oao...........",
    "...oAo.oaAo.o.aAo.o.o.oAao.oAo..........",
    "...oAo.oAo.oaAo.oaAo.oAo.oAo.oAo........",
    "...oAooAo.oaAo.oaAao.oAo.oAoo Ao........",
    "....ooooo.oAo.oaAAao.oAo.ooooo..........",
    ".....oBBBooooBBBBBBBBoooooBBBo..........",
    "....oBBhhBBBBhhhhhhhhBBBBhhhBBo.........",
    "...oBhhhhhhhhhhhhhhhhhhhhhhhhhBo........",
    "...oBhhhhhhhhhhhhhhhhhhhhhhhhhBo........",
    "..oBhhhhwwhhhhhhhhhhhhhhhhwwhhhBo.......",
    "..oBhhhwweeohhhhhhhhhhhhhweeowhhBo......",
    "..oBhhhweeeohhhhhhhhhhhhhweeeowhBo......",
    "..oBhhhhweehhhhhhhhhhhhhhhweehhhBo......",
    "..oBhhhhhwohhhhhhhhhhhhhhhhwohhhBo......",
    "..oBcchhhhhhhhmmmmmmmmhhhhhhhccBo.......",
    ".oBccchhhhhhmmttttttttmmhhhhhccBo.......",
    ".oBccchhhhhmtttmttmtttmthhhhhccBo.......",
    ".oBcchhhhhhmttttttttttttmhhhhcBo........",
    "..oBhhhhhhhmmttttttttttmmhhhhBo.........",
    "..oBhhhhhhhhhmmmmmmmmmmhhhhhhBo.........",
    ".oBhhhhhhhhhhhhhhhhhhhhhhhhhhhBo........",
    ".oBshhhhhhhhhhhhhhhhhhhhhhhhhhBo........",
    "oBsshhhhhhhhhhhhhhhhhhhhhhhhhssBo.......",
    "oBssshhhhhhhhhhhhhhhhhhhhhhhsssBo...oo..",
    "oBssoBhhhhhhhhhhhhhhhhhhhhBosssBo..oaao.",
    "oBsoo.oBsshhhhhhhhhhhhhhssBo.osBo.oaAao.",
    "oBBo...ooBBssshhhhhhsssBBoo..oBBoaaAao..",
    "oBo......ooBBBBBBBBBBBBoo....oBoaaAaoo...",
    "oBo...oBBoo.oo....oo.ooBBo...oaaAAo......",
    "oggo.oBBo..oggo..oggo..oBBo.oaAao........",
    ".oo..oggo...oo....oo....oggo.ooo.........",
  ];

  // ---- FLAMIX: small fire creature, teardrop body, flame crest
  const FLAMIX = [
    "...................oo...................",
    "..................oao...................",
    ".........oo......oaAo......oo...........",
    "........oao.....oaAao.....oao...........",
    "........oAao...oaAaAo....oaAo...........",
    ".........oAaoooaAaaAoooooaAo............",
    "..........oaAaaAaaaaAaaaAao.............",
    "...........oaAaaaaaaaaaAao..............",
    "............ooaAaaaaAaoo................",
    ".............oBBaaaaBBo.................",
    "...........oBBhhhhhhhhBBo...............",
    "..........oBhhhhhhhhhhhhBo..............",
    ".........oBhhhwwhhhhwwhhhhBo............",
    ".........oBhhwweohhweowhhhBo............",
    ".........oBhhweeohhweeowhhBo............",
    ".........oBhhhwoohhhwoohhhBo............",
    "........oBcchhhhhmmmhhhhhccBo...........",
    "........oBccchhhhmtmhhhhcccBo...........",
    ".........oBhhhhhhmmmhhhhhhBo............",
    ".........oBhhhhhhhhhhhhhhhBo............",
    "..........oBhhhhhhhhhhhhhBo.............",
    "...........oBshhhhhhhhhsBo..............",
    "...........oBsshhhhhhssBo...............",
    "............oBBsshhssBBo................",
    ".............ooBBsssBBo.................",
    "............oBoooBBoooBo................",
    "...........oBBo..oo..oBBo...............",
    "...........oggo......oggo...............",
    "............oo........oo................",
  ];

  // ---- AQUON: water droplet, dorsal fin, glossy shine, calm eyes
  const AQUON = [
    "...................oo...................",
    "..................oBo...................",
    ".................oBso...................",
    "................oBsbo...................",
    "...............oBsbBo...........oo......",
    "..............oBsbBBo.........oao.......",
    ".............oBsbBBBo........oaAo.......",
    "............oBBBBBBBoo......oaAo........",
    "..........oBBhhhhhhBBBo....oaAo.........",
    ".........oBhhhhhhhhhhhBoooooaAo.........",
    "........oBhhHhhhhhhhhhhBaaaaAo..........",
    ".......oBhhHhhhhhhhhhhhhBaaAo...........",
    ".......oBhHhhhhhhhhhhhhhhBAo............",
    "......oBhhhhwwhhhhhhwwhhhhBo............",
    "......oBhhhwweohhhhwweowhhBo............",
    "......oBhhhweeohhhhweeowhhBo............",
    "......oBhhhhwoohhhhhwoohhhBo............",
    "......oBhhhhhhhhhhhhhhhhhhBo............",
    "......oBghhhhhhhmmmhhhhhhgBo............",
    ".......oBghhhhhmmmmmhhhhgBo.............",
    ".......oBgghhhhhhhhhhhhggBo.............",
    "........oBgghhhhhhhhhhggBo..............",
    ".........oBggghhhhhhgggBo...............",
    "..........oBgggsssssggBo................",
    "...........oBBgggggBBoo.................",
    "..........oBoooBBooooBo.................",
    ".........oBBo..oo...oBBo................",
    ".........oggo.......oggo................",
    "..........oo.........oo.................",
  ];

  // ---- STONK: rock boulder, faceted, cracks, small determined eyes
  const STONK = [
    "........................................",
    "..............ooooo.....................",
    "............ooBhhhBoo...................",
    "..........ooBhhhhhhhBoo.................",
    ".........oBhhhhhhhhhhhhBo...............",
    "........oBhhhhhhhssBhhhhhBo.............",
    ".......oBhhhhhhssooosBhhhhBo............",
    "......oBhhhhhhBso...osBhhhhBo...........",
    ".....oBhhhhhhBo.......oBhhhhBo..........",
    "....oBhhhhhhBo.........oBhhhhBo.........",
    "...oBhhhhhhBo...........oBhhhhBo........",
    "..oBhhhhhhhBoooo...ooooBhhhhhhBo........",
    "..oBhhhhhhhhhhhhhhhhhhhhhhhhhhBo........",
    ".oBhhhhsshhhhhhhhhhhhhhhhssshhhBo.......",
    ".oBhhsssshhhwwwhhhhwwwhhhssshhhBo.......",
    ".oBhhhsshhhweeohhhhweeohhhsshhhBo.......",
    "oBhhhhhhhhhweeohhhhweeohhhhhhhhhBo......",
    "oBhsssshhhhhwoohhhhwoohhhhsssshhBo......",
    "oBssBosshhhhhhmmmmmmhhhhhhsssBsssBo.....",
    "oBsBo.osshhhhmttttmhhhhsssBo.oBsssBo....",
    "oBBo...oBsshhhmmmmmhhhsssBo...oBsssBo...",
    "oBo.....oBsssshhhhhhsssBo......oBssBo...",
    "oBo..oo..oBBssssssssBBo..oo.....oBBBo...",
    ".oBoooBo...oBBBBBBBBo...oBoo.....oBBo...",
    "..oooo.......oooooo.....oooo.....ooo....",
    "........................................",
    "........................................",
    "........................................",
  ];

  // ---- GLITX: digital glitch creature, purple, blocky pixel eyes
  const GLITX = [
    "........................................",
    "......o..ooooo......ooooo..o............",
    ".....oao.oBaBo.....oBaBo..oao...........",
    ".....oAaooBBBoooooooBBBooaaAo...........",
    "......oAaoBBBBBBBBBBBBBoaaAo............",
    ".......oBBBhhhhhhhhhhBBBBo..............",
    "......oBBhhhhhhhhhhhhhhBBBo.............",
    ".....oBBhhhhhhhhhhhhhhhhhBBo............",
    "...bboBhhhhhhhhhhhhhhhhhhhBobb..........",
    "...bAoBhWWWWhhhhhhhhWWWWhhBoAb..........",
    "...oBoBhWeeWhhhhhhhhWeeWhhBoBo..........",
    "..aaBoBhWeeWhhhhhhhhWeeWhhBoBaa.........",
    "..aABoBhWWWWhhhhhhhhWWWWhhBoBAa.........",
    "...oBoBhhhhhhhhhhhhhhhhhhhBoBo..........",
    "...oBoBhhhhhhmmmmmmmmhhhhhBoBo..........",
    "....oBhhhhhhmmmmmmmmmmhhhhBo............",
    "....oBhhsshhmtmtmtmtmmhhsshBo...........",
    "...bbBhhsshhmmmmmmmmmmhhsshBobb.........",
    "...bAoBhsshhhhhhhhhhhhhsshBoAb..........",
    "...oBoBhhssshhhhhhhhsssshhBoBo..........",
    "....oBhhhsssshhhhhhssssBhhBo............",
    "....oBshhhhssssssssssBhhhsBo............",
    "...aaBsshhhhhBBBBBBBhhhhssBaa...........",
    "...aABBssoooBBo..oBBoooosBBAa..........",
    "....ooBBo.oBBo....oBBo.oBBoo............",
    ".....bboggo.bbo..obb.oggobb.............",
    "......o.oo...........oo.o...............",
    "........................................",
  ];

  // ---------- per-species palette builders ----------
  // Returns a map from grid char -> hex (or null for transparent).
  function paletteFor(speciesId) {
    const eyeW = "#FFFFFF";
    const eyeD = "#2A2433";
    const tooth = "#FFFFFF";
    const mouth = "#5A2030";

    function tones(base, opts) {
      opts = opts || {};
      return {
        "o": OUTLINE,
        "B": base,
        "s": darken(base, opts.sh || 45),
        "h": lighten(base, opts.hi || 40),
        "H": lighten(base, opts.hi2 || 90),
        "g": lighten(base, opts.belly || 70),
        "e": eyeD,
        "w": eyeW,
        "W": eyeW,
        "t": tooth,
        "m": opts.mouth || mouth,
        "c": opts.cheek || "#E2453C",
      };
    }

    switch (speciesId) {
      case "truk": {
        const base = "#F2D02E";
        const p = tones(base, { sh: 60, hi: 30, cheek: "#E2453C", mouth: "#6B3A1C" });
        // accent = lightning (warm yellow / amber)
        p["a"] = "#FFE96B";
        p["A"] = "#E0A21C";
        return p;
      }
      case "bruch": {
        const base = "#F2922E";
        const p = tones(base, { sh: 60, hi: 35, cheek: "#E2453C", mouth: "#5A2A14" });
        p["a"] = "#FFD27A"; // horn light
        p["A"] = "#C96A18"; // horn dark
        p["0"] = lighten(base, 35);
        return p;
      }
      case "kassler": {
        const base = "#FF4F8B";
        const p = tones(base, { sh: 55, hi: 45, cheek: "#C61E5A", mouth: "#7A123A" });
        p["a"] = "#FF96BE"; // crown spike light
        p["A"] = "#C61E5A"; // crown spike dark
        return p;
      }
      case "flamix": {
        const base = "#F2622E";
        const p = tones(base, { sh: 60, hi: 45, cheek: "#D43A1A", mouth: "#5A1A0A" });
        p["a"] = "#FFC83C"; // flame crest light
        p["A"] = "#F2622E"; // flame crest mid
        return p;
      }
      case "aquon": {
        const base = "#3FB5E2";
        const p = tones(base, { sh: 55, hi: 55, belly: 95, mouth: "#1A4A66" });
        p["H"] = "#FFFFFF"; // glossy shine
        p["a"] = "#7FE0F2"; // fin light
        p["A"] = "#2A8FBE"; // fin dark
        p["b"] = "#C9F2FF"; // top droplet shine
        return p;
      }
      case "stonk": {
        const base = "#9B9B9B";
        const p = tones(base, { sh: 50, hi: 45, mouth: "#3A3A3A" });
        p["s"] = darken(base, 55); // deeper facet shadow + cracks
        return p;
      }
      case "glitx": {
        const base = "#B14BE0";
        const p = tones(base, { sh: 55, hi: 50, mouth: "#3A0E52" });
        p["a"] = "#3FF0E0"; // cyan glitch slice
        p["A"] = "#1FB8AC";
        p["b"] = "#FF3FA0"; // magenta glitch slice
        p["W"] = "#9CFCFF"; // glowing pixel eye block
        p["e"] = "#0A1A2A";
        return p;
      }
      default:
        return tones("#CCCCCC");
    }
  }

  // ---------- grid lookup ----------
  function gridFor(speciesId) {
    switch (speciesId) {
      case "truk": return TRUK;
      case "bruch": return BRUCH;
      case "kassler": return KASSLER;
      case "flamix": return FLAMIX;
      case "aquon": return AQUON;
      case "stonk": return STONK;
      case "glitx": return GLITX;
      default: return TRUK;
    }
  }

  // ============================================================
  //  drawCreature — global entry point
  // ============================================================
  function drawCreature(ctx, cx, cy, R, speciesId, t, opts) {
    if (t == null) t = 0;
    opts = opts || {};
    const grid = gridFor(speciesId);
    const pal = paletteFor(speciesId);

    const GW = grid[0].length;       // grid width (40)
    const GH = grid.length;          // grid height

    // logical sprite spans ~2.1*R wide; derive crisp pixel size.
    let px = Math.max(1, Math.floor((2.1 * R) / GW));
    const spriteW = px * GW;
    const spriteH = px * GH;

    // idle bob (~±4% R) — quantize to whole pixels so it stays crisp.
    const bobRaw = Math.sin(t / 420) * R * 0.045;
    const bob = Math.round(bobRaw / px) * px;

    // blink: closes eyes briefly every few seconds.
    // cycle ~3.6s; blink lasts ~120ms.
    const cyc = (t % 3600);
    const blinking = cyc > 3400 && cyc < 3520;

    // top-left origin so sprite is centered on (cx,cy).
    const ox = Math.round(cx - spriteW / 2);
    const oy = Math.round(cy - spriteH / 2 + bob);

    ctx.save();
    if (opts.flip) {
      ctx.translate(cx, 0);
      ctx.scale(-1, 1);
      ctx.translate(-cx, 0);
    }
    if (ctx.imageSmoothingEnabled !== undefined) ctx.imageSmoothingEnabled = false;

    // ---- soft ground shadow ellipse ----
    ctx.fillStyle = "rgba(0,0,0,0.20)";
    fillEllipse(ctx, cx, cy + spriteH * 0.46 + bob, spriteW * 0.40, spriteH * 0.085);

    // ---- render pixel grid ----
    for (let row = 0; row < GH; row++) {
      const line = grid[row];
      for (let col = 0; col < GW; col++) {
        const ch = line[col];
        if (!ch || ch === " " || ch === ".") continue;

        let key = ch;
        // blink: turn eye pixels into body-skin so the eye "closes".
        if (blinking) {
          if (ch === "e" || ch === "w" || ch === "W") key = "h";
        }

        let color = pal[key];
        if (color == null) {
          // unknown key falls back to base body
          color = pal["B"] || "#CCCCCC";
        }
        ctx.fillStyle = color;
        ctx.fillRect(ox + col * px, oy + row * px, px, px);
      }
    }

    // ---- blink line: draw a thin closed-eye slit over former eye rows ----
    if (blinking) {
      drawBlinkLines(ctx, grid, ox, oy, px, pal["o"]);
    }

    ctx.restore();
  }

  // Find eye-center rows in original grid and draw closed-eye dashes.
  function drawBlinkLines(ctx, grid, ox, oy, px, outline) {
    ctx.fillStyle = outline || OUTLINE;
    // Look for rows that originally contained eye whites ('w'/'W') and
    // draw a horizontal slit across the contiguous eye spans.
    for (let row = 0; row < grid.length; row++) {
      const line = grid[row];
      let runStart = -1;
      for (let col = 0; col <= line.length; col++) {
        const ch = line[col];
        const isEye = ch === "w" || ch === "W" || ch === "e";
        if (isEye && runStart < 0) runStart = col;
        if (!isEye && runStart >= 0) {
          const w = col - runStart;
          if (w >= 2) {
            ctx.fillRect(ox + runStart * px, oy + (row) * px, w * px, Math.max(1, px));
          }
          runStart = -1;
        }
      }
    }
  }

  // ---------- ellipse helper (used for ground shadow) ----------
  function fillEllipse(ctx, x, y, rx, ry) {
    ctx.beginPath();
    if (ctx.ellipse) {
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    } else {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(rx, ry);
      ctx.arc(0, 0, 1, 0, Math.PI * 2);
      ctx.restore();
    }
    ctx.fill();
  }

  // expose globally (overrides any earlier definition)
  window.drawCreature = drawCreature;
})();
