import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const adminMode = searchParams.get('admin') === 'true';

        if (adminMode) {
            // Admin gets all popups
            const guard = await requireSuperAdmin();
            if (!guard.ok) return guard.response;

            const popups = await prisma.popupBanner.findMany({
                orderBy: { createdAt: 'desc' }
            });
            return NextResponse.json({ success: true, popups });
        } else {
            // Public frontend gets active popups checking date ranges natively
            const now = new Date();
            const popups = await prisma.popupBanner.findMany({
                where: {
                    isActive: true,
                    OR: [
                        { startDate: null, endDate: null },
                        { startDate: { lte: now }, endDate: { gte: now } },
                        { startDate: { lte: now }, endDate: null },
                        { startDate: null, endDate: { gte: now } }
                    ]
                }
            });
            return NextResponse.json({ success: true, popups });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const guard = await requireSuperAdmin();
    if (!guard.ok) return guard.response;

    try {
        const body = await req.json();
        const popup = await prisma.popupBanner.create({
            data: {
                name: body.name,
                content: body.content,
                image: body.image,
                ctaText: body.ctaText,
                ctaLink: body.ctaLink,
                trigger: body.trigger,
                triggerValue: body.triggerValue,
                displayPages: body.displayPages,
                showOnce: body.showOnce,
                isActive: body.isActive,
                startDate: body.startDate ? new Date(body.startDate) : null,
                endDate: body.endDate ? new Date(body.endDate) : null
            }
        });
        return NextResponse.json({ success: true, popup });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const guard = await requireSuperAdmin();
    if (!guard.ok) return guard.response;

    try {
        const body = await req.json();
        const { id, ...updateData } = body;

        if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
        if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

        const popup = await prisma.popupBanner.update({
            where: { id },
            data: updateData
        });
        return NextResponse.json({ success: true, popup });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const guard = await requireSuperAdmin();
    if (!guard.ok) return guard.response;

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID missing' }, { status: 400 });

        await prisma.popupBanner.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

