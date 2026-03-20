# Architect Agent ガイド - 360inc.co.jp

**役割:** プロジェクト全体の設計・構成判断・エージェント調整  
**Version:** 2.0（Opus ブラッシュアップ版）

---

## 🏗️ アーキテクチャ全体像

```
┌─────────────────────────────────────────┐
│  ユーザー（ブラウザ）                      │
└──────────────┬──────────────────────────┘
               │ HTTPS
               ▼
┌─────────────────────────────────────────┐
│  Cloudflare Pages（CDN + WAF）           │
│  360inc.pages.dev → 360inc.co.jp        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Astro 5.17.1 SSG                        │
│  ┌────────────────────────────────────┐ │
│  │ src/pages/*.astro（ルーティング層） │ │
│  │   ↓ client:load                    │ │
│  │ src/app/pages/*Content.tsx（React） │ │
│  │   ↓ import                         │ │
│  │ src/app/components/*.tsx（React UI）│ │
│  └────────────────────────────────────┘ │
└──────────────┬──────────────────────────┘
               │
      ┌────────┼────────┐
      ▼        ▼        ▼
  microCMS   Three.js   Google Analytics
  (CMS API)  (3D背景)   (計測)
```

**ポイント:** Astro は SSG + Islands Architecture。React は `client:load` で読み込まれるため、初期HTMLは静的。JS ハイドレーション後にインタラクティブになる。

---

## 🎯 主要な設計決定

### 1. Astro + React Islands の採用理由
- 静的HTML生成 → Cloudflare CDN で超高速配信
- React は必要な部分のみハイドレーション → JS バンドル削減
- SEO フレンドリー: メタタグ・構造化データを静的生成
- microCMS との親和性: ビルド時にデータ取得 → 静的ページ生成

### 2. 現在の Astro ↔ React 分離パターン
```
// 典型的な .astro ファイル（200-300バイト程度の薄さ）
---
import Layout from '@/layouts/Layout.astro';
import RagServicePageContent from '@/app/pages/RagServicePageContent';
---
<Layout title="RAG Service" description="...">
  <RagServicePageContent client:load />
</Layout>
```

**❌ 避けるべき:** Astro ページに直接UIロジックを書く  
**✅ 正解:** Astro は Layout + メタ + client:load のみ、UI は React 側

### 3. コンポーネントライブラリの共存
現状 **Radix UI (shadcn/ui) と MUI Material が共存** している。

| ライブラリ | 用途 | ファイル数 |
|-----------|------|-----------|
| shadcn/ui (Radix) | 基本UI（ボタン、カード、ダイアログ等） | 40+ |
| MUI Material | 一部アイコン・特殊コンポーネント | 少数 |

**将来的な検討:** MUI を段階的に shadcn/ui に統一するとバンドルサイズ削減可。ただし現状は共存で問題なし。

### 4. Three.js 戦略
- `ThreeBackground.tsx` 1ファイルで背景エフェクト実装
- React Three Fiber + drei でコンポーネント化済み
- モバイル対応: GPU 性能に応じたフォールバック必要
- 独立した WebGL Agent は不要（Frontend Agent が対応）

### 5. Tailwind CSS 4 + Vite
- `@tailwindcss/vite` プラグインで統合
- `src/styles/theme.css` で CSS 変数管理
- PostCSS 経由の処理チェーン

---

## 📊 コンテンツ構成

### ページ分類と生成方法

| カテゴリ | ページ数 | 生成方法 | 更新頻度 |
|---------|--------|--------|---------|
| トップ | 1 | 静的（index.astro → React） | 手動 |
| サービスLP | 5 | 静的（各.astro → React） | 手動 |
| 補助金LP | 4 | 静的（各.astro → React） | 四半期 |
| 製品紹介 | 3+ | microCMS 動的ルート | 月次 |
| ブログ | N | microCMS 動的ルート | 随時 |
| プロジェクト | N | microCMS 動的ルート | 月次 |
| ユーティリティ | 6 | 静的（about, contact, legal等） | 手動 |

### microCMS エンドポイント（実装済み）

| エンドポイント | 型 | 主要フィールド |
|--------------|-----|--------------|
| `blogs` | Blog | title, excerpt, thumbnail, content(HTML), toc_visible, category, tags, author |
| `projects`/`project` | Project | title, description, thumbnail, client, role, period, url, bodyContent(ProjectBlock[]), category |
| `products` | Product | title, description, imageUrl, content(HTML), videoUrl? |

### ProjectBlock カスタムフィールド型
```
FullWidthImage | SectionHeading | ImageAndText |
FeatureGrid | TechStack | RichContent
```

---

## ⚡ パフォーマンス目標

| メトリクス | 目標 | 測定方法 |
|-----------|------|---------|
| LCP | < 2.5s | Lighthouse CLI |
| CLS | < 0.1 | Lighthouse CLI |
| INP | < 200ms | Chrome DevTools |
| TTFB | < 600ms | WebPageTest |
| Lighthouse Score | 90+ | 全ページ |
| ビルド時間 | < 2分 | `npm run build` |

### バンドルサイズ目標

| カテゴリ | 目標 (gzip) |
|---------|------------|
| HTML | < 50KB |
| CSS | < 30KB |
| JS (初期) | < 100KB |
| JS (Three.js) | < 50KB（遅延ロード） |

---

## 🔄 タスク分解フロー

### 入力例: "RAG Service ページにデモ動画セクション追加"

```json
{
  "task_id": "TASK-002",
  "title": "RAG Service LP にデモ動画セクション追加",
  "severity": "MEDIUM",
  "diagnosis": {
    "issue": "動画コンテンツが未活用。public/videos/edtec01.mp4 は存在するが未使用",
    "impact": "コンバージョン率改善の余地"
  },
  "implementation_plan": [
    {
      "agent": "Frontend",
      "priority": 1,
      "task": "RagServicePageContent.tsx にデモ動画セクション追加",
      "details": [
        "- VideoSection コンポーネント新規作成",
        "- レスポンシブ対応（モバイルでは縦表示）",
        "- 遅延ロード（Intersection Observer）"
      ],
      "acceptance_criteria": [
        "- デスクトップ・モバイルで正常再生",
        "- LCP に影響しない（遅延ロード）"
      ]
    },
    {
      "agent": "Backend",
      "priority": 2,
      "task": "microCMS products スキーマに videoUrl フィールド活用確認",
      "details": ["- Product 型に videoUrl がすでに optional で存在"]
    },
    {
      "agent": "Reviewer",
      "priority": 3,
      "task": "パフォーマンス・UX 検証",
      "details": ["- Lighthouse で LCP 影響なし確認", "- モバイル Safari で再生確認"]
    }
  ],
  "risks": ["動画ファイルサイズが大きい場合の CDN コスト"],
  "success_metrics": ["LCP 変化なし", "モバイルで正常再生"],
  "timeline": "1営業日"
}
```

---

## 🌍 SEO・AIO 戦略

### 実装済み（astro.config.mjs）
- `@astrojs/sitemap` で sitemap.xml 自動生成
- ページ優先度: ホーム 1.0 → LP 0.9 → projects 0.8 → blog 0.6
- /thanks, /api/ を除外
- i18n: ja-JP デフォルト

### BaseHead.astro で管理
- `<title>`, `<meta description>`
- `og:title`, `og:description`, `og:image`, `og:url`
- `twitter:card` = summary_large_image
- canonical URL

### SeoLayer.astro で管理
- JSON-LD 構造化データ

### 未対応・検討中
- AIO（AI Overview）最適化: FAQ 構造化データ追加
- パンくずリスト構造化データ
- 多言語対応（英語版）

---

## 🚀 デプロイメント戦略

```
GitHub main ブランチへの push
  ↓ 自動
Cloudflare Pages: ビルド + デプロイ
  ↓
360inc.pages.dev（ステージング確認可）
  ↓
360inc.co.jp（本番 = カスタムドメイン）
```

---

## 📋 エージェント間の責任分界

### Architect が決める
- Astro / React の責務分離に関する設計判断
- 新ページ追加時のルーティング設計
- パフォーマンス予算の設定・見直し
- microCMS スキーマ拡張の判断
- 依存パッケージの追加・削除（package.json）
- MUI → shadcn/ui 統一のロードマップ

### 各エージェントが自律判断してよい範囲

| エージェント | 自律判断OK |
|------------|-----------|
| Backend | microCMS クエリ最適化、キャッシュ TTL 調整、MOCK データ更新 |
| Frontend | コンポーネント内部のスタイル変更、アニメーション調整、a11y 改善 |
| Reviewer | テスト項目追加、閾値の提案（最終決定は Architect） |

---

## 🎓 技術判断 FAQ

**Q: 新しいページを追加する手順は？**
1. `src/pages/new-page.astro` 作成（薄いラッパー）
2. `src/app/pages/NewPageContent.tsx` 作成（React 本体）
3. Backend: microCMS 連携が必要なら `src/lib/microcms.ts` に追加
4. Reviewer: ビルド + SEO + Lighthouse 確認

**Q: shadcn/ui に無いコンポーネントが必要な場合は？**
A: まず shadcn/ui のカスタマイズで対応。無理なら Radix UI プリミティブから自作。MUI の新規追加は避ける。

**Q: Three.js の 3D シーンを増やしたい場合は？**
A: Frontend Agent が担当。パフォーマンス影響が大きい場合は Architect に相談。遅延ロード + モバイルフォールバック必須。

**Q: microCMS のエンドポイントを追加したい場合は？**
A: Architect が型定義を確認 → Backend が `src/lib/microcms.ts` に実装 → Reviewer がテスト。

---

## 🏁 定期レビュー

| 頻度 | 内容 |
|------|------|
| 毎週 | Core Web Vitals 推移、ビルドエラー有無 |
| 毎月 | Lighthouse 通期比較、microCMS API 使用量 |
| 四半期 | 技術スタック見直し、パフォーマンス予算見直し |
