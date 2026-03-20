# WRO 2026 三重県予選大会ポータルサイト エージェント統一ガイド

**プロジェクト:** WRO 2026 (World Robotics Olympiad) 三重県予選大会ポータル
**テーマ:** "Robots Meet Culture" -- ロボットx芸術/文化の融合
**ホスト:** Cloudflare Pages (360inc.pages.dev)
**リーダー:** ももたろう（CEO・ソロオペレータ）
**最終更新:** 2026-03-20
**Version:** 3.0

---

## プロジェクト概要

### 技術スタック（package.json 実測値）

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| フレームワーク | Astro (SSG + React Islands) | 5.16.11 |
| UI | React + ReactDOM | 19.2.3 |
| スタイリング | Tailwind CSS + Vite plugin | 4.1.18 |
| CMS | microCMS JS SDK | 3.2.0 |
| 3D/WebGL | Three.js + React Three Fiber + drei | 0.182.0 / 9.5.0 / 10.7.7 |
| アニメーション | GSAP + Lenis | 3.14.2 / 1.3.17 |
| SEO | astro-seo | 1.1.0 |
| フォント | @fontsource/inter | 5.2.8 |
| タイポグラフィ | @tailwindcss/typography (dev) | 0.5.19 |

**存在しないもの:** shadcn/ui, Radix UI, MUI, Recharts, React Hook Form, React DnD, rss-parser, Sonner, Motion。これらを追加しないこと。

### アーキテクチャ

Astro がルーティング・レイアウト・SEO・コンテンツを担当し、React は 3D シーンとフォームにのみ使用する軽量な Islands 構成。

```
src/pages/*.astro              -> ルーティング + ページ本体（Astro）
src/layouts/Layout.astro       -> 共通レイアウト（SEO, Cookie, Lenis）
src/components/*.astro         -> Astro コンポーネント（5ファイル）
src/components/*.tsx           -> React Islands（2ファイル: ThreeScene, ContactForm）
src/lib/microcms.ts            -> CMS クライアント（型 + API + MOCK）
```

**重要:** `src/app/` ディレクトリは存在しない。ページ本体は Astro ファイル内に直接記述されている。React は `client:load` / `client:only` で島として埋め込まれる。

### サイト内容

WRO 2026 三重県予選大会のポータルサイト。以下のコンテンツで構成される：

- **Hero:** "Robots Meet Culture" 3D 音符背景 + キャッチコピー
- **競技紹介:** RoboMission (Elementary/Junior/Senior), RoboSports (Double Tennis)
- **会場:** 熊野古道センター（尾鷲市）+ Google Maps 埋め込み
- **Sponsor 0:** 商業主義ゼロの支援哲学 + 協賛ティア（Platinum/Gold/Silver/Bronze/Supporter）
- **ニュース/ブログ:** microCMS 連携
- **お問い合わせ:** React フォーム -> Hyperform バックエンド

---

## エージェント体制

小規模プロジェクト（7コンポーネント, 10ページ）のため、2ロール体制で運用する。

### 1. implementer（実装）

**役割:** コード変更の全般を担当する。

**責務:**
- Astro ページ・コンポーネントの作成/編集
- React Islands（ThreeScene, ContactForm）の変更
- microCMS クライアント・データフェッチの変更
- Tailwind CSS スタイリング
- GSAP / Lenis アニメーション調整
- SEO メタ・JSON-LD 構造化データ

**編集可能:** 全ファイル

**守ること:**
- 実装前後に必ず Git コミット
- .env をコミットしない
- React の使用は Islands パターンのみ（ページ全体を React にしない）
- 存在しないライブラリ（shadcn/ui, MUI 等）をインポートしない

### 2. reviewer（レビュー）

**役割:** 品質保証・統合チェック

**チェックリスト:**
```
- npm run build 成功（エラー・警告なし）
- npm run preview で全ページ表示確認
- Lighthouse 90+（Performance, SEO, Accessibility, Best Practices）
- LCP < 2.5s, CLS < 0.1, INP < 200ms
- microCMS API 応答 + MOCK フォールバック動作
- ThreeScene: デスクトップ + モバイル Safari 動作
- メタタグ: title, description, og:image 全ページ
- Cookie バナー + GTM 連携
- ContactForm -> /thanks 遷移
- Git コミット整合性
```

---

## ワークフロー

```
ももたろう -> implementer（実装）-> reviewer（レビュー）-> デプロイ
```

reviewer で重大な指摘があれば implementer に差し戻す。軽微・提案のみなら完了。

---

## ファイル構成（実測）

```
wro2026/
├── astro.config.mjs           <- Tailwind + React integration
├── package.json
├── tsconfig.json
├── .env                       <- MICROCMS_SERVICE_DOMAIN, MICROCMS_API_KEY
├── CLAUDE.md
├── public/
│   ├── favicon.svg
│   ├── note.svg
│   └── images/
│       └── bg001-bg009.jpg    <- 背景アート画像（9枚）
└── src/
    ├── env.d.ts               <- GTM/dataLayer 型定義
    ├── assets/
    │   ├── astro.svg
    │   └── background.svg
    ├── styles/
    │   └── global.css         <- @import tailwindcss + typography plugin
    ├── layouts/
    │   └── Layout.astro       <- 唯一のレイアウト（astro-seo, Cookie, Lenis）
    ├── lib/
    │   └── microcms.ts        <- CMS クライアント（Blog, News 型 + MOCK）
    ├── components/            <- 全7ファイル（Astro 5 + React 2）
    │   ├── ArtGallery.astro   <- アートギャラリー（Intersection Observer）
    │   ├── ContactForm.tsx    <- React お問合せフォーム（Hyperform 送信）
    │   ├── CookieBanner.astro <- Cookie 同意バナー（GSAP アニメーション）
    │   ├── CustomCursor.astro <- カスタムカーソル（GSAP QuickTo）
    │   ├── FloatingArt.astro  <- スクロール連動背景画像（GSAP ScrollTrigger）
    │   ├── ThreeScene.tsx     <- 3D 音符シーン（R3F, 1000行超）
    │   └── Welcome.astro      <- デフォルトテンプレ（未使用）
    └── pages/                 <- 全10ページ（静的9 + 動的1）
        ├── index.astro        <- トップ（Hero, News, 競技紹介, 会場, 問合せ）
        ├── about.astro        <- Sponsor 0 / 協賛情報
        ├── mission.astro      <- RoboMission 競技詳細
        ├── sports.astro       <- RoboSports (Double Tennis) 詳細
        ├── news/
        │   └── index.astro    <- ニュース一覧
        ├── blog/
        │   └── [...slug].astro <- ブログ詳細（microCMS 動的ルート）
        ├── 404.astro
        ├── privacy.astro
        ├── legal.astro
        └── thanks.astro
```

---

## 重要ポイント

### Astro 主体の構成
- Astro がページ本体・レイアウト・コンテンツを全て担当する
- React は ThreeScene（3D 背景）と ContactForm（フォーム）の 2 箇所のみ
- `src/app/` ディレクトリは存在しない。作成しないこと

### microCMS 連携
- クライアント: `src/lib/microcms.ts`
- エンドポイント: `blogs`（targetSites フィルタで "wro" 絞り込み）, `news`
- 関数: `getBlogs()`, `getBlogDetail()`, `getNews()`, `getNewsDetail()`
- API キー無効時の MOCK フォールバック内蔵
- `projects`, `products` エンドポイントは存在しない

### 3D シーン (ThreeScene.tsx)
- React Three Fiber + drei で音符が浮遊するシーン
- Google カラーパレット使用
- `client:only="react"` で SSR スキップ
- モバイル Safari 対応が必要

### アニメーション
- GSAP ScrollTrigger: FloatingArt の背景パララックス
- GSAP QuickTo: CustomCursor のカーソル追従
- GSAP: CookieBanner のスライドイン
- Lenis: Layout.astro でスムーズスクロール

### SEO / GEO
- astro-seo による title, description, OGP 設定（Layout.astro から各ページで上書き）
- JSON-LD 構造化データ（Organization + Article）
- sitemap 設定は astro.config.mjs に未実装（必要に応じて追加）

### Cookie / GTM
- CookieBanner.astro で同意管理
- 同意後に GTM スクリプトを動的挿入
- dataLayer 型定義は src/env.d.ts

### 協賛 (Sponsor)
- Platinum / Gold / Silver / Bronze / Supporter の 5 ティア
- Square 決済リンクによるオンライン支援
- about.astro に実装

---

## デプロイメント

```bash
npm run dev       # localhost:4321
npm run build     # dist/ 出力
npm run preview   # ビルド結果確認
```

Cloudflare Pages: GitHub main ブランチ push で自動デプロイ。

---

## コーディング規約

- 作業前後は必ず Git コミット（コミットなしの大規模変更は禁止）
- .env・シークレットは絶対にコミットしない
- 入力値のバリデーション・サニタイズを徹底する
- セマンティック HTML を使用する（div の乱用禁止）
- モバイルファーストで実装する
- 画像には必ず alt 属性を付ける
- エラー・ローディング・空状態の 3 状態を実装する
