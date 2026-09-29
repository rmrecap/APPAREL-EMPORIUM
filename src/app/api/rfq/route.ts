import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { rfqSchema } from '@/lib/validations/submissions';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const guard = await requireAuth();
        if (!guard.ok) return guard.response;

        const { searchParams } = new URL(req.url);
        const limit = searchParams.get('limit');
        const isStaff = ['DEVELOPER', 'SUPER_ADMIN', 'ADMIN'].includes(guard.user.role);

        // Tenant Partitioning: non-staff buyers may only access their own RFQs
        const whereClause: any = isStaff
            ? {}
            : { buyerEmail: guard.user.email };

        const take = limit ? Math.min(parseInt(limit), 100) : undefined;

        const rfqs = await prisma.rFQ.findMany({
            where: whereClause,
            take,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                productId: true,
                productName: true,
                buyerName: true,
                buyerEmail: true,
                buyerCompany: true,
                buyerPhone: true,
                buyerCountry: true,
                quantity: true,
                targetPrice: true,
                deliveryDate: true,
                shippingTo: true,
                specialRequirements: true,
                status: true,
                quotedPrice: true,
                quotedAt: true,
                createdAt: true,
                updatedAt: true,
                // Restrict internal admin notes from non-staff buyers
                ...(isStaff && { adminNotes: true }),
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        images: true,
                    }
                }
            }
        });

        const total = await prisma.rFQ.count({ where: whereClause });

        return NextResponse.json({ success: true, rfqs, total });
    } catch (error) {
        console.error("Failed to fetch RFQs:", error);
        return NextResponse.json({ error: "Failed to fetch RFQs" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const clientIp = getClientIp(req);
        const rateLimit = checkRateLimit(`rfq:${clientIp}`, 5, 15 * 60 * 1000);
        if (!rateLimit.allowed) {
            return rateLimit.response;
        }

        let body: any;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
        }

        const parseResult = rfqSchema.safeParse(body);
        if (!parseResult.success) {
            const formattedErrors = parseResult.error.flatten().fieldErrors;
            const firstErrorMessage = parseResult.error.errors[0]?.message || "Validation failed";
            return NextResponse.json(
                { error: firstErrorMessage, errors: formattedErrors },
                { status: 400 }
            );
        }

        const validData = parseResult.data;
        const quantityNum = typeof validData.quantity === 'number'
            ? validData.quantity
            : parseInt(String(validData.quantity).trim(), 10);

        const rfq = await prisma.rFQ.create({
            data: {
                productId: validData.productId || null,
                productName: validData.productName || validData.productDetails || null,
                buyerName: validData.buyerName,
                buyerEmail: validData.buyerEmail.toLowerCase(),
                buyerCompany: validData.buyerCompany || validData.companyName || null,
                buyerPhone: validData.buyerPhone || validData.phone || null,
                buyerCountry: validData.buyerCountry || validData.country || null,
                quantity: quantityNum,
                targetPrice: validData.targetPrice || null,
                deliveryDate: validData.deliveryDate ? new Date(validData.deliveryDate) : null,
                shippingTo: validData.shippingTo || null,
                specialRequirements: validData.specialRequirements || validData.additionalNotes || null,
                status: 'NEW',
            },
            select: {
                id: true,
                productId: true,
                productName: true,
                buyerName: true,
                buyerEmail: true,
                quantity: true,
                status: true,
                createdAt: true,
            }
        });
        return NextResponse.json(
            { success: true, rfq },
            {
                headers: {
                    'X-RateLimit-Limit': '5',
                    'X-RateLimit-Remaining': String(rateLimit.remaining),
                }
            }
        );
    } catch (error) {
        console.error("Failed to submit RFQ:", error);
        return NextResponse.json({ error: "Failed to submit RFQ" }, { status: 500 });
    }
}


