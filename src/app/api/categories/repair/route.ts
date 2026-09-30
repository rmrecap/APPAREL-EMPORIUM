import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guards';
import { repairCategoryRelations } from '@/lib/category-repair';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const guard = await requireAuth();
    if (!guard.ok || !['DEVELOPER', 'SUPER_ADMIN', 'ADMIN'].includes(guard.user.role)) {
        return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    try {
        const result = await repairCategoryRelations();
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error repairing category relations:', error);
        return NextResponse.json({ error: error.message || 'Failed to repair category relations' }, { status: 500 });
    }
}
