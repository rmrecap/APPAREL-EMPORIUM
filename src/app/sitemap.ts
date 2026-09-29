import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aelbd.net';

    // Static Routes with appropriate priority and change frequency
    const staticPages: { route: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' }[] = [
        { route: '', priority: 1.0, changeFrequency: 'daily' },
        { route: '/products', priority: 0.9, changeFrequency: 'daily' },
        { route: '/about', priority: 0.8, changeFrequency: 'monthly' },
        { route: '/support', priority: 0.8, changeFrequency: 'weekly' },
        { route: '/contact', priority: 0.8, changeFrequency: 'monthly' },
        { route: '/request-quote', priority: 0.8, changeFrequency: 'monthly' },
        { route: '/blog', priority: 0.7, changeFrequency: 'weekly' },
        { route: '/factories', priority: 0.7, changeFrequency: 'monthly' },
        { route: '/faqs', priority: 0.7, changeFrequency: 'monthly' },
        { route: '/privacy-policy', priority: 0.5, changeFrequency: 'monthly' },
        { route: '/terms', priority: 0.5, changeFrequency: 'monthly' },
        { route: '/careers', priority: 0.5, changeFrequency: 'monthly' },
    ];

    const staticRoutes = staticPages.map((item) => ({
        url: `${baseUrl}${item.route}`,
        lastModified: new Date(),
        changeFrequency: item.changeFrequency,
        priority: item.priority,
    }));

    // Dynamic Database Entities
    let products: { slug: string; updatedAt: Date }[] = [];
    let blogs: { slug: string; updatedAt: Date }[] = [];
    let categories: { slug: string }[] = [];

    try {
        [products, blogs, categories] = await Promise.all([
            prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
            prisma.blogPost.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
            prisma.category.findMany({ where: { isActive: true }, select: { slug: true } })
        ]);
    } catch (e) {
        console.error('Error querying database for sitemap:', e);
    }

    const productRoutes = products.map((post) => ({
        url: `${baseUrl}/products/${encodeURIComponent(post.slug)}`,
        lastModified: post.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
    }));

    const blogRoutes = blogs.map((post) => ({
        url: `${baseUrl}/blog/${encodeURIComponent(post.slug)}`,
        lastModified: post.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }));

    const categoryRoutes = categories.map((cat) => ({
        url: `${baseUrl}/products?category=${encodeURIComponent(cat.slug)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [...staticRoutes, ...productRoutes, ...blogRoutes, ...categoryRoutes];
}
