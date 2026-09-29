import React from 'react';
import { prisma } from '@/lib/prisma';
import { Tags, Edit2, Trash2 } from 'lucide-react';
import CategoryTaxonomyManager from '@/components/admin/CategoryTaxonomyManager';
import { DEFAULT_CATALOG_TAXONOMY, TaxonomyDivision } from '@/lib/catalog-taxonomy';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
    // 1. Fetch current dynamic taxonomy setting
    let catalogTaxonomy: TaxonomyDivision[] = DEFAULT_CATALOG_TAXONOMY;
    try {
        const setting = await prisma.siteSetting.findUnique({
            where: { key: 'catalog_taxonomy_matrix' }
        });
        if (setting?.value) {
            const parsed = JSON.parse(setting.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
                catalogTaxonomy = parsed;
            }
        }
    } catch (e) {
        console.error('Failed to load custom taxonomy in admin:', e);
    }

    // 2. Fetch existing Prisma database categories
    const categories = await prisma.category.findMany({
        include: {
            _count: { select: { products: true } }
        },
        orderBy: { order: 'asc' }
    });

    // Build database category tree
    const categoryMap = new Map();
    categories.forEach(cat => categoryMap.set(cat.id, { ...cat, children: [] }));
    const rootCategories: any[] = [];

    categories.forEach(cat => {
        if (cat.parentId && categoryMap.has(cat.parentId)) {
            categoryMap.get(cat.parentId).children.push(categoryMap.get(cat.id));
        } else {
            rootCategories.push(categoryMap.get(cat.id));
        }
    });

    const renderCategoryRow = (cat: any, depth = 0) => (
        <React.Fragment key={cat.id}>
            <tr className="hover:bg-primary/5 transition-colors group">
                <td className="p-5">
                    <div className="flex items-center gap-3" style={{ paddingLeft: `${depth * 24}px` }}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${depth === 0 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                            <Tags className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className={`font-bold truncate ${depth > 0 ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                {depth > 0 && <span className="text-gray-300 dark:text-gray-600 mr-2">└</span>}
                                {cat.name}
                            </span>
                            <span className={`text-[9px] uppercase font-black tracking-widest ${depth === 0 ? 'text-primary' : depth === 1 ? 'text-blue-500' : 'text-gray-400'}`}>
                                {depth === 0 ? 'Root Level' : depth === 1 ? 'Department / Collection' : 'Item / Sub-Category'}
                            </span>
                        </div>
                    </div>
                </td>
                <td className="p-5 font-mono text-xs text-gray-500 dark:text-gray-400">
                    {cat.slug}
                </td>
                <td className="p-5 text-center">
                    <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300">
                        {cat._count.products} Products
                    </span>
                </td>
                <td className="p-5 text-xs font-bold">
                    {cat.isActive ? (
                        <div className="flex items-center gap-1.5 text-green-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-red-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Inactive
                        </div>
                    )}
                </td>
                <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </td>
            </tr>
            {cat.children.map((child: any) => renderCategoryRow(child, depth + 1))}
        </React.Fragment>
    );

    return (
        <div className="space-y-12 pb-16">
            {/* 1. Dynamic Catalog Taxonomy Matrix Manager */}
            <CategoryTaxonomyManager 
                initialTaxonomy={catalogTaxonomy} 
                categoriesCount={categories.length} 
            />

            {/* 2. Database Category Table Explorer */}
            <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden p-6 sm:p-8">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase font-heading tracking-tight">
                            Database Category Heritage Tree
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Direct Prisma categories currently linked to manufacturer catalog SKUs ({categories.length} records in DB).
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-800">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-black">
                                <th className="p-5">Classification Heritage</th>
                                <th className="p-5">Unique Slug</th>
                                <th className="p-5 text-center">SKU Density</th>
                                <th className="p-5">Visibility</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                            {rootCategories.map((root) => renderCategoryRow(root))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center text-gray-500 font-medium">
                                        No categories found in the database. Click "Sync to DB Categories" above to initialize.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
