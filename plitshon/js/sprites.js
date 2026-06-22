// Geometric battle sprite drawing for each species
function drawSprite(canvas, speciesId, color, size) {
  const c = canvas.getContext("2d");
  c.clearRect(0, 0, canvas.width, canvas.height);
  const w = canvas.width, h = canvas.height;
  const cx = w / 2, cy = h / 2;
  const s = Math.min(w, h) * 0.42;

  c.save();
  c.shadowColor = color;
  c.shadowBlur = 14;
  c.fillStyle = color;
  c.strokeStyle = lightenColor(color);
  c.lineWidth = 2;

  switch (speciesId) {
    case "truk": {
      // spiky lightning bolt
      c.beginPath();
      c.moveTo(cx - s * 0.3, cy - s);
      c.lineTo(cx + s * 0.4, cy - s * 0.2);
      c.lineTo(cx,           cy - s * 0.1);
      c.lineTo(cx + s * 0.3, cy + s);
      c.lineTo(cx - s * 0.4, cy + s * 0.1);
      c.lineTo(cx,           cy);
      c.closePath();
      c.fill(); c.stroke();
      break;
    }
    case "bruch": {
      // larger asymmetric shard
      c.beginPath();
      c.moveTo(cx - s,       cy + s * 0.6);
      c.lineTo(cx - s * 0.3, cy - s);
      c.lineTo(cx + s * 0.5, cy - s * 0.4);
      c.lineTo(cx + s,       cy + s * 0.3);
      c.lineTo(cx + s * 0.2, cy + s);
      c.closePath();
      c.fill(); c.stroke();
      break;
    }
    case "kassler": {
      // imposing multi-spike crown
      const spikes = 5;
      c.beginPath();
      c.moveTo(cx - s, cy + s * 0.7);
      for (let i = 0; i < spikes; i++) {
        const x0 = cx - s + (2 * s) * (i / spikes);
        const x1 = cx - s + (2 * s) * ((i + 0.5) / spikes);
        c.lineTo(x0, cy + s * 0.7);
        c.lineTo(x1, cy - s);
      }
      c.lineTo(cx + s, cy + s * 0.7);
      c.closePath();
      c.fill(); c.stroke();
      break;
    }
    case "flamix": {
      // teardrop flame
      c.beginPath();
      c.moveTo(cx, cy - s);
      c.bezierCurveTo(cx + s,       cy - s * 0.2, cx + s * 0.7, cy + s, cx, cy + s);
      c.bezierCurveTo(cx - s * 0.7, cy + s,       cx - s,       cy - s * 0.2, cx, cy - s);
      c.closePath();
      c.fill(); c.stroke();
      break;
    }
    case "aquon": {
      // wave / droplet — circle base + droplet tip
      c.beginPath();
      c.arc(cx, cy + s * 0.2, s * 0.75, 0, Math.PI * 2);
      c.fill(); c.stroke();
      c.beginPath();
      c.moveTo(cx, cy - s);
      c.quadraticCurveTo(cx + s * 0.5, cy - s * 0.3, cx, cy + s * 0.2);
      c.quadraticCurveTo(cx - s * 0.5, cy - s * 0.3, cx, cy - s);
      c.fillStyle = lightenColor(color);
      c.fill();
      break;
    }
    case "stonk": {
      // chunky hexagon
      c.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = Math.PI / 6 + i * Math.PI / 3;
        const x = cx + Math.cos(a) * s, y = cy + Math.sin(a) * s;
        i === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
      }
      c.closePath();
      c.fill(); c.stroke();
      break;
    }
    case "glitx": {
      // fragmented square with glitch offset slices
      c.fillRect(cx - s * 0.7, cy - s * 0.7, s * 1.4, s * 1.4);
      c.fillStyle = "#00F5FF";
      c.globalAlpha = 0.7;
      c.fillRect(cx - s * 0.7 + 8,  cy - s * 0.45, s * 1.4, s * 0.28);
      c.fillStyle = "#FF2D78";
      c.fillRect(cx - s * 0.7 - 8,  cy + s * 0.22, s * 1.2, s * 0.22);
      c.globalAlpha = 1;
      c.strokeRect(cx - s * 0.7, cy - s * 0.7, s * 1.4, s * 1.4);
      break;
    }
    default:
      c.beginPath(); c.arc(cx, cy, s, 0, Math.PI * 2); c.fill(); c.stroke();
  }
  c.restore();
}
