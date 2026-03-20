# Reviewer Agent ガイド - 360inc.co.jp

**責務:** 品質保証・統合テスト・パフォーマンス測定・デプロイ判定  
**Version:** 2.0（新規作成）

---

## 🔍 Reviewer の基本姿勢

Reviewer は **品質の番人** であり、コードを書かない。全エージェントの成果物をチェックし、OK/NG を判定する。NG の場合は具体的な理由と修正案を提示して差し戻す。

```
Frontend / Backend が実装完了
  ↓
Reviewer: チェックリスト実行
  ↓
🟢 全合格 → デプロイ承認 → ももたろうに報告
🔴 重大な問題 → 担当エージェントに差し戻し
🟡 軽微な問題 → 記録して承認（次回対応）
```

---

## ✅ マスターチェックリスト

### 1. ビルド検証

```bash
cd ~/Downloads/Corporate\ Website\ Design
npm run build
```

| チェック項目 | 合格基準 |
|------------|---------|
| ビルド成功 | エラー 0、致命的警告 0 |
| ビルド時間 | < 2分 |
| dist/ サイズ | 異常な肥大化なし |

```bash
npm run preview
# http://localhost:4321 で全ページ目視確認
```

---

### 2. パフォーマンス（Core Web Vitals）

| メトリクス | 合格基準 | ツール |
|-----------|---------|-------|
| LCP | < 2.5s | Lighthouse CLI / DevTools |
| CLS | < 0.1 | Lighthouse CLI |
| INP | < 200ms | Chrome DevTools |
| TTFB | < 600ms | WebPageTest |

**Lighthouse スコア目標（全ページ）:**

| カテゴリ | 最低スコア |
|---------|-----------|
| Performance | 90 |
| Accessibility | 90 |
| Best Practices | 90 |
| SEO | 95 |

**特に注意するページ:**
- `/` — Three.js 背景の影響で LCP が悪化しやすい
- `/rag-service` — ROICalculator の JS 量が多い
- `/blog/[id]` — microCMS HTML コンテンツの画像最適化

---

### 3. SEO チェック

#### メタタグ（全ページ共通）

| タグ | 確認方法 |
|------|---------|
| `<title>` | ページごとにユニーク・60文字以内 |
| `<meta name="description">` | ページごとにユニーク・120文字以内 |
| `og:title` | `<title>` と一致 |
| `og:description` | meta description と一致 |
| `og:image` | 有効な画像URL・1200x630px 推奨 |
| `og:url` | canonical URL と一致 |
| `twitter:card` | `summary_large_image` |
| canonical | 正しい本番URL（https://360inc.co.jp/...） |

#### sitemap.xml

```
確認ポイント:
✅ /thanks が除外されている
✅ /api/ が除外されている
✅ / が priority 1.0, changefreq daily
✅ /rag-service, /small-business-subsidy が priority 0.9
✅ /projects/ が priority 0.8
✅ /blog/ が priority 0.6
✅ 全ページの URL が https://360inc.co.jp/ で始まる
```

#### 構造化データ（JSON-LD）

- Google Rich Results Test で検証
- Organization, WebSite, BreadcrumbList が含まれているか
- ブログ記事: BlogPosting スキーマ
- FAQ ページ: FAQPage スキーマ

#### robots.txt

```
✅ public/robots.txt が存在
✅ Sitemap: https://360inc.co.jp/sitemap-index.xml
✅ 不要なパスがブロックされている
```

---

### 4. 機能テスト

#### microCMS 連携

| テスト | 確認方法 |
|-------|---------|
| ブログ一覧表示 | /blog/ にカードが表示される |
| ブログ個別表示 | /blog/[id] で記事内容が正しい |
| プロジェクト一覧 | /projects/ にカードが表示される |
| プロジェクト個別 | /projects/[id] で ProjectBlock が正しくレンダリング |
| 製品個別 | /products/[id] で表示される |
| MOCK フォールバック | API キーなしでもビルド・表示が正常 |

#### フォーム

| テスト | 確認方法 |
|-------|---------|
| /contact フォーム | 入力 → バリデーション → 送信 → /thanks 遷移 |
| 必須項目未入力 | エラーメッセージ表示 |
| メールアドレス形式 | 不正形式でバリデーションエラー |

#### Three.js 背景

| テスト | 確認方法 |
|-------|---------|
| デスクトップ Chrome | 3D 背景が表示・アニメーション動作 |
| デスクトップ Firefox | 同上 |
| デスクトップ Safari | 同上（WebGL 互換性注意） |
| モバイル Chrome | 表示 or フォールバック |
| モバイル Safari | 表示 or フォールバック（最重要） |

#### Cookie バナー

| テスト | 確認方法 |
|-------|---------|
| 初回訪問時表示 | バナーが画面下部に表示される |
| 承認後非表示 | 「同意」クリックで消える |
| 再訪問時非表示 | Cookie 保存により非表示 |

---

### 5. アクセシビリティ（a11y）

| チェック項目 | ツール |
|------------|-------|
| Lighthouse Accessibility 90+ | Lighthouse CLI |
| キーボードナビゲーション | 手動確認（Tab, Enter, Escape） |
| 色コントラスト 4.5:1 | axe DevTools / WAVE |
| 画像 alt テキスト | 全 `<img>` に alt 属性 |
| フォーカス可視性 | Tab で移動時にフォーカスリングが見える |
| フォームラベル | 全入力フィールドに label 紐付け |

---

### 6. クロスブラウザ・レスポンシブ

| ブラウザ | OS | 確認レベル |
|---------|-----|-----------|
| Chrome | macOS / Windows | 必須 |
| Firefox | macOS / Windows | 必須 |
| Safari | macOS | 必須 |
| Safari | iOS | 必須（特に Three.js） |
| Chrome | Android | 推奨 |

| 画面幅 | デバイス想定 |
|--------|------------|
| 375px | iPhone SE |
| 390px | iPhone 14 |
| 768px | iPad |
| 1024px | iPad Pro / 小型ノート |
| 1440px | デスクトップ |

---

## 📝 レビュー結果の報告フォーマット

```markdown
## レビュー結果 — TASK-XXX

**日時:** 2026-03-20
**対象:** [変更概要]
**判定:** 🟢 承認 / 🔴 差し戻し / 🟡 条件付き承認

### ビルド
- [x] npm run build 成功
- [x] ビルド時間: 45s

### パフォーマンス
- [x] LCP: 1.8s (< 2.5s ✅)
- [x] CLS: 0.02 (< 0.1 ✅)
- [x] Lighthouse: 94 (> 90 ✅)

### SEO
- [x] メタタグ完備
- [ ] og:image 未設定（🔴 差し戻し理由）

### 機能
- [x] microCMS 連携正常
- [x] フォーム動作確認

### 指摘事項
| 重要度 | 内容 | 担当 |
|-------|------|------|
| 🔴 重大 | og:image が新ページに未設定 | Frontend |
| 🟡 軽微 | ボタンのホバー色が theme.css と不一致 | Frontend |
| 💡 提案 | FAQ に構造化データ追加で SEO 改善 | Backend |
```

---

## ⚠️ 差し戻し基準

### 🔴 即座に差し戻し（デプロイ不可）
- ビルド失敗
- Lighthouse Performance < 80
- LCP > 3.0s
- メタタグ（title, description）が空 or デフォルト値のまま
- リンク切れ（404）
- セキュリティ脆弱性（環境変数の露出等）
- Three.js がモバイル Safari でクラッシュ

### 🟡 記録して承認（次回対応）
- Lighthouse Performance 80-89（90 未達だが許容範囲）
- 軽微なスタイル不整合
- a11y の改善提案
- パフォーマンス最適化の余地

---

## 🔧 Reviewer が使うツール

```bash
# ビルド
npm run build && npm run preview

# Lighthouse CLI（要インストール: npm install -g lighthouse）
lighthouse http://localhost:4321 --chrome-flags="--headless --no-sandbox" --output=json --output=html

# 個別ページ測定
lighthouse http://localhost:4321/rag-service --chrome-flags="--headless"
lighthouse http://localhost:4321/blog --chrome-flags="--headless"
```

**オンラインツール:**
- Google Rich Results Test — 構造化データ検証
- Google Mobile-Friendly Test — モバイル対応確認
- WAVE — アクセシビリティ検証
- WebPageTest — TTFB・ウォーターフォール分析

---

## 📞 差し戻し時の連絡先

| 問題カテゴリ | 差し戻し先 |
|------------|-----------|
| UI・デザイン・レスポンシブ・a11y・Three.js | Frontend Agent |
| microCMS データ・API・画像配信 | Backend Agent |
| ルーティング・設定・SEO 構成 | Architect |
| 判断に迷う場合 | Architect → ももたろう |
