import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const SAFE_CATEGORY_FIELDS = {
    id: true,
    name: true,
    slug: true,
    description: true,
    image: true,
    parentId: true,
    order: true,
    isActive: true,
    createdAt: true,
} as const;

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            where: { isActive: true, parentId: null },
            select: {
                ...SAFE_CATEGORY_FIELDS,
                _count: {
                    select: { products: true }
                },
                children: {
                    where: { isActive: true },
                    select: SAFE_CATEGORY_FIELDS,
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: { order: 'asc' }
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const guard = await requireAdmin();
        if (!guard.ok) return guard.response;

        const body = await req.json();

        if (!body.name || !body.slug) {
            return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
        }

        const category = await prisma.category.create({
            data: {
                name: body.name,
                slug: body.slug,
                description: body.description || null,
                image: body.image || null,
                parentId: body.parentId || null,
                order: body.order || 0,
                isActive: body.isActive !== false,
            },
            select: SAFE_CATEGORY_FIELDS
        });
        return NextResponse.json({ success: true, category });
    } catch (error) {
        console.error("Failed to create category:", error);
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
}

