# WRO 2026 三重県予選大会ポータルサイト

**World Robot Olympiad 2026** 三重県予選大会の公式ポータルサイト。
テーマは **"Robots Meet Culture"**（ロボット × 芸術・文化の融合）。

- 本番URL: https://wro2026.miraido.net
- ホスティング: Cloudflare Pages（GitHub `main` push で自動デプロイ）
- 制作: MIRAIDO PROJECT / 株式会社三六〇

## 技術スタック

| カテゴリ | 技術 |
| :-- | :-- |
| フレームワーク | Astro 5（SSG + React Islands） |
| UI | React 19 |
| スタイリング | Tailwind CSS 4 |
| CMS | microCMS（blogs / news） |
| 3D | Three.js + React Three Fiber + drei |
| アニメーション | GSAP + Lenis |
| SEO | astro-seo + @astrojs/sitemap |

React は `ThreeScene`（3D背景）と `ContactForm`（問い合わせ）の2箇所のみ Islands として使用。
それ以外のページ本体・レイアウト・SEO は Astro が担当する。

## セットアップ

```sh
npm install
npm run dev        # http://localhost:4321
```

### 環境変数（`.env`）

microCMS 連携に以下が必要（Cloudflare Pages 側にも同名で設定）:

```
MICROCMS_SERVICE_DOMAIN=xxxxx
MICROCMS_API_KEY=xxxxx
```

未設定時は MOCK データにフォールバックする。`.env` は絶対にコミットしないこと。

## コマンド

| コマンド | 内容 |
| :-- | :-- |
| `npm run dev` | 開発サーバー起動（localhost:4321） |
| `npm run build` | 本番ビルド（`./dist/`） |
| `npm run preview` | ビルド結果のプレビュー |
| `npm run check` | `astro check`（型チェック） |

## アセット生成スクリプト

| スクリプト | 生成物 |
| :-- | :-- |
| `node scripts/make-og.mjs` | `public/og-image.jpg`（OGP画像 1200×630） |
| `node scripts/make-logo.mjs` | `public/logo.png`（構造化データ用ロゴ 512×512） |

## デプロイ

`main` ブランチへ push すると Cloudflare Pages が自動でビルド・デプロイする。

詳細な開発ガイド・エージェント運用ルールは [`CLAUDE.md`](./CLAUDE.md) を参照。
