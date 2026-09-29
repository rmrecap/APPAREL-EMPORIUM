import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity-logger';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request) {
    try {
        const guard = await requireSuperAdmin();
        if (!guard.ok) return guard.response;

        const data = await req.json();
        const { items } = data; // Expected: [{ id: '...', order: 0, parentId: '...' }, ...]

        if (!Array.isArray(items)) {
            return NextResponse.json({ error: "Invalid data payload" }, { status: 400 });
        }

        // Use a transaction for bulk update
        await prisma.$transaction(
            items.map((item: any) =>
                prisma.menuItem.update({
                    where: { id: item.id },
                    data: {
                        order: item.order,
                        parentId: item.parentId || null
                    }
                })
            )
        );

        await logActivity({
            userId: guard.user.id,
            action: 'UPDATE',
            entity: 'MenuItem',
            details: `Reordered and nested ${items.length} menu items`,
            request: req as any
        });

        return NextResponse.json({ success: true, count: items.length });
    } catch (error: any) {
        console.error("Menus Reorder Error:", error);
        return NextResponse.json({ error: "Failed to reorder menus" }, { status: 500 });
    }
}

