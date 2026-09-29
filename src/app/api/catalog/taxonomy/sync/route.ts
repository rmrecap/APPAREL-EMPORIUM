import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guards';
import { DEFAULT_CATALOG_TAXONOMY, TaxonomyDivision } from '@/lib/catalog-taxonomy';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    // 1. Fetch current taxonomy (custom or default)
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
      } catch (e) {}
    }

    let createdCount = 0;
    let updatedCount = 0;

    // Helper to upsert a category node
    const syncCategory = async (name: string, slug: string, parentId: string | null, order: number) => {
      const existing = await prisma.category.findUnique({ where: { slug } });
      if (existing) {
        await prisma.category.update({
          where: { id: existing.id },
          data: { name, parentId, order, isActive: true }
        });
        updatedCount++;
        return existing.id;
      } else {
        const created = await prisma.category.create({
          data: {
            name,
            slug,
            parentId,
            order,
            isActive: true,
          }
        });
        createdCount++;
        return created.id;
      }
    };

    // Process hierarchy
    for (let divIdx = 0; divIdx < taxonomy.length; divIdx++) {
      const div = taxonomy[divIdx];
      const divId = await syncCategory(div.name, div.slug, null, divIdx * 10);

      for (let deptIdx = 0; deptIdx < div.departments.length; deptIdx++) {
        const dept = div.departments[deptIdx];
        const deptId = await syncCategory(dept.name, dept.slug, divId, deptIdx * 10);

        for (let grpIdx = 0; grpIdx < dept.groups.length; grpIdx++) {
          const grp = dept.groups[grpIdx];
          const grpId = await syncCategory(grp.name, grp.slug, deptId, grpIdx * 10);

          for (let itemIdx = 0; itemIdx < grp.items.length; itemIdx++) {
            const item = grp.items[itemIdx];
            await syncCategory(item.name, item.slug, grpId, itemIdx);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Taxonomy synced successfully: ${createdCount} created, ${updatedCount} updated.`
    });
  } catch (error) {
    console.error('Failed to sync taxonomy to categories table:', error);
    return NextResponse.json({ error: 'Failed to sync taxonomy' }, { status: 500 });
  }
}
