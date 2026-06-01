import { createClient, type MicroCMSQueries, type MicroCMSImage, type MicroCMSDate } from "microcms-js-sdk";

// --- Type Definitions ---

export type Blog = {
    id: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    revisedAt: string;
    title: string;
    content: string;
    thumbnail?: MicroCMSImage; // Correct field ID from CMS Schema
    targetSites?: string[];    // Selectable Field
    category?: BlogCategory;   // Optional: may be unset on a content entry
};

export type BlogCategory = {
    id: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    revisedAt: string;
    name: string;
}

export type News = {
    id: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    revisedAt: string;
    title: string;
    content: string;
    category: Category;
};

export type Category = {
    id: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    revisedAt: string;
    name: string;
};

export type BlogResponse = {
    totalCount: number;
    offset: number;
    limit: number;
    contents: Blog[];
};

export type NewsResponse = {
    totalCount: number;
    offset: number;
    limit: number;
    contents: News[];
};

// --- Client Initialization ---

export const client = createClient({
    serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN || "YOUR_DOMAIN",
    apiKey: import.meta.env.MICROCMS_API_KEY || "YOUR_API_KEY",
});

// --- Fetch Functions ---

export const getBlogs = async (queries?: MicroCMSQueries): Promise<BlogResponse> => {
    try {
        return await client.get<BlogResponse>({ endpoint: "blogs", queries });
    } catch (error) {
        console.warn("MicroCMS fetch failed. Returning mock data.");
        return {
            totalCount: 1,
            offset: 0,
            limit: 10,
            contents: [
                {
                    id: "1",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    publishedAt: new Date().toISOString(),
                    revisedAt: new Date().toISOString(),
                    title: "【サンプル】API接続エラー",
                    content: "<p>APIキーの設定を確認してください。</p>",
                    thumbnail: { url: "https://placehold.jp/150x150.png", height: 150, width: 150 },
                    category: { id: "info", name: "お知らせ", createdAt: "", updatedAt: "", publishedAt: "", revisedAt: "" },
                    targetSites: ["sample"]
                }
            ]
        };
    }
};

export const getBlogDetail = async (
    contentId: string,
    queries?: MicroCMSQueries
): Promise<Blog | null> => {
    try {
        return await client.getListDetail<Blog>({
            endpoint: "blogs",
            contentId,
            queries,
        });
    } catch (e) {
        // Return null when the article is missing or the fetch fails,
        // so the page can redirect to /404 instead of rendering mock data.
        console.warn(`MicroCMS getBlogDetail failed for id "${contentId}".`);
        return null;
    }
};

export const getNews = async (queries?: MicroCMSQueries): Promise<NewsResponse> => {
    try {
        return await client.get<NewsResponse>({ endpoint: "news", queries });
    } catch (e) {
        return {
            totalCount: 0,
            offset: 0,
            limit: 10,
            contents: []
        };
    }
};

export const getNewsDetail = async (
    contentId: string,
    queries?: MicroCMSQueries
): Promise<News | null> => {
    try {
        return await client.getListDetail<News>({
            endpoint: "news",
            contentId,
            queries,
        });
    } catch (e) {
        return null;
    }
};
