import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const guard = await requireAdmin();
        if (!guard.ok) return guard.response;

        const body = await req.json();
        const category = await prisma.category.update({
            where: { id: params.id },
            data: {
                ...(body.name !== undefined && { name: body.name }),
                ...(body.slug !== undefined && { slug: body.slug }),
                ...(body.description !== undefined && { description: body.description }),
                ...(body.image !== undefined && { image: body.image }),
                ...(body.parentId !== undefined && { parentId: body.parentId || null }),
                ...(body.order !== undefined && { order: Number(body.order) }),
                ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
            }
        });

        return NextResponse.json({ success: true, category });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const guard = await requireAdmin();
        if (!guard.ok) return guard.response;

        await prisma.category.delete({
            where: { id: params.id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete category. Ensure no products are attached." }, { status: 500 });
    }
}
