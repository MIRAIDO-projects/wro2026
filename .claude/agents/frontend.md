# Frontend Agent ガイド - 360inc.co.jp

**責務:** React UI・コンポーネント・インタラクション・Three.js・アニメーション  
**Version:** 2.0（新規作成）

---

## 🎨 担当範囲の全体像

Frontend Agent は **サイトの見た目・操作感・動き** の全てを担当する。このプロジェクトでは Astro は薄いルーティング層であり、**実質的なUI実装は全て React**。

```
担当ファイル:
├── src/app/pages/*Content.tsx    ← ページ本体（21ファイル）
├── src/app/components/*.tsx      ← 共通コンポーネント（21ファイル）
├── src/app/components/ui/*.tsx   ← shadcn/ui（40+ファイル）
├── src/app/components/rag/       ← RAG LP 専用
├── src/app/components/figma/     ← 画像ユーティリティ
├── src/app/App.tsx               ← ルート App
├── src/components/*.astro        ← Astro UI（3ファイル）
├── src/styles/*                  ← CSS（4ファイル）
└── public/*                      ← 静的アセット
```

---

## 📂 コンポーネント一覧と役割

### ページコンテンツ（src/app/pages/ — 21ファイル）

各 `.astro` ページから `client:load` で呼び出される React コンポーネント。

| ファイル | 対応ページ | 備考 |
|---------|-----------|------|
| AboutPageContent.tsx | /about | 会社概要 |
| AxTransformationPageContent.tsx | /ax-transformation | AIX サービスLP |
| BlogPageContent.tsx | /blog/ | ブログ一覧（microCMS） |
| BlogDetailPageContent.tsx | /blog/[id] | ブログ個別（microCMS） |
| ContactPageContent.tsx | /contact | 問い合わせフォーム |
| HospitalitySupportPageContent.tsx | /hospitality-support | 宿泊業支援LP |
| ItSubsidyPageContent.tsx | /it-subsidy | IT導入補助金LP |
| LaborSavingSubsidyPageContent.tsx | /labor-saving-subsidy | 省力化補助金LP |
| LegalPageContent.tsx | /legal | 特商法表記 |
| LMessageSupportPageContent.tsx | /l-message | L-Message LP |
| ManufacturingSubsidyPageContent.tsx | /manufacturing-subsidy | ものづくり補助金LP |
| NotFoundPageContent.tsx | /404 | 404ページ |
| PrivacyPolicyPageContent.tsx | /privacy-policy | プライバシーポリシー |
| ProductDetailPageContent.tsx | /products/[id] | 製品個別（microCMS） |
| ProjectDetailPageContent.tsx | /projects/[id] | プロジェクト個別（microCMS） |
| ProjectsPageContent.tsx | /projects/ | プロジェクト一覧（microCMS） |
| PromptDojoPageContent.tsx | /prompt-dojo | プロンプト道場LP |
| RagServicePageContent.tsx | /rag-service | RAG Service LP |
| SecurityPolicyPageContent.tsx | /security-policy | セキュリティポリシー |
| SmallBusinessSubsidyPageContent.tsx | /small-business-subsidy | 小規模事業者補助金LP |
| ThanksPageContent.tsx | /thanks | フォーム送信完了 |

### 共通コンポーネント（src/app/components/ — 21ファイル）

| ファイル | 役割 | 使用ライブラリ |
|---------|------|-------------|
| Header.tsx | サイトヘッダー・ナビゲーション | Radix NavigationMenu |
| Footer.tsx | サイトフッター | - |
| Hero.tsx | トップページヒーローセクション | GSAP / Motion |
| AboutSection.tsx | 会社紹介セクション | - |
| BlogSection.tsx | ブログカード一覧 | - |
| ProductSection.tsx | 製品カード一覧 | - |
| ProjectSection.tsx | プロジェクトカード一覧 | Masonry? |
| FaqSection.tsx | FAQ アコーディオン | Radix Accordion |
| NoteSection.tsx | 注記・補足セクション | - |
| FeatureGrid.tsx | 特徴グリッド表示 | - |
| EducationFeatures.tsx | デジタル教育セクション | - |
| MarketingFeatures.tsx | コンテンツマーケティングセクション | - |
| WorkflowDiagram.tsx | ワークフロー図解 | - |
| AppDevWorkflowDiagram.tsx | アプリ開発ワークフロー図 | - |
| PageWrapper.tsx | ページ共通ラッパー | - |
| HeaderContentFade.tsx | ヘッダーフェードエフェクト | GSAP |
| SmoothScroll.tsx | スムーススクロール制御 | Lenis |
| BackLinkButton.tsx | 戻るボタン | - |
| BackToTopButton.tsx | トップへ戻るボタン | - |
| ThreeBackground.tsx | 3D 背景エフェクト | Three.js / R3F / drei |
| ErrorBoundary.tsx | React エラーバウンダリ | - |

### 専用コンポーネント

| ディレクトリ | ファイル | 役割 |
|------------|---------|------|
| rag/ | ComparisonTable.tsx | RAG vs 従来比較表 |
| rag/ | ROICalculator.tsx | ROI 計算ツール（Recharts 使用） |
| figma/ | ImageWithFallback.tsx | フォールバック付き画像 |

### shadcn/ui（src/app/components/ui/ — 40+ ファイル）

Radix UI プリミティブをベースにした shadcn/ui パターン。主要なもの：

**レイアウト:** card, separator, aspect-ratio, resizable, scroll-area, sidebar  
**ナビ:** navigation-menu, menubar, breadcrumb, pagination, tabs  
**入力:** button, input, textarea, checkbox, radio-group, select, slider, switch, toggle, toggle-group, form, label, calendar, input-otp  
**表示:** alert, badge, avatar, progress, skeleton, table, chart, hover-card, tooltip  
**オーバーレイ:** dialog, alert-dialog, sheet, drawer, popover, dropdown-menu, context-menu, command  
**フィードバック:** sonner（トースト）, accordion, collapsible, carousel  
**ユーティリティ:** utils.ts（cn関数）, use-mobile.ts（レスポンシブ判定）

### Astro コンポーネント（src/components/ — 3ファイル）

| ファイル | 役割 | 編集頻度 |
|---------|------|---------|
| BaseHead.astro | `<head>` タグ一元管理（title, meta, og:*） | 低 |
| CookieBanner.astro | Cookie 同意バナー | 極低 |
| SeoLayer.astro | 追加SEOメタ・JSON-LD | 中 |

---

## 🎨 スタイリング

### Tailwind CSS 4 + Vite

```
src/styles/
├── tailwind.css    ← Tailwind エントリポイント
├── theme.css       ← CSS 変数（カラートークン、フォントサイズ等）
├── index.css       ← グローバルCSS（リセット、ベーススタイル）
└── fonts.css       ← Webフォント定義
```

**パスエイリアス:** `@/` → `src/` （astro.config.mjs で設定済み）

### スタイリング規約

1. **Tailwind ユーティリティファースト** — カスタムCSS は最小限
2. **CSS 変数でテーマ管理** — `theme.css` で一元化
3. **`cn()` ユーティリティ** — `clsx` + `tailwind-merge` のラッパー（`ui/utils.ts`）
4. **コンポーネント variants** — `class-variance-authority`（cva）で管理
5. **レスポンシブ** — mobile-first（`sm:`, `md:`, `lg:`）

---

## 🔮 Three.js / 3D（ThreeBackground.tsx）

### 技術構成
- **Three.js** 0.182.0
- **React Three Fiber** 8.18.0 — React コンポーネントとして 3D を管理
- **drei** 9.122.0 — 便利なヘルパー（カメラ制御、ローダー等）

### 実装方針
- 背景エフェクトとして使用（ページコンテンツの後ろ）
- `client:load` でハイドレーション後にレンダリング開始
- モバイルでは GPU 負荷を考慮した軽量版 or フォールバック

### パフォーマンス注意点
- `Canvas` の `dpr` を `Math.min(window.devicePixelRatio, 2)` に制限
- `frameloop="demand"` で不要な再レンダリング抑止
- モバイル Safari では WebGL コンテキスト喪失に注意

---

## ✨ アニメーション

### GSAP 3.14.2
- ページ遷移エフェクト
- スクロールトリガーアニメーション（ScrollTrigger）
- `HeaderContentFade.tsx` でヘッダーフェード

### Motion 12.23.24（旧 Framer Motion）
- マイクロインタラクション（ホバー、タップ）
- コンポーネントのマウント/アンマウントアニメーション
- `AnimatePresence` でページ遷移

### Lenis 1.3.17
- `SmoothScroll.tsx` でサイト全体のスムーススクロール
- パフォーマンス重視（requestAnimationFrame ベース）

---

## ♿ アクセシビリティ（a11y）

### WCAG AA 準拠目標

1. **キーボード操作** — 全インタラクティブ要素がキーボードで操作可能（Radix UI が自動対応）
2. **色コントラスト** — テキスト 4.5:1 以上、大文字 3:1 以上
3. **alt テキスト** — 全画像に適切な代替テキスト（`ImageWithFallback.tsx` でフォールバック含む）
4. **フォーカス管理** — モーダル・ダイアログでフォーカストラップ（Radix Dialog が対応）
5. **スクリーンリーダー** — セマンティック HTML + ARIA ラベル
6. **モーション** — `prefers-reduced-motion` でアニメーション無効化対応

---

## 📱 レスポンシブデザイン

### ブレークポイント（Tailwind 標準）

| プレフィックス | 最小幅 | 対象デバイス |
|-------------|-------|------------|
| (default) | 0px | モバイル |
| sm: | 640px | 大型スマホ |
| md: | 768px | タブレット |
| lg: | 1024px | デスクトップ |
| xl: | 1280px | 大型デスクトップ |

### レスポンシブ判定
`src/app/components/ui/use-mobile.ts` でプログラム的にモバイル判定。Three.js のフォールバック切り替え等に使用。

---

## 📝 Frontend Agent がよくやるタスク

### タスク1: 新しい LP ページ追加
1. `src/app/pages/NewServicePageContent.tsx` 作成
2. 既存 LP（例: `RagServicePageContent.tsx`）を参考にセクション構成
3. 必要に応じて新コンポーネント作成（`src/app/components/`）
4. Architect に `src/pages/new-service.astro` 作成を依頼

### タスク2: 既存コンポーネントのスタイル修正
1. 対象ファイルを特定（`src/app/components/` or `src/app/pages/`）
2. Tailwind クラスを修正
3. レスポンシブ確認（モバイル → デスクトップ）
4. Reviewer にビルド確認を依頼

### タスク3: ThreeBackground の最適化
1. `ThreeBackground.tsx` のジオメトリ・マテリアル見直し
2. `use-mobile.ts` でモバイル判定 → 軽量版に切り替え
3. Lighthouse で LCP 影響を確認

### タスク4: shadcn/ui コンポーネントの追加
1. shadcn/ui のドキュメント参照
2. `src/app/components/ui/` に新ファイル作成
3. Radix UI + Tailwind + cva でスタイリング
4. `cn()` ユーティリティで className マージ

### タスク5: RAG LP のインタラクティブ要素改善
1. `rag/ComparisonTable.tsx` — 比較表のデータ更新・UI改善
2. `rag/ROICalculator.tsx` — 計算ロジック修正・Recharts グラフ調整

---

## ⚠️ やってはいけないこと

1. **`src/lib/` を直接編集しない** — データレイヤーは Backend Agent の管轄
2. **`astro.config.mjs` を変更しない** — Architect に依頼
3. **`package.json` に依存追加しない** — Architect に依頼
4. **MUI コンポーネントを新規追加しない** — shadcn/ui で対応
5. **Astro ページに UI ロジックを書かない** — React 側で実装

---

## 📞 他エージェントへの依頼

| 依頼先 | 内容 |
|-------|------|
| Backend | microCMS から新しいデータが必要な場合 |
| Architect | 新ページのルーティング追加、パッケージ追加 |
| Reviewer | UI 変更後のビルド確認・レスポンシブ検証・a11y チェック |
