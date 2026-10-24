import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guards';
import { getGSCReport } from '@/lib/gsc-service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
        const secretKey = req.headers.get('x-ael-secret');
        const validKey = process.env.EXTERNAL_API_KEY || 'ae_1y7wso8ijykx7rbc';
        const validSecret = process.env.AEL_API_SECRET || process.env.API_SECRET_KEY || 'ael_secret_key_2026_xyz';

        const isApiKeyAuthorized = (apiKey && apiKey === validKey) || (secretKey && secretKey === validSecret);

        if (!isApiKeyAuthorized) {
            const authResult = await requireAuth();
            if (!authResult.ok) {
                return authResult.response;
            }

            const allowedRoles = ['DEVELOPER', 'SUPER_ADMIN', 'ADMIN', 'VIEWER'];
            if (!allowedRoles.includes(authResult.user.role)) {
                return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
            }
        }

        const { searchParams } = new URL(req.url);
        const daysParam = parseInt(searchParams.get('days') || '28', 10);
        const report = await getGSCReport(daysParam);

        return NextResponse.json(report);
    } catch (error: any) {
        console.error('[Admin GSC Report API Error]', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch Google Search Console report',
            },
            { status: 500 }
        );
    }
}
