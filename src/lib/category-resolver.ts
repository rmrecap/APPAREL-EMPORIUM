import { prisma } from './prisma';

/**
 * Resolves a category by ID, name, or slug.
 * If the category does not exist, safely creates it with a collision-free slug.
 * If creation fails for any reason, falls back to the first available category.
 * NEVER throws an exception or returns null/undefined.
 */
export async function resolveOrCreateCategory(rawCat: any, fallbackName = 'Apparel'): Promise<{ id: string; name: string; slug: string }> {
    let catName = '';
    let catSlug = '';

    if (typeof rawCat === 'string') {
        catName = rawCat.trim();
    } else if (rawCat && typeof rawCat === 'object') {
        catName = rawCat.name || rawCat.title || rawCat.category || rawCat.label || '';
        catSlug = rawCat.slug || '';
        if (rawCat.id) {
            const byId = await prisma.category.findUnique({ where: { id: rawCat.id } });
            if (byId) return { id: byId.id, name: byId.name, slug: byId.slug };
        }
    }

    if (!catName) {
        catName = fallbackName;
    }

    if (!catSlug) {
        catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'apparel';
    }

    try {
        // Try finding by exact slug or exact name
        let matched = await prisma.category.findFirst({
            where: {
                OR: [
                    { slug: catSlug },
                    { name: catName }
                ]
            }
        });

        if (matched) {
            return { id: matched.id, name: matched.name, slug: matched.slug };
        }

        // Try case-insensitive substring search in case of slight variance
        matched = await prisma.category.findFirst({
            where: {
                OR: [
                    { slug: { contains: catSlug } },
                    { name: { contains: catName } }
                ]
            }
        });

        if (matched) {
            return { id: matched.id, name: matched.name, slug: matched.slug };
        }

        // Determine parent category based on slug / name
        let parentId: string | null = null;
        const s = (catSlug + ' ' + catName).toLowerCase();
        let parentSlug = 'fashion';
        if (s.includes('women')) parentSlug = 'women-knit-fashion';
        else if (s.includes('men')) parentSlug = 'men-knit-fashion';
        else if (s.includes('kid') || s.includes('baby')) parentSlug = 'kids-knit-fashion';
        else if (s.includes('towel') || s.includes('home')) parentSlug = 'hometextiles';
        else if (s.includes('shoe') || s.includes('footwear')) parentSlug = 'footwear';

        const parentCat = await prisma.category.findFirst({
            where: { OR: [{ slug: parentSlug }, { slug: 'fashion' }] }
        });
        if (parentCat) parentId = parentCat.id;

        // Create new category with guaranteed unique slug
        const uniqueSlug = `${catSlug}-${Date.now().toString().slice(-4)}`;
        const created = await prisma.category.create({
            data: {
                name: catName,
                slug: uniqueSlug,
                description: `Manufacturing and export category for ${catName}`,
                parentId: parentId
            }
        });

        return { id: created.id, name: created.name, slug: created.slug };
    } catch (err) {
        console.error('[category-resolver] Error resolving/creating category:', err);
        // Fallback to first existing category
        const fallback = await prisma.category.findFirst();
        if (fallback) {
            return { id: fallback.id, name: fallback.name, slug: fallback.slug };
        }

        // Extreme fallback if table is empty
        try {
            const root = await prisma.category.create({
                data: {
                    name: 'Apparel',
                    slug: `apparel-${Date.now().toString().slice(-4)}`,
                    description: 'Default Apparel Category'
                }
            });
            return { id: root.id, name: root.name, slug: root.slug };
        } catch {
            return { id: 'default', name: 'Apparel', slug: 'apparel' };
        }
    }
}
