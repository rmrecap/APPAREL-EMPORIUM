import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guards';
import { DEFAULT_CATALOG_TAXONOMY, TaxonomyDivision } from '@/lib/catalog-taxonomy';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch custom taxonomy setting if overridden by admin
    const customSetting = await prisma.siteSetting.findUnique({
      where: { key: 'catalog_taxonomy_matrix' }
    });

    let taxonomy: TaxonomyDivision[] = DEFAULT_CATALOG_TAXONOMY;
    if (customSetting?.value) {
      try {
        const parsed = JSON.parse(customSetting.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          taxonomy = parsed;
        }
      } catch (err) {
        console.error('Failed to parse catalog_taxonomy_matrix setting:', err);
      }
    }

    // 2. Fetch all products to aggregate SKU counts by category/tags
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        tags: true,
        category: {
          select: { slug: true, name: true }
        }
      }
    });

    // Helper to compute SKU matches dynamically
    const countMatches = (itemName: string, itemSlug: string) => {
      const needleName = itemName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const needleSlug = itemSlug.toLowerCase().replace(/[^a-z0-9]/g, '');

      return products.filter(p => {
        const catSlug = (p.category?.slug || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const catName = (p.category?.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const prodName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const tags = (p.tags || '').toLowerCase();

        return (
          catSlug.includes(needleSlug) ||
          catName.includes(needleName) ||
          prodName.includes(needleName) ||
          tags.includes(itemName.toLowerCase())
        );
      }).length;
    };

    // Enrich taxonomy with live SKU counts
    const enriched = taxonomy.map(div => ({
      ...div,
      departments: div.departments.map(dept => ({
        ...dept,
        groups: dept.groups.map(grp => ({
          ...grp,
          items: grp.items.map(item => ({
            ...item,
            productCount: countMatches(item.name, item.slug)
          }))
        }))
      }))
    }));

    return NextResponse.json({ success: true, taxonomy: enriched });
  } catch (error) {
    console.error('Failed to load catalog taxonomy:', error);
    return NextResponse.json({ error: 'Failed to load taxonomy' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    const body = await req.json();
    const { taxonomy } = body;

    if (!Array.isArray(taxonomy)) {
      return NextResponse.json({ error: 'Taxonomy must be an array of divisions' }, { status: 400 });
    }

    // Save dynamic taxonomy to site settings
    await prisma.siteSetting.upsert({
      where: { key: 'catalog_taxonomy_matrix' },
      update: { value: JSON.stringify(taxonomy) },
      create: {
        key: 'catalog_taxonomy_matrix',
        value: JSON.stringify(taxonomy),
        group: 'catalog'
      }
    });

    return NextResponse.json({ success: true, message: 'Catalog taxonomy updated successfully' });
  } catch (error) {
    console.error('Failed to update catalog taxonomy:', error);
    return NextResponse.json({ error: 'Failed to update taxonomy' }, { status: 500 });
  }
}
