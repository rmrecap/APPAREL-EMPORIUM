import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const guard = await requireAdmin();
        if (!guard.ok) return guard.response;

        const forms = await prisma.customForm.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { submissions: true }
                }
            }
        });

        return NextResponse.json({ success: true, forms });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch custom forms" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const guard = await requireAdmin();
        if (!guard.ok) return guard.response;

        const body = await req.json();

        if (!body.name || !body.slug) {
            return NextResponse.json({ error: "Form name and slug are required" }, { status: 400 });
        }

        const form = await prisma.customForm.create({
            data: {
                name: body.name,
                slug: body.slug,
                description: body.description || null,
                fields: typeof body.fields === 'string' ? body.fields : JSON.stringify(body.fields || []),
                submitEmail: body.submitEmail || null,
                successMessage: body.successMessage || null,
                isActive: body.isActive !== false
            }
        });

        return NextResponse.json({ success: true, form });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create custom form" }, { status: 500 });
    }
}

