import { NextResponse } from 'next/server';
import { requirePermission, requireAuth } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { contactSchema } from '@/lib/validations/submissions';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const guard = await requirePermission('inquiries.view');
        if (!guard.ok) {
            const adminGuard = await requireAuth();
            if (!adminGuard.ok || !['DEVELOPER', 'SUPER_ADMIN', 'ADMIN'].includes(adminGuard.user.role)) {
                return guard.response;
            }
        }

        const { searchParams } = new URL(req.url);
        const limit = searchParams.get('limit');
        const take = limit ? Math.min(parseInt(limit), 100) : 50;

        const inquiries = await prisma.contactInquiry.findMany({
            orderBy: { createdAt: 'desc' },
            take
        });
        const total = await prisma.contactInquiry.count();

        return NextResponse.json({ success: true, inquiries, total });
    } catch (error) {
        console.error("Failed to fetch inquiries:", error);
        return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const clientIp = getClientIp(req);
        const rateLimit = checkRateLimit(`contact:${clientIp}`, 5, 15 * 60 * 1000);
        if (!rateLimit.allowed) {
            return rateLimit.response;
        }

        let body: any;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
        }

        const parseResult = contactSchema.safeParse(body);
        if (!parseResult.success) {
            const formattedErrors = parseResult.error.flatten().fieldErrors;
            const firstErrorMessage = parseResult.error.errors[0]?.message || "Validation failed";
            return NextResponse.json(
                { error: firstErrorMessage, errors: formattedErrors },
                { status: 400 }
            );
        }

        const validData = parseResult.data;

        const inquiry = await prisma.contactInquiry.create({
            data: {
                name: validData.name,
                email: validData.email.toLowerCase(),
                company: validData.company || null,
                phone: validData.phone || null,
                country: validData.country || null,
                message: validData.message,
                productInterest: validData.productInterest || null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            }
        });

        return NextResponse.json(
            { success: true, inquiry },
            {
                headers: {
                    'X-RateLimit-Limit': '5',
                    'X-RateLimit-Remaining': String(rateLimit.remaining),
                }
            }
        );
    } catch (error) {
        console.error("Failed to submit inquiry:", error);
        return NextResponse.json({ error: "Failed to submit form" }, { status: 500 });
    }
}


