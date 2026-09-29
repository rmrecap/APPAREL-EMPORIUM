import { NextResponse } from 'next/server';
import { requirePermission, requireAuth } from '@/lib/auth-guards';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity-logger';
import { hasPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';


export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const location = url.searchParams.get('location');

        const where = location ? { menuLocation: location } : {};

        const items = await prisma.menuItem.findMany({
            where,
            orderBy: { order: 'asc' },
        });

        // Build nested tree structure
        const buildTree = (items: any[], parentId: string | null = null): any[] => {
            return items
                .filter(item => item.parentId === parentId)
                .map(item => ({
                    ...item,
                    children: buildTree(items, item.id)
                }));
        };

        const tree = buildTree(items, null);

        return NextResponse.json({ success: true, menus: tree, flat: items });
    } catch (error: any) {
        console.error("Menus GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch menus" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const guard = await requirePermission('menus.create');
        let allowed = guard.ok;
        if (!allowed) {
            const adminGuard = await requireAuth();
            if (adminGuard.ok && ['SUPER_ADMIN', 'DEVELOPER'].includes(adminGuard.user.role)) {
                allowed = true;
            } else {
                return guard.response;
            }
        }

        const session = (guard.ok ? guard.session : await getServerSession(authOptions)) as any;
        const data = await req.json();
        const { menuLocation, label, url: menuUrl, target, icon, parentId, isMegaMenu, megaMenuData } = data;

        // Determine order
        const lastItem = await prisma.menuItem.findFirst({
            where: { menuLocation, parentId: parentId || null },
            orderBy: { order: 'desc' },
        });
        const order = lastItem ? lastItem.order + 1 : 0;

        const menuItem = await prisma.menuItem.create({
            data: {
                menuLocation,
                label,
                url: menuUrl,
                target: target || '_self',
                icon: icon || null,
                parentId: parentId || null,
                order,
                isMegaMenu: isMegaMenu || false,
                megaMenuData: megaMenuData ? JSON.stringify(megaMenuData) : null,
                isActive: true
            }
        });

        await logActivity({
            userId: session.user.id,
            action: 'CREATE',
            entity: 'MenuItem',
            entityId: menuItem.id,
            details: `Created menu item: ${label}`,
            request: req as any
        });

        return NextResponse.json({ success: true, menuItem });
    } catch (error: any) {
        console.error("Menus POST Error:", error);
        return NextResponse.json({ error: "Failed to create menu item" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const guard = await requirePermission('menus.update');
        let allowed = guard.ok;
        if (!allowed) {
            const adminGuard = await requireAuth();
            if (adminGuard.ok && ['SUPER_ADMIN', 'DEVELOPER'].includes(adminGuard.user.role)) {
                allowed = true;
            } else {
                return guard.response;
            }
        }

        const data = await req.json();
        const { id, menuLocation, label, url: menuUrl, target, icon, parentId, isMegaMenu, megaMenuData, active } = data;

        const menuItem = await prisma.menuItem.update({
            where: { id },
            data: {
                menuLocation,
                label,
                url: menuUrl,
                target,
                icon,
                parentId: parentId || null,
                isMegaMenu,
                megaMenuData: megaMenuData ? JSON.stringify(megaMenuData) : null,
                isActive: active
            }
        });

        return NextResponse.json({ success: true, menuItem });
    } catch (error: any) {
        console.error("Menus PUT Error:", error);
        return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const guard = await requirePermission('menus.delete');
        let allowed = guard.ok;
        if (!allowed) {
            const adminGuard = await requireAuth();
            if (adminGuard.ok && ['SUPER_ADMIN', 'DEVELOPER'].includes(adminGuard.user.role)) {
                allowed = true;
            } else {
                return guard.response;
            }
        }

        const session = (guard.ok ? guard.session : await getServerSession(authOptions)) as any;
        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        // Function to recursively find all children
        const getChildrenIds = async (parentId: string): Promise<string[]> => {
            const children = await prisma.menuItem.findMany({ where: { parentId } });
            let ids = children.map(c => c.id);
            for (const child of children) {
                const subChildren = await getChildrenIds(child.id);
                ids = [...ids, ...subChildren];
            }
            return ids;
        };

        const idsToDelete = [id, ...(await getChildrenIds(id))];

        await prisma.menuItem.deleteMany({
            where: { id: { in: idsToDelete } }
        });

        await logActivity({
            userId: session.user.id,
            action: 'DELETE',
            entity: 'MenuItem',
            details: `Deleted menu item and its ${idsToDelete.length - 1} children`,
            request: req as any
        });

        return NextResponse.json({ success: true, deletedCount: idsToDelete.length });
    } catch (error: any) {
        console.error("Menus DELETE Error:", error);
        return NextResponse.json({ error: "Failed to delete menu item" }, { status: 500 });
    }
}

