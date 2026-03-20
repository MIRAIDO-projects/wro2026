# 360inc.co.jp サイト更新用 エージェント統一ガイド

**プロジェクト:** 360Inc. 公式Webサイト メンテナンス・機能追加  
**ホスト:** Cloudflare Pages (https://360inc.pages.dev)  
**本番:** https://360inc.co.jp  
**リーダー:** ももたろう（CEO・ソロオペレータ）  
**最終更新:** 2026-03-20  
**Version:** 2.0（Opus ブラッシュアップ版）

---

## 📋 プロジェクト概要

### 技術スタック（package.json 実測値）

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| フレームワーク | Astro（SSG + React Islands） | 5.17.1 |
| UIライブラリ | React + ReactDOM | 18.3.1 |
| スタイリング | Tailwind CSS + Vite プラグイン | 4.1.12 |
| CMS | microCMS JS SDK | 3.2.0 |
| 3D/WebGL | Three.js + React Three Fiber + drei | 0.182.0 / 8.18.0 / 9.122.0 |
| UIコンポーネント | Radix UI (26種) + shadcn/ui パターン | 各種 |
| MUI | MUI Material + MUI Icons | 7.3.5 |
| アニメーション | GSAP + Motion + Lenis | 3.14.2 / 12.23.24 / 1.3.17 |
| チャート | Recharts | 2.15.2 |
| フォーム | React Hook Form | 7.55.0 |
| D&D | React DnD + HTML5 Backend | 16.0.1 |
| RSS | rss-parser | 3.13.0 |
| トースト | Sonner | 2.0.3 |
| ホスティング | Cloudflare Pages | - |

### アーキテクチャの実態

このプロジェクトは **Astro を薄いルーティング層として使い、実質的なUI・ロジックは全て React で実装** されている。

```
src/pages/*.astro          → ルーティング + SEO メタ（薄いラッパー）
  ↓ client:load
src/app/pages/*Content.tsx → ページ本体（React）
  ↓ import
src/app/components/*.tsx   → 共通コンポーネント（React）
src/app/components/ui/*.tsx → shadcn/ui ベースUI（React）
```

**重要:** `src/components/` にはAstroコンポーネントが3つだけ（BaseHead, CookieBanner, SeoLayer）。残りのUI実装は全て `src/app/` 配下のReact。

### ビジネス背景

360Inc. は以下の6つのソリューション領域を展開：
1. **AI Integration Service** — AIビジネス化支援
2. **XR Development** — VR/AR体験開発
3. **Application Development** — モバイル・ブラウザアプリ
4. **Website Production** — Webサイト構築
5. **Content Marketing** — コンテンツ戦略
6. **Digital Education** — プログラミング教育

サイトのコンテンツ構成：
- トップページ + 各ソリューション紹介
- ブログ（microCMS 連携）
- プロジェクト/ケーススタディ（microCMS 連携）
- 製品紹介（RAG Service、L-Message、プロンプト道場 等）
- 補助金情報 LP 4ページ（IT導入、省力化、ものづくり、小規模事業者）
- ホスピタリティ支援（古民家・宿泊業向け）

---

## 🎯 エージェント4人体制

> **Haiku版の5人から4人に変更。** WebGL/3D Agent は廃止 — 3D実装は `ThreeBackground.tsx` の1ファイルのみであり、独立エージェントは過剰。Frontend Agent が Three.js 関連も担当する。

### **1️⃣ Architect（アーキテクト）**

**役割:** プロジェクト全体の設計・構成判断・タスク分解

**責務:**
- Astro + React + microCMS + Three.js の統合設計
- 修正リクエストの分解・優先度付け・エージェントへの振り分け
- パフォーマンス戦略（LCP, CLS, INP）
- SEO・AIO 対策（sitemap, structured data, JSON-LD）
- ビルド・デプロイメント戦略
- 大規模リファクタリングの判断

**編集可能:** `CLAUDE.md`, `astro.config.mjs`, `tsconfig.json`, `package.json`, `src/pages/*.astro`（ルーティング層）, `docs/**`

**禁止:** `src/app/**` への直接実装

**出力形式:**
```json
{
  "task_id": "TASK-001",
  "title": "タスク名",
  "diagnosis": "現状分析",
  "implementation_plan": [
    { "agent": "Frontend", "priority": "HIGH", "task": "具体的な実装内容" }
  ],
  "risks": ["リスク項目"],
  "success_metrics": ["成功指標"]
}
```

---

### **2️⃣ Backend Agent（バックエンド）**

**役割:** microCMS・データフェッチ・API・キャッシュ

**責務:**
- microCMS クライアント管理（`src/lib/microcms.ts`）
- Astro データフェッチング（`getStaticPaths()` 等）
- キャッシュ戦略（microCMS + Cloudflare）
- RSS フィード生成
- 画像最適化・CDN配信
- 環境変数・シークレット管理

**編集可能:** `src/lib/**`, `src/pages/blog/`, `src/pages/projects/`, `src/pages/products/`（データフェッチ部分）, `.env`

**禁止:** `src/app/**`（UI実装）, `src/components/*.astro`

---

### **3️⃣ Frontend Agent（フロントエンド + 3D）**

**役割:** React UI・コンポーネント・インタラクション・Three.js

**責務:**
- React ページコンテンツ（`src/app/pages/*Content.tsx` — 21ファイル）
- 共通コンポーネント（`src/app/components/*.tsx` — 21ファイル）
- shadcn/ui（`src/app/components/ui/` — 48ファイル）
- RAG専用コンポーネント（ComparisonTable, ROICalculator）
- Three.js 背景（`ThreeBackground.tsx`）
- Tailwind CSS デザイン + レスポンシブ
- GSAP / Motion / Lenis アニメーション
- React Hook Form フォーム
- アクセシビリティ（WCAG AA）

**編集可能:** `src/app/**`, `src/components/*.astro`, `src/styles/**`, `public/**`

**禁止:** `src/lib/**`, `astro.config.mjs`, `package.json`

---

### **4️⃣ Reviewer（QA・統合テスト）**

**役割:** 品質保証・統合テスト・デプロイ検証

**チェックリスト:**
```
✅ npm run build 成功（エラー・警告なし）
✅ npm run preview で全ページ表示確認
✅ Lighthouse 90+（Performance, SEO, Accessibility, Best Practices）
✅ LCP < 2.5s, CLS < 0.1, INP < 200ms
✅ microCMS API 応答確認（MOCK フォールバック動作も）
✅ ThreeBackground: デスクトップ + モバイル Safari
✅ メタタグ: og:title, og:description, og:image 全ページ
✅ JSON-LD 構文チェック
✅ sitemap.xml: /thanks 除外、LP priority 0.9
✅ robots.txt, 404, Cookie バナー, フォーム → /thanks 遷移
✅ Git コミット整合性
```

---

## 🔄 ワークフロー

```
ももたろう → Architect（診断・分解）→ Backend + Frontend（並列）→ Reviewer → デプロイ
```

軽微な修正は Architect を経由せず Frontend/Backend → Reviewer で完結可。

---

## 💾 ファイル構成（実測）

```
Corporate Website Design/
├── astro.config.mjs           ← sitemap 設定含む
├── package.json
├── tsconfig.json
├── postcss.config.mjs
├── guidelines/Guidelines.md
├── public/
│   ├── images/ (12), backgrounds/ (6), videos/ (1)
│   ├── partnership_badge_bg.png
│   └── robots.txt
└── src/
    ├── env.d.ts
    ├── lib/microcms.ts        ← CMS クライアント（型+API+MOCK）
    ├── layouts/Layout.astro   ← 唯一のレイアウト
    ├── components/            ← Astro (3ファイルのみ)
    │   ├── BaseHead.astro, CookieBanner.astro, SeoLayer.astro
    ├── pages/                 ← Astro ルーティング (17静的 + 3動的)
    │   ├── index, about, contact, thanks, 404, legal...
    │   ├── ax-transformation, rag-service, l-message, prompt-dojo
    │   ├── hospitality-support
    │   ├── it-subsidy, labor-saving-subsidy, manufacturing-subsidy, small-business-subsidy
    │   ├── privacy-policy, security-policy
    │   └── blog/, projects/, products/  ← microCMS 動的
    ├── app/                   ← React アプリ層
    │   ├── App.tsx
    │   ├── pages/ (21)        ← *PageContent.tsx
    │   └── components/        ← React UI
    │       ├── 21 共通コンポーネント
    │       ├── figma/ImageWithFallback.tsx
    │       ├── rag/ComparisonTable.tsx, ROICalculator.tsx
    │       └── ui/ (48 shadcn/ui)
    └── styles/ (4)
        ├── index.css, tailwind.css, theme.css, fonts.css
```

---

## 📌 重要ポイント

### Astro ↔ React の責務分離
- Astro: ルーティング、`<head>`、SEO、Cookie、Layout のみ
- React: ページ本体の全UI、インタラクション、3D、フォーム、アニメーション

### microCMS 連携
- クライアント一元管理: `src/lib/microcms.ts`
- 3エンドポイント: `blogs`, `projects`/`project`（自動リトライ）, `products`
- API キー無効時の MOCK フォールバック内蔵

### SEO（astro.config.mjs 実装済み）
- ホーム: priority 1.0 / daily
- LP: priority 0.9 / daily
- projects: 0.8 / weekly, blog: 0.6 / monthly
- /thanks, /api/ 除外, i18n: ja-JP

### パフォーマンス目標
LCP < 2.5s, CLS < 0.1, INP < 200ms, Lighthouse 90+

---

## 🚀 デプロイメント

```bash
npm run dev       # localhost:4321
npm run build     # dist/ 出力
npm run preview   # ビルド結果確認
```

Cloudflare Pages: GitHub main ブランチ push → 自動デプロイ
