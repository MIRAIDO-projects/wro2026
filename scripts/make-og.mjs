import sharp from "sharp";
import { writeFileSync } from "node:fs";

const W = 1200;
const H = 630;

// 8分音符をベクターで描く（フォント非依存）。x,y=符頭中心, color, scale
function note(x, y, color, scale = 1, rot = 0, flag = true) {
  const s = scale;
  const head = `<ellipse cx="0" cy="0" rx="${15 * s}" ry="${11 * s}" transform="rotate(-20)" fill="${color}"/>`;
  const stem = `<rect x="${11 * s}" y="${-78 * s}" width="${4.5 * s}" height="${80 * s}" rx="${2 * s}" fill="${color}"/>`;
  const flagPath = flag
    ? `<path d="M ${15 * s} ${-78 * s} q ${30 * s} ${10 * s} ${10 * s} ${44 * s} q ${14 * s} ${-30 * s} ${-10 * s} ${-30 * s} Z" fill="${color}"/>`
    : "";
  return `<g transform="translate(${x},${y}) rotate(${rot})">${head}${stem}${flagPath}</g>`;
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#eef2f7"/>
    </linearGradient>
    <linearGradient id="title" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#7e22ce"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="38%" r="60%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#dbe3ee" stop-opacity="0.6"/>
    </radialGradient>
    <style>
      .jp { font-family: "Hiragino Sans","Hiragino Kaku Gothic ProN","Noto Sans CJK JP","Yu Gothic",sans-serif; }
      .en { font-family: "Inter","Helvetica Neue",Arial,sans-serif; }
    </style>
  </defs>

  <!-- 背景 -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- 浮遊する音符（Googleカラー・低不透明度） -->
  <g opacity="0.16">
    ${note(150, 150, "#4285F4", 1.5, -8)}
    ${note(1040, 120, "#EA4335", 1.2, 10)}
    ${note(1090, 470, "#34A853", 1.6, -6)}
    ${note(110, 500, "#FBBC05", 1.3, 12)}
    ${note(960, 300, "#4285F4", 0.9, 4)}
    ${note(250, 380, "#EA4335", 0.8, -10)}
  </g>

  <!-- 上部ラベル -->
  <text x="${W / 2}" y="150" text-anchor="middle" class="en"
    font-size="26" letter-spacing="10" font-weight="600" fill="#64748b">WORLD ROBOT OLYMPIAD</text>

  <!-- メインタイトル -->
  <text x="${W / 2}" y="312" text-anchor="middle" class="en"
    font-size="104" font-weight="800" letter-spacing="-2" fill="url(#title)">Robots Meet Culture</text>

  <!-- サブ（日本語） -->
  <text x="${W / 2}" y="392" text-anchor="middle" class="jp"
    font-size="40" font-weight="700" fill="#1e293b">WRO Japan 2026 公認 ・ 三重予選会</text>

  <!-- 区切り線 -->
  <rect x="${W / 2 - 90}" y="430" width="180" height="3" rx="1.5" fill="#cbd5e1"/>

  <!-- 会場 -->
  <text x="${W / 2}" y="486" text-anchor="middle" class="jp"
    font-size="27" font-weight="500" fill="#475569">会場：三重県立熊野古道センター（三重県尾鷲市）</text>

  <!-- 下部バー -->
  <rect x="0" y="${H - 64}" width="${W}" height="64" fill="#0f172a"/>
  <text x="60" y="${H - 24}" class="jp" font-size="22" font-weight="600" fill="#ffffff">ロボット × 芸術・文化の融合</text>
  <text x="${W - 60}" y="${H - 24}" text-anchor="end" class="en" font-size="22" font-weight="700" letter-spacing="2" fill="#ffffff">MIRAIDO PROJECT</text>
</svg>`;

writeFileSync(new URL("./og-debug.svg", import.meta.url), svg);

await sharp(Buffer.from(svg))
  .jpeg({ quality: 90 })
  .toFile(new URL("../public/og-image.jpg", import.meta.url).pathname);

console.log("done: public/og-image.jpg");
