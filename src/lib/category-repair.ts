import { prisma } from './prisma';
import { DEFAULT_CATALOG_TAXONOMY } from './catalog-taxonomy';

/**
 * Ensures all taxonomy divisions, departments, groups, and items exist
 * in the database with proper parent-child relations.
 * Also repairs any orphan categories (e.g. generated categories with -#### suffixes)
 * by linking them to their proper parent or reassigning products to canonical categories.
 */
export async function repairCategoryRelations(): Promise<{
  success: boolean;
  categoriesCreated: number;
  productsRepaired: number;
  message: string;
}> {
  let categoriesCreated = 0;
  let productsRepaired = 0;

  // 1. Seed & ensure full taxonomy tree in database
  for (const div of DEFAULT_CATALOG_TAXONOMY) {
    let dbDiv = await prisma.category.findFirst({
      where: { OR: [{ slug: div.slug }, { name: div.name }] }
    });

    if (!dbDiv) {
      dbDiv = await prisma.category.create({
        data: {
          name: div.name,
          slug: div.slug,
          description: div.tagline || `Production division for ${div.name}`,
          parentId: null,
          isActive: true
        }
      });
      categoriesCreated++;
    }

    for (const dept of div.departments) {
      let dbDept = await prisma.category.findFirst({
        where: { OR: [{ slug: dept.slug }, { name: dept.name }] }
      });

      if (!dbDept) {
        dbDept = await prisma.category.create({
          data: {
            name: dept.name,
            slug: dept.slug,
            description: `Department for ${dept.name}`,
            parentId: dbDiv.id,
            isActive: true
          }
        });
        categoriesCreated++;
      } else if (!dbDept.parentId && dbDiv.id) {
        await prisma.category.update({
          where: { id: dbDept.id },
          data: { parentId: dbDiv.id }
        });
      }

      for (const grp of dept.groups) {
        let dbGrp = await prisma.category.findFirst({
          where: { OR: [{ slug: grp.slug }, { name: grp.name }] }
        });

        if (!dbGrp) {
          dbGrp = await prisma.category.create({
            data: {
              name: grp.name,
              slug: grp.slug,
              description: `Production line for ${grp.name}`,
              parentId: dbDept.id,
              isActive: true
            }
          });
          categoriesCreated++;
        } else if (!dbGrp.parentId && dbDept.id) {
          await prisma.category.update({
            where: { id: dbGrp.id },
            data: { parentId: dbDept.id }
          });
        }

        for (const item of grp.items) {
          let dbItem = await prisma.category.findFirst({
            where: { OR: [{ slug: item.slug }, { name: item.name, parentId: dbGrp.id }] }
          });

          if (!dbItem) {
            dbItem = await prisma.category.create({
              data: {
                name: item.name,
                slug: item.slug,
                description: `Export garment category for ${item.name}`,
                parentId: dbGrp.id,
                order: item.order || 0,
                isActive: true
              }
            });
            categoriesCreated++;
          } else if (!dbItem.parentId && dbGrp.id) {
            await prisma.category.update({
              where: { id: dbItem.id },
              data: { parentId: dbGrp.id }
            });
          }
        }
      }
    }
  }

  // 2. Fetch all categories after sync
  const allCategories = await prisma.category.findMany();
  const catBySlug = new Map<string, typeof allCategories[0]>();
  allCategories.forEach(c => catBySlug.set(c.slug.toLowerCase(), c));

  // Find canonical parent fallbacks
  const womenKnit = catBySlug.get('women-knit-fashion') || catBySlug.get('womens-fashion') || catBySlug.get('fashion');
  const menKnit = catBySlug.get('men-knit-fashion') || catBySlug.get('mens-fashion') || catBySlug.get('fashion');
  const kidsKnit = catBySlug.get('kids-knit-fashion') || catBySlug.get('childrens-fashion') || catBySlug.get('fashion');
  const fashionDiv = catBySlug.get('fashion');

  // 3. Repair orphan categories
  const orphanCats = allCategories.filter(c => !c.parentId && !['fashion', 'hometextiles', 'footwear', 'accessories', 'apparel'].includes(c.slug));

  for (const orphan of orphanCats) {
    let parentToAssign = fashionDiv;
    const s = orphan.slug.toLowerCase();
    const n = orphan.name.toLowerCase();

    if (s.includes('women') || n.includes('women')) {
      parentToAssign = womenKnit || fashionDiv;
    } else if (s.includes('men') || n.includes('men')) {
      parentToAssign = menKnit || fashionDiv;
    } else if (s.includes('kid') || n.includes('kid') || s.includes('baby') || n.includes('baby')) {
      parentToAssign = kidsKnit || fashionDiv;
    }

    if (parentToAssign && parentToAssign.id !== orphan.id) {
      await prisma.category.update({
        where: { id: orphan.id },
        data: { parentId: parentToAssign.id }
      });
    }
  }

  // 4. Inspect products and link to canonical categories if currently on generated random suffix categories
  const products = await prisma.product.findMany({
    include: { category: true }
  });

  for (const prod of products) {
    const curCatSlug = prod.category?.slug?.toLowerCase() || '';
    let targetCanonicalSlug: string | null = null;

    if (curCatSlug.startsWith('womens-sweatshirt') || prod.name.toLowerCase().includes('hoodie') || prod.name.toLowerCase().includes('sweatshirt')) {
      if (prod.name.toLowerCase().includes('women')) targetCanonicalSlug = 'womens-sweatshirt';
      else if (prod.name.toLowerCase().includes('men')) targetCanonicalSlug = 'mens-sweatshirt';
      else targetCanonicalSlug = 'womens-sweatshirt';
    } else if (curCatSlug.startsWith('womens-t-shirt') || (prod.name.toLowerCase().includes('t-shirt') && prod.name.toLowerCase().includes('women'))) {
      targetCanonicalSlug = 'womens-t-shirt';
    } else if (curCatSlug.startsWith('womens-bodysuit')) {
      targetCanonicalSlug = 'womens-undergarments';
    } else if (curCatSlug === 'mens-tshirt' || (prod.name.toLowerCase().includes('t-shirt') && prod.name.toLowerCase().includes('men'))) {
      targetCanonicalSlug = 'mens-t-shirt';
    }

    if (targetCanonicalSlug) {
      const canonicalCat = catBySlug.get(targetCanonicalSlug);
      if (canonicalCat && canonicalCat.id !== prod.categoryId) {
        await prisma.product.update({
          where: { id: prod.id },
          data: {
            categoryId: canonicalCat.id,
            subCategory: targetCanonicalSlug
          }
        });
        productsRepaired++;
      }
    }
  }

  return {
    success: true,
    categoriesCreated,
    productsRepaired,
    message: `Taxonomy synchronized: ${categoriesCreated} categories created/verified, ${productsRepaired} products linked to canonical categories.`
  };
}
