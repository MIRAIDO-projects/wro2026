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
    eyecatch?: MicroCMSImage;
    category: BlogCategory;
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

// TODO: Replace with environment variables in production
// const SERVICE_DOMAIN = import.meta.env.MICROCMS_SERVICE_DOMAIN;
// const API_KEY = import.meta.env.MICROCMS_API_KEY;

// For development/demo without keys, we can use mock data or non-working client.
// User didn't provide keys yet, so we will set up the structure.

export const client = createClient({
    serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN || "YOUR_DOMAIN",
    apiKey: import.meta.env.MICROCMS_API_KEY || "YOUR_API_KEY",
});

// --- Fetch Functions ---

export const getBlogs = async (queries?: MicroCMSQueries) => {
    try {
        return await client.get<BlogResponse>({ endpoint: "blogs", queries });
    } catch (error) {
        console.warn("MicroCMS fetch failed (likely no API key). Returning mock data.");
        // Return mock data for development if fetch fails
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
                    title: "Mock Blog Post",
                    content: "<p>This is a mock blog post because no API key is configured.</p>",
                    category: { id: "tech", name: "Technology", createdAt: "", updatedAt: "", publishedAt: "", revisedAt: "" }
                }
            ] as unknown as Blog[]
        }
    }
};

export const getBlogDetail = async (
    contentId: string,
    queries?: MicroCMSQueries
) => {
    try {
        return await client.getListDetail<Blog>({
            endpoint: "blogs",
            contentId,
            queries,
        });
    } catch (e) {
        return {
            id: contentId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString(),
            revisedAt: new Date().toISOString(),
            title: `Mock Blog Post ${contentId}`,
            content: "<p>This is a mock blog post detail.</p>",
            category: { id: "tech", name: "Technology", createdAt: "", updatedAt: "", publishedAt: "", revisedAt: "" }
        } as unknown as Blog;
    }
};

export const getNews = async (queries?: MicroCMSQueries) => {
    try {
        return await client.get<NewsResponse>({ endpoint: "news", queries });
    } catch (e) {
        return {
            totalCount: 0,
            offset: 0,
            limit: 10,
            contents: []
        }
    }
};

export const getNewsDetail = async (
    contentId: string,
    queries?: MicroCMSQueries
) => {
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
