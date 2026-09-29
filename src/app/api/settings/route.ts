import { NextResponse } from 'next/server';
import { requirePermission, requireAuth } from '@/lib/auth-guards';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/lib/activity-logger';

export const dynamic = 'force-dynamic';

const SENSITIVE_KEYS = new Set([
    'api_external_key',
    'smtp_password',
    'smtp_user',
    'smtp_host',
    'smtp_port',
    'telegram_bot_token',
    'telegram_api_hash',
    'jwt_secret',
]);

function isSensitiveKey(key: string): boolean {
    const lower = key.toLowerCase();
    return SENSITIVE_KEYS.has(lower) || lower.includes('secret') || lower.includes('password') || lower.includes('token');
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const group = searchParams.get('group');

        // Check if caller is authenticated admin
        const session = await getServerSession(authOptions);
        const userRole = (session?.user as any)?.role;
        const isAdmin = session && ['DEVELOPER', 'SUPER_ADMIN', 'ADMIN'].includes(userRole);

        const whereClause: any = {};
        if (group === 'homepage') {
            whereClause.OR = [{ group: 'homepage' }, { key: { startsWith: 'homepage_' } }];
        } else if (group) {
            whereClause.group = group;
        }

        const settings = await prisma.siteSetting.findMany(
            Object.keys(whereClause).length > 0 ? { where: whereClause } : undefined
        );

        const cfg = settings.reduce((acc, curr) => {
            // Block sensitive administrative keys from public unauthenticated responses
            if (!isAdmin && isSensitiveKey(curr.key)) {
                return acc;
            }
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json({ success: true, settings: cfg });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        // Enforce in-handler authorization guard
        const guard = await requirePermission('settings.update');
        let allowed = guard.ok;
        if (!allowed) {
            // Check fallback for super admin / developer
            const adminGuard = await requireAuth();
            if (adminGuard.ok && ['SUPER_ADMIN', 'DEVELOPER'].includes(adminGuard.user.role)) {
                allowed = true;
            } else {
                return guard.response;
            }
        }

        const session = (guard.ok ? guard.session : await getServerSession(authOptions)) as any;
        const data = await req.json();
        const { searchParams } = new URL(req.url);
        const group = searchParams.get('group') || 'general';

        if (data.key !== undefined && data.value !== undefined) {
            const itemGroup = data.group || group;
            await prisma.siteSetting.upsert({
                where: { key: data.key },
                update: { value: String(data.value), group: itemGroup },
                create: { key: data.key, value: String(data.value), group: itemGroup }
            });
        } else {
            for (const [key, value] of Object.entries(data)) {
                if (key === 'group') continue;
                await prisma.siteSetting.upsert({
                    where: { key },
                    update: { value: String(value), group },
                    create: { key, value: String(value), group }
                });
            }
        }

        await logActivity({
            userId: session.user.id,
            action: 'UPDATE',
            entity: 'SiteSetting',
            details: `Updated ${group} settings`,
            request: req as any
        });

        return NextResponse.json({ success: true, message: 'Settings saved successfully' });
    } catch (error: any) {
        console.error("Settings POST Error:", error);
        return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
    }
}
