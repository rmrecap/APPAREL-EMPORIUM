import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { autoClassifyProductTaxonomy } from '@/lib/product-classifier';
import { normalizeAndLocalizeIncomingImages } from '@/lib/image-parser';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { products } = body;

        if (!Array.isArray(products) || products.length === 0) {
            return NextResponse.json({ error: 'No data provided' }, { status: 400 });
        }

        let success = 0;
        let failed = 0;
        const errors: string[] = [];

        for (const [index, p] of products.entries()) {
            try {
                if (!p.Name || !p.Category || !p.ShortDescription) {
                    throw new Error('Missing required fields: Name, Category, or ShortDescription');
                }

                let category = await prisma.category.findFirst({
                    where: { name: { equals: String(p.Category) } }
                });

                if (!category) {
                    const catSlug = String(p.Category).toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    category = await prisma.category.create({
                        data: { name: String(p.Category), slug: catSlug }
                    });
                }

                const specifications = {
                    SKU: p.SKU || '',
                    MOQ: p.MOQ || '',
                    Fabric: p.Fabric || '',
                    GSM: p.GSM || '',
                    'Lead Time': p.LeadTime || '',
                    Colors: p.Colors || '',
                    Sizes: p.Sizes || '',
                    Price: p.Price || '',
                };

                const productName = String(p.Name);
                const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

                const classified = autoClassifyProductTaxonomy({
                    name: productName,
                    title: productName,
                    category: String(p.Category),
                    categoryName: category.name,
                    department: p.Department,
                    divisionType: p.DivisionType || p.Division,
                    subCategory: p.SubCategory,
                    description: p.Description || p.ShortDescription,
                    shortDescription: p.ShortDescription,
                    tags: p.Tags,
                });

                const localizedImages = await normalizeAndLocalizeIncomingImages(
                    {
                        images: p.Images || p.images || p.Image || p.image || p.ImageUrl || p.imageUrl || p.Photo || p.photo,
                    },
                    [],
                    {
                        folder: 'products',
                        alt: productName,
                        slug,
                    }
                );

                const finalImages = localizedImages.length > 0 ? localizedImages : ['/images/placeholder-product.svg'];
                const finalDescription = p.Description ? String(p.Description) : String(p.ShortDescription);

                await prisma.product.create({
                    data: {
                        name: productName,
                        title: productName,
                        slug,
                        sku: p.SKU ? String(p.SKU) : undefined,
                        styleNo: p.SKU ? String(p.SKU) : undefined,
                        shortDescription: String(p.ShortDescription),
                        description: finalDescription,
                        categoryId: category.id,
                        divisionType: classified.divisionType,
                        department: classified.department,
                        subCategory: classified.subCategory,
                        fabricComposition: p.Fabric ? String(p.Fabric) : null,
                        gsm: p.GSM ? String(p.GSM) : null,
                        images: JSON.stringify(finalImages),
                        ogImage: finalImages[0] || null,
                        specifications: JSON.stringify(specifications),
                        seoTitle: productName,
                        seoDescription: String(p.ShortDescription).substring(0, 160),
                        isActive: true,
                        isFeatured: p.Featured === 'Yes' || p.Featured === 'true' || p.Featured === true
                    }
                });

                success++;
            } catch (err: any) {
                failed++;
                errors.push(`Row ${index + 2}: ${err.message}`);
            }
        }

        return NextResponse.json({ success, failed, errors });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
