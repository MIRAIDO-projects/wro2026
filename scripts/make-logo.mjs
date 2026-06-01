import sharp from "sharp";

// Organization JSON-LD 用ロゴ（正方形・透過なし）。512x512。
const S = 512;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#7e22ce"/>
    </linearGradient>
    <style>
      .en { font-family: "Inter","Helvetica Neue",Arial,sans-serif; }
      .jp { font-family: "Hiragino Sans","Noto Sans CJK JP",sans-serif; }
    </style>
  </defs>
  <rect width="${S}" height="${S}" rx="96" fill="#0f172a"/>
  <!-- Googleカラーの音符ドット -->
  <circle cx="120" cy="120" r="22" fill="#4285F4"/>
  <circle cx="392" cy="120" r="22" fill="#EA4335"/>
  <circle cx="120" cy="392" r="22" fill="#FBBC05"/>
  <circle cx="392" cy="392" r="22" fill="#34A853"/>
  <text x="${S / 2}" y="248" text-anchor="middle" class="en" font-size="150" font-weight="800" letter-spacing="-4" fill="url(#g)">WRO</text>
  <text x="${S / 2}" y="330" text-anchor="middle" class="en" font-size="64" font-weight="700" letter-spacing="6" fill="#e2e8f0">2026</text>
  <text x="${S / 2}" y="392" text-anchor="middle" class="jp" font-size="34" font-weight="600" letter-spacing="2" fill="#94a3b8">三重予選会</text>
</svg>`;

await sharp(Buffer.from(svg))
  .png()
  .toFile(new URL("../public/logo.png", import.meta.url).pathname);

console.log("done: public/logo.png");
