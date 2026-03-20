# Backend Agent ガイド - 360inc.co.jp

**責務:** microCMS 連携・データレイヤー・API 最適化・キャッシュ戦略  
**Version:** 2.0（Opus ブラッシュアップ版）

---

## 📊 microCMS スキーマ構成（src/lib/microcms.ts 実装済み）

### 共通型

```typescript
interface MicroCMSImage {
  url: string;
  height: number;
  width: number;
}

interface Technology {
  id: string;
  name: string;
  icon?: MicroCMSImage;
}
```

### エンドポイント1: Projects（ケーススタディ）

```typescript
endpoint: "projects" | "project"  // 両方対応（自動リトライ）

interface Project {
  id: string;
  title: string;
  description: string;
  thumbnail: MicroCMSImage;
  client?: string;
  role?: string;
  period?: string;
  url?: string;
  bodyContent: ProjectBlock[];  // カスタムフィールド（複数ブロック型）
  category: string[];
}
```

**ProjectBlock 型（Union Type）:**
- `FullWidthImage` — フルワイド画像
- `SectionHeading` — セクション見出し
- `ImageAndText` — 画像+テキスト
- `FeatureGrid` — 特徴グリッド
- `TechStack` — 技術スタック
- `RichContent` — リッチテキスト（HTML）

**使用箇所:** `src/pages/projects/` + `src/app/pages/ProjectsPageContent.tsx`, `ProjectDetailPageContent.tsx`

---

### エンドポイント2: Blogs（ブログ）

```typescript
endpoint: "blogs"

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  thumbnail: MicroCMSImage;
  content: string;           // HTML リッチテキスト
  toc_visible?: boolean;
  category: string[];
  tags?: Technology[];
  author: string;
  createdAt: string;
  publishedAt: string;
  updatedAt: string;
}
```

**使用箇所:** `src/pages/blog/` + `src/app/pages/BlogPageContent.tsx`, `BlogDetailPageContent.tsx`

---

### エンドポイント3: Products（製品/サービス）

```typescript
endpoint: "products"

interface Product {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  content: string;           // HTML リッチテキスト
  videoUrl?: string;
}
```

**使用箇所:** `src/pages/products/` + `src/app/pages/ProductDetailPageContent.tsx`

---

## 🔧 実装パターン

### microCMS クライアント構造（src/lib/microcms.ts）

```typescript
// 環境変数からクライアント生成（無効時は null → MOCK）
const client = env有効 ? createClient({ ... }) : null;

// 公開関数
getProjects(queries?)  → Project[]
getProject(id)         → Project
getBlogs(queries?)     → Blog[]
getBlog(id)            → Blog
getProducts(queries?)  → Product[]
getProduct(id)         → Product
```

### フォールバック機構（最重要）

```
1. microCMS API キーが無効 → client = null → MOCK データ返却
2. endpoint "projects" で 404 → "project" で自動リトライ
3. リトライも失敗 → console.warn() + MOCK データ返却
```

この3層フォールバックにより、**API キーなしの開発環境でも全ページが正常表示**される。

### エラーハンドリング

```typescript
try {
  return await client.getList<Blog>({ endpoint: "blogs", queries });
} catch (error) {
  console.error("microCMS connection failed:", error);
  return { contents: MOCK_BLOGS, totalCount: MOCK_BLOGS.length, offset: 0, limit: 10 };
}
```

---

## 📐 Astro での使用パターン

### 一覧ページ（静的生成）

```astro
---
// src/pages/blog/index.astro
import Layout from '@/layouts/Layout.astro';
import BlogPageContent from '@/app/pages/BlogPageContent';
import { getBlogs } from '@/lib/microcms';

const { contents: blogs } = await getBlogs({ limit: 20, orders: '-publishedAt' });
---
<Layout title="Blog">
  <BlogPageContent client:load blogs={blogs} />
</Layout>
```

**ポイント:** Astro 側でデータ取得 → props で React に渡す。React 側はデータを受け取って表示するだけ。

### 個別ページ（動的ルート）

```astro
---
// src/pages/blog/[id].astro
import { getBlogs, getBlog } from '@/lib/microcms';
import BlogDetailPageContent from '@/app/pages/BlogDetailPageContent';

export async function getStaticPaths() {
  const { contents } = await getBlogs({ limit: 100 });
  return contents.map(blog => ({ params: { id: blog.id } }));
}

const { id } = Astro.params;
const blog = await getBlog(id!);
---
<Layout title={blog.title}>
  <BlogDetailPageContent client:load blog={blog} />
</Layout>
```

### カテゴリ・タグフィルター

```typescript
const queries = {
  filters: 'category[equals]Technology',
  limit: 10,
  offset: 0,
  orders: '-publishedAt'
};
```

---

## 🖼️ 画像最適化

### microCMS 画像

```typescript
// MicroCMSImage 型: { url, height, width }
// URL パラメータで変換可能:
`${thumbnail.url}?w=800&fm=webp`  // 幅800px + WebP変換
`${thumbnail.url}?fit=crop&w=400&h=300`  // クロップ
```

### og:image

```html
<meta property="og:image" content={blog.thumbnail.url} />
<meta property="og:image:width" content={String(blog.thumbnail.width)} />
<meta property="og:image:height" content={String(blog.thumbnail.height)} />
```

---

## 🔄 キャッシュ戦略

| コンテンツ | 更新頻度 | キャッシュ方針 |
|-----------|---------|-------------|
| ブログ一覧 | 随時 | ビルド時取得（再ビルドで反映） |
| 個別記事 | 随時 | ビルド時取得 |
| プロジェクト | 月次 | ビルド時取得 |
| 製品情報 | 月次 | ビルド時取得 |
| サービスLP | 手動 | 静的（microCMS 不使用） |

**注意:** 現在は完全SSG（`output: 'static'`相当）。microCMS のコンテンツ更新は再ビルド（GitHub push or Cloudflare ダッシュボードから手動トリガー）で反映。

---

## 🚀 環境変数

```env
# Cloudflare Pages ダッシュボードで設定
PUBLIC_MICROCMS_SERVICE_DOMAIN=your-service-domain
PUBLIC_MICROCMS_API_KEY=your-api-key
```

**開発環境（.env）:**
```env
PUBLIC_MICROCMS_SERVICE_DOMAIN=YOUR_DOMAIN_HERE
PUBLIC_MICROCMS_API_KEY=YOUR_API_KEY_HERE
# ↑ 未設定の場合は自動的に MOCK データを使用
```

---

## 🔍 トラブルシューティング

| 症状 | 原因 | 解決 |
|------|------|------|
| ビルド時に MOCK データが表示される | `.env` の API キーが未設定 or 無効 | Cloudflare の環境変数を確認 |
| `getStaticPaths()` が空 | microCMS にコンテンツが0件 | MOCK データが自動で使われるはず |
| projects エンドポイントで 404 | microCMS 側のAPI名が `project`（単数） | 自動リトライ機構あり（対応済み） |
| 画像が表示されない | microCMS の画像URLがCORS制限 | Cloudflare CDN 経由で配信 |

---

## 📝 Backend Agent がよくやるタスク

1. **新ブログ記事反映:** microCMS で公開 → GitHub push or ビルドトリガー
2. **新エンドポイント追加:** `src/lib/microcms.ts` に型定義 + fetch関数 + MOCK追加
3. **ProjectBlock 型拡張:** Union Type に新フィールド追加 → Frontend に通知
4. **RSS フィード:** `test-rss.mjs` ベースで `/rss.xml` 生成
5. **画像最適化:** microCMS URL パラメータ活用（?w=, ?fm=webp）

---

## 📞 他エージェントへの依頼

| 依頼先 | 内容 |
|-------|------|
| Frontend | 新しい microCMS フィールドに対応する UI コンポーネント作成 |
| Architect | エンドポイント追加・スキーマ変更の設計判断 |
| Reviewer | データ取得の正常性・og:image の検証 |
