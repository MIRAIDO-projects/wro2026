import sharp from "sharp";

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

// 任意の寸法で OG 画像 SVG を生成する。
// 基準は 1200x630。フォント/位置は W,H から比例算出するため、
// 1200x630 では従来とピクセル単位で同一、他比率でも崩れず再配置される。
function buildSvg(W, H) {
  const cx = W / 2;
  const fx = W / 1200; // 横方向スケール
  const fy = H / 630; // 縦方向スケール
  const f = Math.min(fx, fy); // フォント/音符の等方スケール（潰れ防止）

  // 縦アンカー（630基準の比率）
  const yLabel = H * (150 / 630);
  const yTitle = H * (312 / 630);
  const ySub = H * (392 / 630);
  const yDiv = H * (430 / 630);
  const yVenue = H * (486 / 630);
  const barH = Math.round(H * (64 / 630));

  // フォントサイズ（1200基準 × 等方スケール）
  const sLabel = 26 * f;
  const sTitle = 104 * f;
  const sSub = 40 * f;
  const sVenue = 27 * f;
  const sBar = 22 * f;
  const divW = 180 * fx;

  // 音符（位置は fx/fy、サイズは f でスケール）
  const N = (x, y, c, sc, rot) =>
    note(x * fx, y * fy, c, sc * f, rot);

  return `<?xml version="1.0" encoding="UTF-8"?>
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

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <g opacity="0.16">
    ${N(150, 150, "#4285F4", 1.5, -8)}
    ${N(1040, 120, "#EA4335", 1.2, 10)}
    ${N(1090, 470, "#34A853", 1.6, -6)}
    ${N(110, 500, "#FBBC05", 1.3, 12)}
    ${N(960, 300, "#4285F4", 0.9, 4)}
    ${N(250, 380, "#EA4335", 0.8, -10)}
  </g>

  <text x="${cx}" y="${yLabel}" text-anchor="middle" class="en"
    font-size="${sLabel}" letter-spacing="${10 * f}" font-weight="600" fill="#64748b">WORLD ROBOT OLYMPIAD</text>

  <text x="${cx}" y="${yTitle}" text-anchor="middle" class="en"
    font-size="${sTitle}" font-weight="800" letter-spacing="${-2 * f}" fill="url(#title)">Robots Meet Culture</text>

  <text x="${cx}" y="${ySub}" text-anchor="middle" class="jp"
    font-size="${sSub}" font-weight="700" fill="#1e293b">WRO Japan 2026 公認 ・ 三重予選会</text>

  <rect x="${cx - divW / 2}" y="${yDiv}" width="${divW}" height="${3 * f}" rx="${1.5 * f}" fill="#cbd5e1"/>

  <text x="${cx}" y="${yVenue}" text-anchor="middle" class="jp"
    font-size="${sVenue}" font-weight="500" fill="#475569">会場：三重県立熊野古道センター（三重県尾鷲市）</text>

  <rect x="0" y="${H - barH}" width="${W}" height="${barH}" fill="#0f172a"/>
  <text x="${60 * fx}" y="${H - barH * 0.375}" class="jp" font-size="${sBar}" font-weight="600" fill="#ffffff">ロボット × 芸術・文化の融合</text>
  <text x="${W - 60 * fx}" y="${H - barH * 0.375}" text-anchor="end" class="en" font-size="${sBar}" font-weight="700" letter-spacing="${2 * f}" fill="#ffffff">MIRAIDO PROJECT</text>
</svg>`;
}

async function generate(W, H, outFile, quality) {
  const svg = buildSvg(W, H);
  const out = new URL(`../public/${outFile}`, import.meta.url).pathname;
  await sharp(Buffer.from(svg)).jpeg({ quality }).toFile(out);
  console.log(`done: public/${outFile} (${W}x${H})`);
}

// OGP標準（変更しない既存ファイル）
await generate(1200, 630, "og-image.jpg", 90);
// 16:9 ダウンロード用
await generate(1280, 720, "og-image-1280x720.jpg", 92);
