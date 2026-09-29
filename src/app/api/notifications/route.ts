import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const guard = await requireAuth();
    if (!guard.ok) return guard.response;

    try {
        const { searchParams } = new URL(req.url);
        const unread = searchParams.get('unread') === 'true';
        const type = searchParams.get('type');
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
        const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);

        const where: any = { userId: guard.user.id };
        if (unread) where.isRead = false;
        if (type && type !== 'ALL') where.type = type;

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: (page - 1) * limit
            }),
            prisma.notification.count({ where })
        ]);

        return NextResponse.json({ success: true, notifications, total });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const guard = await requireAuth();
    if (!guard.ok) return guard.response;

    try {
        const { id, isRead } = await req.json();

        await prisma.notification.update({
            where: { id, userId: guard.user.id }, // Security constraint bounding mutator only against owner
            data: { isRead: Boolean(isRead) }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const guard = await requireAuth();
    if (!guard.ok) return guard.response;

    try {
        const id = new URL(req.url).searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await prisma.notification.delete({
            where: { id, userId: guard.user.id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Internal programmatic proxy to create notifications explicitly bound from internal Node streams
export async function POST(req: NextRequest) {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;

    try {
        const { targetUserId, type, title, message } = await req.json();

        if (!targetUserId || !title || !message) {
            return NextResponse.json({ error: 'Missing required notification fields' }, { status: 400 });
        }

        const notification = await prisma.notification.create({
            data: { userId: targetUserId, type: type || 'INFO', title, message }
        });
        return NextResponse.json({ success: true, notification });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

