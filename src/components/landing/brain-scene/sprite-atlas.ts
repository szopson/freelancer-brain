import * as THREE from "three";

// Atlas 4 glifów (dokument, koperta, dymek czatu, notatka) rysowany
// w canvasie — zero zewnętrznych assetów.
export function createSpriteAtlas(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size * 4;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.strokeStyle = "rgba(255, 230, 200, 0.95)";
  ctx.fillStyle = "rgba(255, 230, 200, 0.12)";
  ctx.lineWidth = 5;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  const pad = 28;
  const w = size - pad * 2;

  // 1: dokument
  ctx.save();
  roundRect(ctx, pad, pad - 6, w * 0.78, w + 12, 10);
  ctx.fill();
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    line(ctx, pad + 14, pad + 14 + i * 22, pad + w * 0.78 - 14, pad + 14 + i * 22);
  }
  ctx.restore();

  // 2: koperta
  ctx.save();
  ctx.translate(size, 0);
  roundRect(ctx, pad - 6, pad + 10, w + 12, w * 0.72, 10);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(pad - 6, pad + 16);
  ctx.lineTo(size / 2, pad + w * 0.42);
  ctx.lineTo(size - pad + 6, pad + 16);
  ctx.stroke();
  ctx.restore();

  // 3: dymek czatu
  ctx.save();
  ctx.translate(size * 2, 0);
  roundRect(ctx, pad - 4, pad, w + 8, w * 0.68, 22);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(pad + 22, pad + w * 0.68);
  ctx.lineTo(pad + 16, pad + w * 0.92);
  ctx.lineTo(pad + 44, pad + w * 0.68);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 4: notatka (zagięty róg)
  ctx.save();
  ctx.translate(size * 3, 0);
  ctx.beginPath();
  ctx.moveTo(pad, pad - 4);
  ctx.lineTo(pad + w * 0.82, pad - 4);
  ctx.lineTo(pad + w * 0.82 + 18, pad + 16);
  ctx.lineTo(pad + w * 0.82 + 18, pad + w + 4);
  ctx.lineTo(pad, pad + w + 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  line(ctx, pad + w * 0.82, pad - 4, pad + w * 0.82, pad + 16);
  line(ctx, pad + w * 0.82, pad + 16, pad + w * 0.82 + 18, pad + 16);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function line(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
